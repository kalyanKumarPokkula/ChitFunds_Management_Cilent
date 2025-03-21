from google_authorize import spreadsheet_credentials
import pandas as pd
from flask import jsonify


def total_chit_rows():
    chit_groups = spreadsheet_credentials().worksheet("chit_groups")

    return len(chit_groups.get_all_values())

def total_chit_memeber_rows():
    chit_members = spreadsheet_credentials().worksheet("chit_members")

    return len(chit_members.get_all_values())


def chit_groups():

    chit_groups = spreadsheet_credentials().worksheet("chit_groups")

    # Fetch all data from each sheet
    chit_groups_sheet = chit_groups.get_all_values()
    
    # chit_groups
    chit_groups_columns = chit_groups_sheet[0]
    
    # Extract rows
    chit_groups_rows = chit_groups_sheet[1:]

    # Create DataFrame
    chit_groups_df = pd.DataFrame(chit_groups_rows, columns=chit_groups_columns)

    df = chit_groups_df[['chit_group_id', 'chit_name' , 'chit_amount', 'duration_months' ,'total_members','monthly_installment', 'start_date' ,'end_date' , 'status']]
    
    # Sort data based on custom order for 'status'
    status_order = ['active', 'upcoming', 'completed']
    df['status'] = pd.Categorical(df['status'], categories=status_order, ordered=True)
    df = df.sort_values('status')

    json_data = df.to_json(orient="records", indent=4)

    return json_data


def add_chit(data):
    
    new_row = [
        str(total_chit_rows()),   # Convert to string
        str(data.get("chit_name", "")),
        str(data.get("chit_amount", "")),
        str(data.get("duration_months", "")),
        str(data.get("total_members", "")),
        str(data.get("monthly_installment", "")),
        str(data.get("status", "")),
        str(data.get("start_date", "")),
        str(data.get("end_date", ""))
    ]

    chit_groups = spreadsheet_credentials().worksheet("chit_groups")

    return chit_groups.append_row(new_row)

def add_members(data):

    formatted_rows = []
    users = data.get("user_ids")
    index = total_chit_memeber_rows()
    for row in users:
        formatted_rows.append([
            str(index),
            str(row),
            str(data.get("chit_group_id","")),
            str("FALSE"),
            0,
            0,
            str("NULL")
        ])
        index += 1;
    
    print(formatted_rows)
    
    chit_members = spreadsheet_credentials().worksheet("chit_members")

    chit_members.append_rows(formatted_rows)

    return {"message": "Rows added successfully"}

def update_chit_group(data):
    
    chit_groups = spreadsheet_credentials().worksheet("chit_groups")
    
    chit_groups_sheet = chit_groups.get_all_records()
    
    print(chit_groups_sheet)
    
    row_to_update = None
    row_index = None
    for i, row in enumerate(chit_groups_sheet):
        print(i)
        print(row)
        if str(row.get("chit_group_id")) == str(data.get("chit_group_id")):
            row_to_update = row
            row_index = i + 2  # Google Sheets are 1-indexed, so add 2 to the index (1 for header, 1 for index)
            break
    
    print(row_to_update)
    print(row_index)
    
    print(row_to_update)
    print(row_index)
    if row_to_update is None:
        print("Chit group not found.")
        return
    print(row_to_update)
    if row_index is not None:
        print(row_index)
    # Prepare the updated row data by comparing the fields
    updated_values = []
    for key, value in data.items():
        # You need to match the column order and index, e.g., name, description, etc.
        if row_to_update.get(key) != value:  # If there's a difference, update it
            updated_values.append(value)
        else:
            updated_values.append(row_to_update.get(key))  # Keep the original value if not updated
         # Keep the original value if not updated
    print(updated_values)
    range_to_update = f"A{row_index}:I{row_index}"
    # If there are any updates, apply them
    if updated_values:
        chit_groups.update(range_to_update,[updated_values])
        return {"message" : f"Chit group {data.get('chit_group_id')} updated successfully."}
    else:
        return {"message" : "No changes detected."}
        
    
    

