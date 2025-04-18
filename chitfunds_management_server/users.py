from google_authorize import spreadsheet_credentials
import uuid
from datetime import datetime, timedelta
import pandas as pd
from collections import defaultdict
import json


def create_new_user(data):

    user = [
        str(uuid.uuid4().hex[:12]),
        str(data.get("full_name")),
        str(data.get("email")),
        str("123456"),
        str(data.get("phone")),
        str(data.get("aadhaar_number")),
        str(data.get("pan_number")),
        str(data.get("address")),
        str(data.get("city")),
        str(data.get("state")),
        str(data.get("pincode")),
        datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        str("TRUE"),
        datetime.now().strftime("%Y-%m-%d %H:%M:%S")     
    ]

    print(user)
    
    users = spreadsheet_credentials().worksheet("users")
    users_sheet = users.get_all_records()

    print(users_sheet)

    if not users_sheet:
        users.append_row(user)
        return {"message": "Successfully created the first user"}
    df = pd.DataFrame(users_sheet)

    df["phone"] = df["phone"].astype(str)
    df["aadhaar_number"] = df["aadhaar_number"].astype(str)
    df["pan_number"] = df["pan_number"].astype(str)   

    if data.get("phone") in df["phone"].values:
        return {"message": f"User with phone number {data['phone']} already exists."}
    elif data.get("aadhaar_number") in df["aadhaar_number"].values:
        return {"message": f"User with Aadhaar number {data['aadhaar_number']} already exists."}
    elif data.get("pan_number") in df["pan_number"].values:
        return {"message": f"User with PAN number {data['pan_number']} already exists."}
    
    users.append_row(user)
    return { "message" :f"Successfully created a new user"}

def get_chit_groups_by_user_id(user_id):


    chit_groups = spreadsheet_credentials().worksheet("chit_groups")
    chit_groups_sheet = chit_groups.get_all_records()
    df_chit_groups = pd.DataFrame(chit_groups_sheet)

    chit_members = spreadsheet_credentials().worksheet("chit_members")
    chit_members_sheet  = chit_members.get_all_records()
    df_chit_members= pd.DataFrame(chit_members_sheet)

    chit_groups = df_chit_members[df_chit_members["user_id"] == user_id]
    

    chit_group_ids = chit_groups["chit_group_id"].unique()

   
    # Filter active chits only
    active_chits = df_chit_groups[(df_chit_groups["chit_group_id"].isin(chit_group_ids)) & 
                                  (df_chit_groups["status"] == "active")]


    merge = pd.merge(chit_groups , active_chits, on="chit_group_id", how="inner")
    merge["user_id"] = user_id

    result = merge[["chit_group_id", "chit_member_id", "chit_name" , "chit_amount", "user_id"]].to_dict(orient="records")

    return result

def get_unpaid_installments(user_id):

    chit_groups = spreadsheet_credentials().worksheet("chit_groups")
    chit_group_sheet = chit_groups.get_all_records()
    chit_group_df = pd.DataFrame(chit_group_sheet)

    chit_group_members = spreadsheet_credentials().worksheet("chit_members")
    chit_members_sheet  =chit_group_members.get_all_records()
    chit_members_df = pd.DataFrame(chit_members_sheet)

     # Read installments
    installments = spreadsheet_credentials().worksheet("installments")
    installments_sheet = installments.get_all_records()
    instllments_df = pd.DataFrame(installments_sheet)

    active_chits_members = chit_members_df[chit_members_df["user_id"] == user_id]

    print(active_chits_members)

    chits_groups = chit_group_df[chit_group_df["chit_group_id"].isin(active_chits_members["chit_group_id"]) & (chit_group_df["status"] == "active")]

    print(chits_groups)

    active_chits = chits_groups.merge(active_chits_members , on="chit_group_id" , how="inner")

    print(active_chits)


    unpaid_installments = instllments_df[(instllments_df["chit_member_id"].isin(active_chits["chit_member_id"])) & (instllments_df["status"] == "unpaid")]

    print(unpaid_installments)

    unpaid_installments["total_amount"] = pd.to_numeric(unpaid_installments["total_amount"], errors="coerce")
    unpaid_installments["paid_amount"] = pd.to_numeric(unpaid_installments["paid_amount"], errors="coerce").fillna(0)

    unpaid_installments["overdue_amount"] = unpaid_installments["total_amount"] - unpaid_installments["paid_amount"].fillna(0)

    print(unpaid_installments)

    results = unpaid_installments.merge(active_chits, on="chit_member_id" , how="left")

    print(results)

    results = results.to_dict(orient="records")


    grouped_data = {}

    for item in results:
        key = (item['chit_name'], item['chit_group_id'], item['chit_member_id'])

        if key not in grouped_data:
            grouped_data[key] = {
                "chit_name": item["chit_name"],
                "chit_group_id": item["chit_group_id"],
                "chit_member_id": item["chit_member_id"],
                "unpaid_installments": []
            }

        grouped_data[key]["unpaid_installments"].append({
            "installment_id": item["installment_id"],
            "month_number": item["month_number"],
            "total_amount": item["total_amount"],
            "paid_amount": item["paid_amount"],
            "overdue_amount": item["overdue_amount"],
            "status": item["status_x"]
        })

    # Convert to list format
    result = list(grouped_data.values())

    print(json.dumps(result, indent=2))

    return result



