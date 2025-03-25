from google_authorize import spreadsheet_credentials
import uuid
from datetime import datetime
import pandas as pd

def create_new_user(data):

    user = [
        str(uuid.uuid4().hex[:8]),
        str(data.get("full_name")),
        str(data.get("email")),
        str(data.get("phone")),
        str(data.get("aadhaar_number")),
        str(data.get("pan_number")),
        str(data.get("address")),
        str(data.get("city")),
        str(data.get("state")),
        str(data.get("pincode")),
        datetime.datetime.now().now.strftime("%Y-%m-%d %H:%M:%S"),
        str(data.get("is_verified")),
        datetime.datetime.now().now.strftime("%Y-%m-%d %H:%M:%S")     
    ]
    
    users = spreadsheet_credentials().worksheet("users")
    users_sheet = users.get_all_records()
    df = pd.DataFrame(users_sheet)

    if data["phone"] in df["phone"].values:
        print(f"User with phone number {data['phone']} already exists. Sending a message...")
    # Implement your messaging logic here (e.g., SMS, email)
    else:
        print("Phone number not found. You can proceed with registration.")

    
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

    result_dict = df_merged[["full_name", "email", "chit_count", "phone"]].to_dict(orient="records")

    # # Filter active chits first
    # active_chit_ids = set(df_chit_groups.loc[df_chit_groups["status"] == "active", "chit_group_id"])
    # print(active_chit_ids)

    # # Count chit participation only for active chits
    # chit_count_series = df_chit_members.loc[df_chit_members["chit_group_id"].isin(active_chit_ids), "user_id"].value_counts()
    # print(chit_count_series)

    # # Map chit count directly to users (avoiding unnecessary joins)
    # df_users["chit_count"] = df_users["user_id"].map(chit_count_series).fillna(0).astype(int)



    # # Select required columns and convert to dict
    # result_dict = df_users[["full_name", "email", "chit_count", "phone"]].to_dict(orient="records")

    # print(result_dict)


    

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

    # Read Monthly Projections Table
    monthly_projections_ws = spreadsheet_credentials().worksheet("monthly_projections")
    monthly_projections_data = monthly_projections_ws.get_all_records()
    monthly_projections_df = pd.DataFrame(monthly_projections_data)

    # Read Payments table
    

    user = users_df[users_df["user_id"] == user_id]
    print(user)

    # Get list of chit_group_id for the user
    user_chits = chit_members_df[chit_members_df["user_id"] == user_id]["chit_group_id"].unique()
    
    print(user_chits)
    # Filter active chits only
    active_chits = chit_groups_df[(chit_groups_df["chit_group_id"].isin(user_chits)) & 
                                  (chit_groups_df["status"] == "active")]
    
    print(active_chits)

    if active_chits.empty:
        return "No active chits found for this user"

    # Get members of active chit groups
    active_chit_groups = active_chits["chit_group_id"].tolist()

    print(active_chit_groups)
    chit_members_of_active_chit_group = chit_members_df[(chit_members_df["chit_group_id"].isin(active_chit_groups)) & 
                                   (chit_members_df["user_id"] == user_id)]
    
    print(chit_members_of_active_chit_group)
    
    active_chits_df = pd.DataFrame(active_chits)

    # Convert start_date to datetime
    active_chits_df["start_date"] = pd.to_datetime(active_chits_df["start_date"])

    # Get today's date (Example: June 15, 2025)
    today = datetime.today()

    # Calculate current month of the chit
    active_chits_df["current_month"] = ((today.year - active_chits_df["start_date"].dt.year) * 12 +
                                    (today.month - active_chits_df["start_date"].dt.month) + 1).clip(upper=active_chits_df["duration_months"])
    
    print(active_chits_df[["chit_group_id", "chit_name", "current_month"]])

    return get_current_month_projections_data(monthly_projections_df , active_chits_df)
    
    
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




