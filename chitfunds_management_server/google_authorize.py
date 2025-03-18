import gspread
from google.oauth2.service_account import Credentials

def spreadsheet_credentials():
    scopes =[
    "https://www.googleapis.com/auth/spreadsheets"
    ]

    creds = Credentials.from_service_account_file("credentials.json", scopes=scopes)
    client = gspread.authorize(creds)

    sheet_id = "1HMSYZ8WiBovB3ibBxeeWWCMgHRblEHmia5NQbRS3AFQ"
    spreadsheet = client.open_by_key(sheet_id)

    return spreadsheet