def get_members():

    users = spreadsheet_credentials().worksheet("users")
    chit_members = spreadsheet_credentials().worksheet("chit_members")
    chit_groups  = spreadsheet_credentials().worksheet("chit_groups")


    users_sheet = users.get_all_records()
    chit_members_sheet = chit_members.get_all_records()
    chit_groups_sheet = chit_groups.get_all_records()


    df_users = pd.DataFrame(users_sheet)
    df_chit_members = pd.DataFrame(chit_members_sheet)
    df_chit_groups = pd.DataFrame(chit_groups_sheet)

    active_chits = df_chit_groups[df_chit_groups["status"] == "active"]
    # Merge to get only active chit memberships
    df_active_chits = df_chit_members.merge(active_chits, on="chit_group_id", how="inner")
   

    chit_count = df_active_chits.groupby("user_id")["chit_group_id"].count().reset_index()
    chit_count.rename(columns={"chit_group_id": "chit_count"}, inplace=True)

    # Merge chit count with user data
    df_merged = df_users.merge(chit_count, on="user_id", how="left").fillna(0)

    # Display results
    print(df_merged[["full_name", "email", "chit_count"]])

    result_dict = df_merged[["user_id","full_name", "email", "phone","chit_count"]].to_dict(orient="records")

    return result_dict

    

