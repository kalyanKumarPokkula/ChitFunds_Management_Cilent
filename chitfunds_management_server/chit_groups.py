from google_authorize import spreadsheet_credentials
import pandas as pd
from flask import jsonify
import uuid


def chit_groups():

    """
    Retrieves all chit groups from the 'chit_groups' worksheet, processes the data, 
    and returns a JSON response sorted by status.

    Returns:
        str: JSON-formatted string containing chit group details.
    """

    chit_groups = spreadsheet_credentials().worksheet("chit_groups")

    chit_groups_sheet = chit_groups.get_all_values()
    
    chit_groups_columns = chit_groups_sheet[0]
    
    chit_groups_rows = chit_groups_sheet[1:]

    chit_groups_df = pd.DataFrame(chit_groups_rows, columns=chit_groups_columns)

    df = chit_groups_df[['chit_group_id', 'chit_name' , 'chit_amount', 'duration_months' ,'total_members','monthly_installment', 'start_date' ,'end_date' , 'status']]
    
    status_order = ['active', 'upcoming', 'completed']

    df['status'] = pd.Categorical(df['status'], categories=status_order, ordered=True)

    df = df.sort_values('status')

    

    return df.to_dict(orient="records")


def add_chit(data):
    """
    Adds a new chit group to the 'chit_groups' worksheet.

    Args:
        data (dict): A dictionary containing details about the chit group.

    Returns:
        dict: A message indicating whether the row was successfully added.
    """
    
    new_row = [
        str(str(uuid.uuid4().hex[:12])),   # Convert to string
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
    """
    Adds multiple members to a chit group in the 'chit_members' worksheet.

    Args:
        data (dict): A dictionary containing the chit group ID and a list of user IDs.

    Returns:
        dict: A message indicating whether the rows were successfully added.
    """

    formatted_rows = []
    users = data.get("user_ids")
    for row in users:
        formatted_rows.append([
            str(uuid.uuid4().hex[:12]),
            str(row),
            data.get("chit_group_id"),
            str("FALSE"),
            0,
            0,
            str("NULL")
        ])
        
    
    print(formatted_rows)
    
    chit_members = spreadsheet_credentials().worksheet("chit_members")

    chit_members.append_rows(formatted_rows)

    return {"message": "Rows added successfully"}


def add_chit_monthly_projections(data):
     """
    Adds multiple monthly projections for a chit group in the 'monthly_projections' worksheet.

    Args:
        data (dict): A dictionary containing the chit group ID and a list of monthly projections.

    Returns:
        dict: A message indicating whether the rows were successfully added.
    """
     
     formatted_rows = []
     print(data)
     monthly_chit_projections = data.get("monthly_chit_projections")
     print(monthly_chit_projections)
     for row in monthly_chit_projections:
          formatted_rows.append([
               str(uuid.uuid4().hex[:16]),
               data.get("chit_group_id"),
               row.get("month_number"),
               row.get("monthly_subcription"),
               row.get(""),
               row.get("total_payout")
          ])
     
     print(formatted_rows)

     monthly_projections = spreadsheet_credentials().worksheet("monthly_projections")

     monthly_projections.append_rows(formatted_rows)

     return {"message": "Rows added successfully"}


def chit_lifted_member(data):

    monthly_projections = spreadsheet_credentials().worksheet("monthly_projections")
    chit_members = spreadsheet_credentials().worksheet("chit_members")

    monthly_projections_sheet = monthly_projections.get_all_records()
    chit_members_sheet = chit_members.get_all_records()

    monthly_projections_row_to_update = None
    monthly_projections_row_index = None

    for i , row in enumerate(monthly_projections_sheet):
        print(i)
        print(row)
        if str(row.get("chit_group_id")) == str(data.get("chit_group_id")) and str(row.get("month_number")) == str(data.get("month_number")):
            monthly_projections_row_to_update = row
            monthly_projections_row_index = i + 2
    
    print(monthly_projections_row_to_update)
    print(monthly_projections_row_index)

    monthly_projections_updated_row = [str(data.get("user_id"))]
    monthly_projections_range_to_update = f"E{monthly_projections_row_index}"

    chit_member_row_to_update = None
    chit_member_row_index = None

    for i, row in enumerate(chit_members_sheet):
        print(i)
        print(row)
        if str(row.get("user_id")) == str(data.get("user_id")) and str(row.get("chit_group_id")) == str(data.get("chit_group_id")):
            chit_member_row_to_update = row
            chit_member_row_index = i +2
            break
    
    print(chit_member_row_index)
    print(chit_member_row_to_update)

    chit_member_updated_row = ["TRUE" , monthly_projections_row_to_update.get("total_payout")]
    chit_member_range_to_update_0 = f"D{chit_member_row_index}"
    chit_member_range_to_update_1 = f"f{chit_member_row_index}"

    data = {
        "monthly_projections_index" : monthly_projections_row_index,
        "chit_member_range_to_update_0" :chit_member_range_to_update_0,
        "chit_member_range_to_update_1" : chit_member_range_to_update_1,
        "monthly_projections_update" : monthly_projections_range_to_update,
        "monthly_projections_updated_row" : monthly_projections_updated_row,
        "chit_member_index" : chit_member_row_index,
        "chit_member_update" : chit_member_row_to_update,
        "chit_member_updated_row" : chit_member_updated_row
    }

    
    monthly_projections.update(monthly_projections_range_to_update, [monthly_projections_updated_row])
    chit_members.update(chit_member_range_to_update_0 , [[chit_member_updated_row[0]]])
    chit_members.update(chit_member_range_to_update_1, [[chit_member_updated_row[1]]])
    return {"message" : f"Chit group {data.get('chit_group_id')} updated successfully."}


    


def update_chit_group(data):
    """
    Updates a chit group in the 'chit_groups' worksheet based on the provided data.

    Args:
        data (dict): A dictionary containing the updated values for the chit group.
                     The dictionary must include "chit_group_id" to identify the group.

    Returns:
        dict: A message indicating whether the update was successful or if no changes were detected.
    """
    
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
     """
    Deletes a chit group by its ID from the 'chit_groups' worksheet.

    Args:
        chit_group_id (str or int): The ID of the chit group to delete.

    Returns:
        dict: A message indicating whether the deletion was successful or if no matching row was found.
    """

     
     chit_groups = spreadsheet_credentials().worksheet("chit_groups")
     monthly_projections = spreadsheet_credentials().worksheet("monthly_projections")
     chit_memebers = spreadsheet_credentials().worksheet("chit_members")



     chit_group_sheet = chit_groups.get_all_records()
     chit_projections_sheet = monthly_projections.get_all_records()
     chit_members_sheet = chit_memebers.get_all_records()

     print(chit_group_sheet)
     # Define the column name and value to delete

     row_to_delete = None
     for i, row in enumerate(chit_group_sheet):
          print(i)
          print(row)
          if str(row.get("chit_group_id")) == str(chit_group_id):
               row_to_delete = i + 2
               break
     monthly_projectoins_row_to_delete = []   
     for i, row in enumerate(chit_projections_sheet):
         print(i)
         print(row)
         if str(row.get("chit_group_id")) == str(chit_group_id):
             monthly_projectoins_row_to_delete.append(i+2)


     chit_members_row_to_delete = []
     for i, row in enumerate(chit_members_sheet):
         print(i)
         print(row)
         if str(row.get("chit_group_id")) == str(chit_group_id):
             chit_members_row_to_delete.append(i+2)

     monthly_projectoins_row_to_delete.sort(reverse=True)
     chit_members_row_to_delete.sort(reverse=True)

     data = {
         "row_to_delete" : row_to_delete,
         "monthly_projections" : monthly_projectoins_row_to_delete,
         "chit_members" : chit_members_row_to_delete
     }
     if row_to_delete:
          chit_groups.delete_rows(row_to_delete)
        #   chit_memebers.delete_rows(chit_members_row_to_delete)
          for row in monthly_projectoins_row_to_delete:
            monthly_projections.delete_rows(row)
          for row in chit_members_row_to_delete:
            chit_memebers.delete_rows(row)
        #   monthly_projections.delete_rows(monthly_projectoins_row_to_delete)

          return {"message" : f"Deleted row {row_to_delete} with chit_group_id = {chit_group_id}"}
     else:
          return {"error": f"No row found with chit_group_id = {chit_group_id}"}


def get_chit_by_id(chit_group_id):
    """
    Retrieves details of a specific chit group by its ID from the 'chit_groups' worksheet.

    Args:
        chit_group_id (str or int): The ID of the chit group to retrieve.

    Returns:
        dict: A dictionary containing chit group details along with its monthly projections.
              If the chit group is not found, returns a JSON error response with a 404 status.
    """

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
     
     """
    Retrieves user details for a specific chit group from the 'chit_members' and 'users' worksheets.

    Args:
        chit_group_id (str or int): The ID of the chit group.

    Returns:
        list[dict]: A list of dictionaries containing user details for the specified chit group.
    """
     
    # Access the "chit_members" worksheet which contains user-chit group mappings
     chit_members = spreadsheet_credentials().worksheet("chit_members")

    # Get all values from the "chit_members" sheet
     chit_members_sheet = chit_members.get_all_values()

    # Access the "users" worksheet which contains user details
     users = spreadsheet_credentials().worksheet("users")

    # Get all values from the "users" sheet
     users_sheet = users.get_all_values()

     installments = spreadsheet_credentials().worksheet("installments")

     installments_sheet = installments.get_all_records()

     df_installments = pd.DataFrame(installments_sheet)

     monthly_projections = spreadsheet_credentials().worksheet("monthly_projections")
     monthly_projections_sheets = monthly_projections.get_all_records()
     df_monthly_projections = pd.DataFrame(monthly_projections_sheets)

    # Convert the "users" sheet data into a pandas DataFrame
     df_users = pd.DataFrame(users_sheet[1:], columns=users_sheet[0])

    # Convert the "chit_members" sheet data into a pandas DataFrame
     df_chit_members = pd.DataFrame(chit_members_sheet[1:], columns=chit_members_sheet[0])

    # Filter users belonging to the specified chit group
     matched_members = df_chit_members[df_chit_members["chit_group_id"] == str(chit_group_id)]

     print(matched_members["chit_member_id"])


    # If no users are found in the chit group, return an empty list
     if matched_members.empty:
        return []
     
     pending_installments = df_installments[
        (df_installments["chit_member_id"].isin(matched_members["chit_member_id"])) & 
        (df_installments["status"] == "unpaid")
    ]
     pending_installments["total_amount"] = pd.to_numeric(pending_installments["total_amount"], errors='coerce')
     pending_installments["paid_amount"] = pd.to_numeric(pending_installments["paid_amount"], errors='coerce')
    
     pending_installments["adjusted_pending_amount"] = pending_installments.apply(
    lambda row: row["total_amount"] - (row["paid_amount"] if pd.notnull(row["paid_amount"]) else 0), axis=1
)
     
     print(pending_installments)

    # Aggregate to find total_pending_amount and pending_months
     pending_summary = pending_installments.groupby("chit_member_id").agg(
        total_pending_amount=("adjusted_pending_amount", "sum"),
        pending_months=("month_number", "count")
    ).reset_index()
     
     print(pending_summary)

     # Merge with chit_members data to get final output, including full_name and phone
     final_result = matched_members.merge(pending_summary, on="chit_member_id", how="left").merge(
        df_users[["user_id", "full_name", "phone"]], left_on="user_id", right_on="user_id", how="left"
    ).fillna(0)
     print(final_result)

     # Filter lifted members from the specific chit group
     lifted_members = df_monthly_projections[
        (df_monthly_projections["chit_group_id"] == chit_group_id) & 
        (df_monthly_projections["user_id"].notna())  # Only those who lifted
    ]

     lifted_members = final_result.merge(lifted_members, on="user_id", how="left")

     print(lifted_members)

    # # Merge the matched chit group members with user details from the "users" DataFrame
    #  result_df = matched_members.merge(df_users, on="user_id", how="inner")[
    #     ["user_id", "full_name", "phone", "email", "is_lifted", "pending_installments", "lifted_amount"]
    # ]

     lifted_members = lifted_members[["user_id","chit_group_id_x","full_name","month_number","pending_months","total_payout","total_pending_amount","phone"]].to_dict(orient="records")

    
     return lifted_members


def get_chit_group_payments():
     """
    Retrieves all payment details from the 'payments of a chit_group' worksheet.

    Returns:
        list[dict]: A list of dictionaries containing payment details.
    """
     
     payments = spreadsheet_credentials().worksheet("payments")

     payments_sheet = payments.get_all_values()

     return payments_sheet




def get_users():
     """
    Retrieves user details from the 'users' worksheet in the spreadsheet.

    Returns:
        list[dict]: A list of dictionaries containing user_id, full_name, and phone number.
    """
     users = spreadsheet_credentials().worksheet("users")

     users_sheet = users.get_all_values()

     df_users = pd.DataFrame(users_sheet[1:] , columns=users_sheet[0])

     return df_users[["user_id","full_name" , "phone"]].to_dict(orient="records")





def monthly_projections(chit_group_id):
     """
    Retrieves and processes monthly projection data for a given chit group.

    Args:
        chit_group_id (str): The ID of the chit group to filter projections.

    Returns:
        list[dict]: A list of dictionaries containing monthly projection details
                    along with user information.
    """
     
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
     result_df.fillna({"full_name" : ""}, inplace=True)

     return result_df.to_dict(orient="records")


