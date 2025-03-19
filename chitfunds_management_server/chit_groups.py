from google_authorize import spreadsheet_credentials
import pandas as pd
from flask import jsonify


def total_rows():
    chit_groups = spreadsheet_credentials().worksheet("chit_groups")

    return len(chit_groups.get_all_values())

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
        str(total_rows()),   # Convert to string
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
            return jsonify({"error": "No users found for the given chit_group_id"}), 404
     

     result_df = matched_members.merge(df_users , on="user_id" , how="inner")[
          ["user_id" , "full_name" , "phone", "email", "is_lifted" , "pending_installments" , "lifted_amount"]
     ]

     user_data = result_df.to_dict(orient="records")

     return user_data


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