def get_users_chit_details(user_id):
    # Read Chit Members Table
    chit_members_ws = spreadsheet_credentials().worksheet("chit_members")
    chit_members_data = chit_members_ws.get_all_records()
    chit_members_df = pd.DataFrame(chit_members_data)

    # Read Users Table
    users_ws = spreadsheet_credentials().worksheet("users")
    users_data = users_ws.get_all_records()
    users_df = pd.DataFrame(users_data)

    # Read Chit Groups Table
    chit_groups_ws = spreadsheet_credentials().worksheet("chit_groups")
    chit_groups_data = chit_groups_ws.get_all_records()
    chit_groups_df = pd.DataFrame(chit_groups_data)


    # Read installments
    installments = spreadsheet_credentials().worksheet("installments")
    installments_sheet = installments.get_all_records()
    instllments_df = pd.DataFrame(installments_sheet)

    user = users_df[users_df["user_id"] == user_id]
    print(user)

    user_information = user[["full_name" , "email" , "phone" , "address" , "state" , "city" ,"user_id" , "city" , "pincode", "is_verified"]].to_dict(orient="records")



    # Get list of chit_group_id for the user
    user_chits = chit_members_df[chit_members_df["user_id"] == user_id]["chit_group_id"].unique()
    
    print(user_chits)
    # Filter active chits only
    active_chits = chit_groups_df[(chit_groups_df["chit_group_id"].isin(user_chits)) & 
                                  (chit_groups_df["status"] == "active")]
    
  
    print(active_chits)
    chit_count= active_chits.shape[0]
    print(chit_count)
    if active_chits.empty:
        user_details = {
            "user" : user_information[0],
            "current_month_payment" : [],
            "payment_overdues" : [],
            "chit_count" : int(chit_count),
            "current_total_amount" : int(0)

         }
        return user_details

    # Get members of active chit groups
    active_chit_groups = active_chits["chit_group_id"].tolist()

    print(active_chit_groups)
    chit_members_of_active_chit_group = chit_members_df[(chit_members_df["chit_group_id"].isin(active_chit_groups)) & 
                                   (chit_members_df["user_id"] == user_id)]
    
    print(chit_members_of_active_chit_group)
    chit_groups_members = chit_members_of_active_chit_group[["chit_member_id", "chit_group_id"]].to_dict(orient="records")
    print(chit_groups_members)
    chit_member_ids = chit_members_of_active_chit_group["chit_member_id"]
    print(chit_member_ids)
    

    unpaid_df = instllments_df[(instllments_df["chit_member_id"].isin(chit_member_ids))]

    print(unpaid_df)
    overdue_member_chit_groups = member_overdue_amounts(unpaid_df,chit_groups_members)

    print(overdue_member_chit_groups)
    
    active_chits_df = pd.DataFrame(active_chits)

    # Convert start_date to datetime
    active_chits_df["start_date"] = pd.to_datetime(active_chits_df["start_date"])

    # Get today's date (Example: June 15, 2025)
    today = datetime.today()

    # Calculate current month of the chit

    current_month = ((today.year - active_chits_df["start_date"].dt.year) * 12 +
                                    (today.month - active_chits_df["start_date"].dt.month) + 1).clip(upper=active_chits_df["duration_months"])
    active_chits_df["current_month"] = current_month
    
    print(active_chits_df[["chit_group_id", "chit_name", "current_month"]])

    result = pd.merge(overdue_member_chit_groups, active_chits_df, on="chit_group_id", how="inner")

    payment_overdues = result[["chit_group_id","chit_member_id","chit_name" , "overdue_months" , "total_overdue_amount"]].to_dict(orient="records")

    
     # Step 4: Get current month's installments
    merged_installments = unpaid_df.merge(chit_members_of_active_chit_group, on="chit_member_id")

    upgrade_merged_installments = merged_installments.merge(active_chits_df, on="chit_group_id")

    current_month_installments = upgrade_merged_installments[
    upgrade_merged_installments["month_number"] == upgrade_merged_installments["current_month"]
    ]

    # merged_installments["current_month"] = 

    
    total_sum = current_month_installments["total_amount"].sum()
    print(total_sum)

    current_month_payment = current_month_installments[["chit_member_id" , "chit_group_id" , "chit_name" , "month_number" , "total_amount" , "status_x"]].to_dict(orient="records")

    

    user_details = {
        "user" : user_information[0],
        "current_month_payment" : current_month_payment,
        "payment_overdues" : payment_overdues,
        "chit_count" : int(chit_count),
        "current_total_amount" : int(total_sum)

    }

    print(user_details)

    

    return user_details

    
    
    
def get_current_month_projections_data(monthly_projections_df , chit_group_df):
    result = []

    for _,row in chit_group_df.iterrows():
        chit_group_id = row["chit_group_id"]
        current_month = row["current_month"]

         # Filter monthly projections data
        filtered_data = monthly_projections_df[
            (monthly_projections_df["chit_group_id"] == chit_group_id) &
            (monthly_projections_df["month_number"] == current_month)
        ]
        
        # Convert result to dictionary and append
        result.extend(filtered_data.to_dict(orient="records"))
    
    return result


def member_overdue_amounts(df,chit_group_ids):
    df["due_date"] = pd.to_datetime(df["due_date"], errors="coerce")

    # Get today's date
    today = datetime.today()

    df["total_amount"] = pd.to_numeric(df["total_amount"], errors="coerce").fillna(0)
    df["paid_amount"] = pd.to_numeric(df["paid_amount"], errors="coerce").fillna(0)

    # Calculate remaining unpaid amount
    df["overdue_amount"] = df["total_amount"] - df["paid_amount"]

    # Filter overdue installments (status unpaid + past due date + unpaid balance)
    overdue_df = df[
        (df["status"].str.lower() == "unpaid") &  # Unpaid status
        (df["overdue_amount"] > 0)  # Only consider unpaid amounts
    ]


    # Group by chit_member_id to calculate total overdue amount and overdue months
    overdue_summary = overdue_df.groupby("chit_member_id").agg(
        total_overdue_amount=("overdue_amount", "sum"),
        overdue_months=("installment_id", "count")  # Count months with overdue
    ).reset_index()

    group_df = pd.DataFrame(chit_group_ids)

    merged_df = pd.merge(overdue_summary, group_df, on="chit_member_id", how="left")


    return merged_df 
    # Convert to JSON format
    overdue_json = merged_df.to_dict(orient="records")

    print(overdue_json)