def delete_chit_group_by_id(chit_group_id):
     
     chit_groups = spreadsheet_credentials().worksheet("chit_groups")

     chit_group_sheet = chit_groups.get_all_records()

     print(chit_group_sheet)
     # Define the column name and value to delete
     column_name = "chit_group_id"

     row_to_delete = None
     for i, row in enumerate(chit_group_sheet):
          print(i)
          print(row)
          if str(row.get("chit_group_id")) == str(chit_group_id):
               row_to_delete = i + 2
               break
       
     print(row_to_delete)
     if row_to_delete:
          chit_groups.delete_rows(row_to_delete)

          return {"message" : f"Deleted row {row_to_delete} with chit_group_id = {chit_group_id}"}
     else:
          return {"error": f"No row found with chit_group_id = {chit_group_id}"}


def get_chit_by_id(chit_group_id):

    chit_groups = spreadsheet_credentials().worksheet("chit_groups")

    chit_group_sheet = chit_groups.get_all_values()

    df = pd.DataFrame(chit_group_sheet[1:] , columns=chit_group_sheet[0])

    df["chit_group_id"] = df["chit_group_id"].astype(str)

    row = df[df["chit_group_id"] == str(chit_group_id)]

    if row.empty:
            return jsonify({"error": "Chit group not found"}), 404

    result = row.iloc[0].to_dict()

    result["monthly_projections"] = monthly_projections(chit_group_id)

    return result


def get_users_by_chit_group(chit_group_id):
     
     chit_members = spreadsheet_credentials().worksheet("chit_members")

     chit_members_sheet = chit_members.get_all_values()

     users = spreadsheet_credentials().worksheet("users")

     users_sheet = users.get_all_values()

     df_users = pd.DataFrame(users_sheet[1:] , columns=users_sheet[0])
     df_chit_members = pd.DataFrame(chit_members_sheet[1:] , columns=chit_members_sheet[0])

     matched_members = df_chit_members[df_chit_members["chit_group_id"] == str(chit_group_id)]

     if matched_members.empty:
            return []
     

     result_df = matched_members.merge(df_users , on="user_id" , how="inner")[
          ["user_id" , "full_name" , "phone", "email", "is_lifted" , "pending_installments" , "lifted_amount"]
     ]

     user_data = result_df.to_dict(orient="records")

     return user_data

def get_chit_group_payments(month_number):
     
     payments = spreadsheet_credentials().worksheet("payments")

     payments_sheet = payments.get_all_values()




def get_users():

     users = spreadsheet_credentials().worksheet("users")

     users_sheet = users.get_all_values()

     df_users = pd.DataFrame(users_sheet[1:] , columns=users_sheet[0])

     return df_users[["user_id","full_name" , "phone"]].to_dict(orient="records")





def monthly_projections(chit_group_id):
     
     monthly_projections = spreadsheet_credentials().worksheet("monthly_projections")

     monthly_projections_sheet = monthly_projections.get_all_values()

     users = spreadsheet_credentials().worksheet("users")

     users_sheet = users.get_all_values()

     df_monthly_projections = pd.DataFrame(monthly_projections_sheet[1:] , columns=monthly_projections_sheet[0])

     df_users = pd.DataFrame(users_sheet[1:] , columns=users_sheet[0])

     filter_projections = df_monthly_projections[df_monthly_projections["chit_group_id"] == str(chit_group_id)]

     result_df = filter_projections.merge(df_users , on="user_id" , how="left")[
          ["monthly_projections_id" , "month_number" , "monthly_subcription" ,"full_name" , "total_payout"]
     ]
     result_df.fillna({"full_name" : "Not Lifted"}, inplace=True)

     return result_df.to_dict(orient="records")


