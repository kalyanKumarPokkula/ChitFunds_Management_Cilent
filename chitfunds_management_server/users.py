from google_authorize import spreadsheet_credentials
import uuid
from datetime import datetime
import pandas as pd

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

    # Get list of chit_group_id for the user
    user_chits = chit_members_df[chit_members_df["user_id"] == user_id]["chit_group_id"].unique()
    
    print(user_chits)
    # Filter active chits only
    active_chits = chit_groups_df[(chit_groups_df["chit_group_id"].isin(user_chits)) & 
                                  (chit_groups_df["status"] == "active")]
    
  

    if active_chits.empty:
        return "No active chits found for this user"

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

    

    merged_df = pd.merge(
    unpaid_df, 
    result, 
    left_on=["chit_member_id", "month_number"], 
    right_on=["chit_member_id", "current_month"],
    how="inner"
    )

    total_sum = merged_df["total_amount"].sum()
    print(total_sum)

    current_month_payment = merged_df[["chit_member_id" , "chit_group_id" , "chit_name" , "month_number" , "total_amount" , "status_x"]].to_dict(orient="records")

    user_information = user[["full_name" , "email" , "phone" , "address" , "state" , "city" ,"user_id" , "city" , "pincode"]].to_dict(orient="records")
    
    chit_count = len(current_month_payment)
    print(chit_count)

    user_details = {
        "user" : user_information[0],
        "current_month_payment" : current_month_payment,
        "payment_overdues" : payment_overdues,
        "chit_count" : int(chit_count),
        "current_total_amount" : int(total_sum)

    }

    print(merged_df)

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
        (df["due_date"] < today) &  # Past due date
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