def get_all_member_installments(member_id):


    # Read installments
    installments = spreadsheet_credentials().worksheet("installments")
    installments_sheet = installments.get_all_records()
    instllments_df = pd.DataFrame(installments_sheet)

    results = instllments_df[instllments_df["chit_member_id"] == member_id ]

    print(results)

    return results.to_dict(orient="records")


def get_current_month_payment_stats():


    # Read Chit Members Table
    chit_members_ws = spreadsheet_credentials().worksheet("chit_members")
    chit_members_data = chit_members_ws.get_all_records()
    chit_members_df = pd.DataFrame(chit_members_data)

    monthly_projections = spreadsheet_credentials().worksheet("monthly_projections")
    monthly_projections_sheet  = monthly_projections.get_all_records()
    monthly_projections_df = pd.DataFrame(monthly_projections_sheet)

    # Read installments
    installments = spreadsheet_credentials().worksheet("installments")
    installments_sheet = installments.get_all_records()
    installments_df = pd.DataFrame(installments_sheet)
    # Read Chit Groups Table
    chit_groups_ws = spreadsheet_credentials().worksheet("chit_groups")
    chit_groups_data = chit_groups_ws.get_all_records()
    chit_groups_df = pd.DataFrame(chit_groups_data)
    chit_groups_df["start_date"] = pd.to_datetime(chit_groups_df["start_date"])

    active_chits_df = chit_groups_df[(chit_groups_df["status"] == "active")]

    # Step 2: Calculate the current month for each active chit
    today = datetime.today()
    active_chits_df["current_month"] = (
        ((today.year - active_chits_df["start_date"].dt.year) * 12) +
        (today.month - active_chits_df["start_date"].dt.month) + 1
    ).clip(upper=active_chits_df["duration_months"])
    
    # print(active_chits_df)

    active_members_df = chit_members_df[chit_members_df["chit_group_id"].isin(active_chits_df["chit_group_id"])]

    # print(active_members_df)

    monthly_projections_current_month  = active_chits_df[['chit_group_id', 'current_month']].merge(
    monthly_projections_df,
    left_on=['chit_group_id', 'current_month'],
    right_on=['chit_group_id', 'month_number'],
    how='inner'
)
    
    monthly_projections_current_month['user_id'] = monthly_projections_current_month["user_id"].replace('', 0).fillna(0)
    # print(monthly_projections_current_month)

    unpaid_monthly_projections = monthly_projections_current_month[monthly_projections_current_month['user_id'] == 0]

    # print(unpaid_monthly_projections)

    unpaid_current_monthly_projections_total = unpaid_monthly_projections['total_payout'].sum()

    # print(unpaid_current_monthly_projections_total)

    

    # Step 4: Get current month's installments
    merged_installments = installments_df.merge(active_members_df, on="chit_member_id")

    # Merge to get the correct month for each chit group
    merged_installments = merged_installments.merge(
        active_chits_df[["chit_group_id", "current_month"]],
        on="chit_group_id"
    )

    # print(merged_installments)

    # Filter installments for the current month of the respective chit groups
    current_month_installments = merged_installments[
    merged_installments["month_number"] == merged_installments["current_month"]
    ]

    # print(current_month_installments)
    # print(current_month_installments[["total_amount", "paid_amount"]].dtypes)
    current_month_installments["total_amount"] = pd.to_numeric(current_month_installments["total_amount"], errors="coerce")
    current_month_installments["paid_amount"] = pd.to_numeric(current_month_installments["paid_amount"], errors="coerce")


    # Step 5: Calculate due, paid, and unpaid amounts per chit group
    final_result = current_month_installments.groupby("chit_group_id").agg(
        total_due_this_month=("total_amount", "sum"),
        total_paid_this_month=("paid_amount", "sum")
    ).reset_index()

    # print(final_result)
    # print(final_result["total_paid_this_month"])
    # Calculate total unpaid
    final_result["total_unpaid_this_month"] = final_result["total_due_this_month"] - final_result["total_paid_this_month"]

    # print(final_result)

    data = final_result[["total_unpaid_this_month","total_due_this_month","total_paid_this_month"]].to_dict(orient="records")

    total_unpaid_amount = installments_df[installments_df["status"] == "unpaid"]
    total_unpaid_amount['paid_amount'] = total_unpaid_amount['paid_amount'].replace('', 0).fillna(0)
    total_unpaid_amount["total_amount"] = pd.to_numeric(total_unpaid_amount["total_amount"], errors="coerce")
    total_unpaid_amount["paid_amount"] = pd.to_numeric(total_unpaid_amount["paid_amount"], errors="coerce")

    total_unpaid_amount["overdue_amount"] = total_unpaid_amount["total_amount"] - total_unpaid_amount["paid_amount"]


    # print(total_unpaid_amount)

    total_overdue = total_unpaid_amount['overdue_amount'].sum()
    print("Total Overdue Amount:", total_overdue)

    data_df = pd.DataFrame(data)
    # print(data_df)
    totals = data_df.sum()

    result = totals.to_dict()

    result['total_unpaid_this_month'] = int(total_overdue)
    result['unpaid_current_month_projections'] = int(unpaid_current_monthly_projections_total)

    print(result)

    return result


