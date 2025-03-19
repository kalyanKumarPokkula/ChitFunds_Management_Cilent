from google_authorize import spreadsheet_credentials
import pandas as pd


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