def process_payment(data):


    print(data)
    print(data.get("installments")
          )

    # Read installments
    installments = spreadsheet_credentials().worksheet("installments")
    installments_sheet = installments.get_all_records()
    installments_df = pd.DataFrame(installments_sheet)

    payments = spreadsheet_credentials().worksheet("payments")


    # Convert installment_id to string for easy lookup
    installments_df["installment_id"] = installments_df["installment_id"].astype(str)

    installment_ids = [str(inst["installment_id"]) for inst in data["installments"]]
    print(installment_ids)
    payment_amount = data["total_amount"]
    print(payment_amount)

    unique_chit_member_ids = list({inst["chit_member_id"] for inst in data['installments']})
    print(unique_chit_member_ids)

    for idx, row in installments_df.iterrows():
        if row["installment_id"] in installment_ids:
            # print(idx)
            # print(row)
            due_amount = row["total_amount"] - (row["paid_amount"] or 0)
            print(due_amount)

            if payment_amount >= due_amount:
                print("inside the more amount")
                installments_df.at[idx, "paid_amount"] = row["total_amount"]
                installments_df.at[idx, "status"] = "paid"
                payment_amount -= due_amount
            else:
                installments_df.at[idx, "paid_amount"] = (row["paid_amount"] or 0) + payment_amount
                installments_df.at[idx, "status"] = "unpaid"
                payment_amount = 0  # Stop processing if payment is exhausted

            if payment_amount == 0:
                break  # No more funds left to distribute
    
    for idx, row in installments_df.iterrows():
        if row["installment_id"] in installment_ids:
            print(row)

    payment = [
        str(uuid.uuid4().hex[:18]),
        str(", ".join(unique_chit_member_ids)),
        str(", ".join(installment_ids)),
        data["total_amount"],
        datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        int(data["cash_amount"]),
        int(data["online_amount"]),
        str(data["online_payment_method"]),
        str(data["reference_number"]),
        str("success")
    ]

    print(payment)

    result = payments.append_row(payment)
    if result: 
        installments.update([installments_df.columns.values.tolist()] + installments_df.values.tolist())

    return {"message": "Payment processed successfully"}


def get_payments():

    chit_groups = spreadsheet_credentials().worksheet("chit_groups")
    chit_groups_sheet = chit_groups.get_all_records()
    chit_groups_df = pd.DataFrame(chit_groups_sheet)

    chit_members = spreadsheet_credentials().worksheet("chit_members")
    chit_members_sheet = chit_members.get_all_records()
    chit_members_df = pd.DataFrame(chit_members_sheet)

    # Read Users Table
    users_ws = spreadsheet_credentials().worksheet("users")
    users_data = users_ws.get_all_records()
    users_df = pd.DataFrame(users_data)

    payments = spreadsheet_credentials().worksheet("payments")
    payments_sheet = payments.get_all_records()
    payments_df = pd.DataFrame(payments_sheet)

    df_merged = payments_df.merge(chit_members_df, on="chit_member_id" , how="left")

    print(df_merged)

    df_merged = df_merged.merge(chit_groups_df[["chit_group_id" , "chit_name"]], on="chit_group_id", how="left")

    print(df_merged)

    df_merged = df_merged.merge(users_df[["user_id" , "full_name"]] , on="user_id" , how="left")

    print(df_merged)

    df_merged["payment_date"] = pd.to_datetime(df_merged['payment_date'])

    df_merged = df_merged.sort_values(by='payment_date', ascending=False)

    df_final = df_merged[['payment_id', "user_id" , "chit_group_id",'full_name', 'chit_name', 'payment_amount', 'payment_date', "reference_number", 'payment_method', 'payment_status']]

    print(df_final)

    return df_final.to_dict(orient="records")


def chit_group_payments(chit_group_id):

    chit_groups = spreadsheet_credentials().worksheet("chit_groups")
    chit_groups_sheet = chit_groups.get_all_records()
    chit_groups_df = pd.DataFrame(chit_groups_sheet)

    chit_members = spreadsheet_credentials().worksheet("chit_members")
    chit_members_sheet = chit_members.get_all_records()
    chit_members_df = pd.DataFrame(chit_members_sheet)

    # Read Users Table
    users_ws = spreadsheet_credentials().worksheet("users")
    users_data = users_ws.get_all_records()
    users_df = pd.DataFrame(users_data)

    payments = spreadsheet_credentials().worksheet("payments")
    payments_sheet = payments.get_all_records()
    payments_df = pd.DataFrame(payments_sheet)

    chit_group = chit_groups_df[chit_groups_df["chit_group_id"] == chit_group_id]

    print(chit_group)

    chit_group_members = chit_members_df[chit_members_df["chit_group_id"] == chit_group_id]

    print(chit_group_members)

    chit_group_members = chit_group_members.merge(chit_group , on="chit_group_id" , how="inner")



    print(chit_group_members)

    chit_group_members = chit_group_members.merge(users_df,on="user_id" , how="inner")

    print(chit_group_members)

    chit_member_ids = chit_group_members['chit_member_id'].tolist()

    print(chit_member_ids)

    chit_members_payments = payments_df[payments_df['chit_member_id'].isin(chit_member_ids)]

    print(chit_members_payments)

    final = chit_members_payments.merge(chit_group_members, on="chit_member_id" , how="inner")

    print(final)

    final['payment_date'] = pd.to_datetime(final['payment_date'])

    final = final.sort_values(by='payment_date', ascending=False)

    result = final[["chit_member_id", "full_name" , "chit_name" , "user_id" , "chit_group_id","payment_date" , "payment_amount", "payment_method" , "reference_number" , "payment_status"]].to_dict(orient="records")

    print(result)

    return result


def generate_current_month_installments(chit_group_id):

    chit_groups = spreadsheet_credentials().worksheet("chit_groups")
    chit_groups_sheet = chit_groups.get_all_records()
    chit_groups_df = pd.DataFrame(chit_groups_sheet)
    chit_groups_df["start_date"] = pd.to_datetime(chit_groups_df["start_date"])

    chit_members = spreadsheet_credentials().worksheet("chit_members")
    chit_members_sheet = chit_members.get_all_records()
    chit_members_df = pd.DataFrame(chit_members_sheet)

    chit_group_projections = spreadsheet_credentials().worksheet("monthly_projections")
    chit_group_projections_sheet  = chit_group_projections.get_all_records()
    chit_group_projections_df = pd.DataFrame(chit_group_projections_sheet)

     # Read installments
    installments = spreadsheet_credentials().worksheet("installments")
    installments_sheet = installments.get_all_records()
    installments_df = pd.DataFrame(installments_sheet)

    print(installments_df)

    chit_group = chit_groups_df[chit_groups_df["chit_group_id"] == chit_group_id]

    today = datetime.today()
    chit_group["current_month"] = (
        ((today.year - chit_group["start_date"].dt.year) * 12) +
        (today.month - chit_group["start_date"].dt.month) + 1
    ).clip(upper=chit_group["duration_months"])

    

    print(chit_group)

    chit_members_ids = chit_members_df[chit_members_df["chit_group_id"] == chit_group_id]["chit_member_id"].unique()

    print(chit_members_ids)

    current_month = chit_group["current_month"].iloc[0]
    print(current_month)

    current_month_projection = chit_group_projections_df[(chit_group_projections_df["chit_group_id"] == chit_group_id) & (chit_group_projections_df["month_number"] == current_month)]
    print(current_month_projection)

    current_month_installments = installments_df[(installments_df["chit_member_id"].isin(chit_members_ids)) & (installments_df["month_number"] == current_month)]

    existing_ids = current_month_installments[
    current_month_installments["month_number"] == current_month
    ]["chit_member_id"].unique()

    # Find members missing their installment
    missing_members = set(chit_members_ids) - set(existing_ids)

    if not missing_members:
        print("✅ All members already have current month installments.")
        return {"message" : "✅ All members already have current month installments."}

    print(missing_members)

    print(current_month_installments)

    new_installments = []
    due_date = today + timedelta(days=20)  # example logic

    for member_id in missing_members:
        new_installments.append([
            str(uuid.uuid4().hex[:16]),  # unique ID
            str(member_id),
            str(current_month),
            due_date.strftime("%Y-%m-%d"),
            int(current_month_projection["monthly_subcription"].iloc[0]),  # or dynamic based on group
            int(0),
            str("unpaid")
        ])

    print(new_installments)

    installments.append_rows(new_installments)

    return {"message" : "successfully created a members installments"}



def get_payment_details(payment_id):

    chit_groups = spreadsheet_credentials().worksheet("chit_groups")
    chit_groups_sheet = chit_groups.get_all_records()
    chit_groups_df = pd.DataFrame(chit_groups_sheet)
    chit_groups_df["start_date"] = pd.to_datetime(chit_groups_df["start_date"])

    chit_members = spreadsheet_credentials().worksheet("chit_members")
    chit_members_sheet = chit_members.get_all_records()
    chit_members_df = pd.DataFrame(chit_members_sheet)

    payments = spreadsheet_credentials().worksheet("payments")
    payments_sheet  = payments.get_all_records()
    payment_df = pd.DataFrame(payments_sheet)

     # Read installments
    installments = spreadsheet_credentials().worksheet("installments")
    installments_sheet = installments.get_all_records()
    installments_df = pd.DataFrame(installments_sheet)

    payment = payment_df[payment_df['payment_id'] == payment_id]
    payment['installment_id'] = payment['installment_id'].apply(lambda x: [i.strip() for i in x.split(',')])
    payment['chit_member_id'] = payment['chit_member_id'].apply(lambda x: [i.strip() for i in x.split(',')])

    print(payment)

    installment_ids = payment["installment_id"].iloc[0]
    chit_member_ids = payment["chit_member_id"].iloc[0]

    installments_df['installment_id'] = installments_df['installment_id'].astype(str).str.strip()

    paid_installments = installments_df[installments_df['installment_id'].isin(installment_ids)]

    print(paid_installments)
    paid_members = chit_members_df[chit_members_df["chit_member_id"].isin(chit_member_ids)]

    print(paid_members)

    merged_df = pd.merge(
    paid_installments,
    paid_members,
    on='chit_member_id',
    how='inner'  # or 'inner' if you only want matching members
    )

    print(merged_df)

    chit_group = chit_groups_df[chit_groups_df["chit_group_id"].isin(merged_df["chit_group_id"])]

    print(chit_group)

    merged_df = merged_df.merge(chit_group, on="chit_group_id", how="inner")

    print(merged_df)

    payment_amount = int(payment["payment_amount"])

    print(payment_amount)

    for installment_id in installment_ids:
    # Filter rows that match current installment_id
        matching_rows = merged_df[merged_df["installment_id"] == installment_id]
        print(matching_rows)

        for index, row in matching_rows.iterrows():
            paid_amount = row["paid_amount"] if pd.notnull(row["paid_amount"]) else 0
            total_amount = row["total_amount"]

            due_amount = total_amount

            if payment_amount >= due_amount:
                merged_df.at[index, "paid_amount"] = total_amount
                payment_amount -= due_amount
            else:
                merged_df.at[index, "paid_amount"] = payment_amount
                payment_amount = 0  # Stop processing if payment is exhausted

            if payment_amount == 0:
                break  # No more funds to allocate
        
    
    print(merged_df)

    amount_paid_installment_details =  merged_df[["chit_group_id" , "chit_name", "installment_id" , "month_number" , "total_amount" , "paid_amount" , "chit_member_id"]].to_dict(orient="records")

    payment_details = payment[["net_paid_cash" , "net_paid_online" , "payment_amount" , "payment_date" ,"payment_id" , "payment_method", "payment_status"]].to_dict(orient="records")

    payment_details[0]["installment_details"] = amount_paid_installment_details
    
    return payment_details[0]


    
   






    

    



