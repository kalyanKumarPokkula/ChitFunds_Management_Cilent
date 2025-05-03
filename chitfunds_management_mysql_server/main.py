from datetime import datetime, timedelta
from sqlalchemy import create_engine, text
import uuid

# Database connection
DATABASE_URL = "mysql+pymysql://username:password@localhost/database_name"
engine = create_engine(DATABASE_URL)

def get_last_day_of_month():
    today = datetime.today()
    next_month = today.replace(day=28) + timedelta(days=4)
    return next_month - timedelta(days=next_month.day)


print(get_last_day_of_month())

def generate_installments():
    with engine.connect() as conn:
        # Step 1: Identify the last day of the month
        today = datetime.today().date()
        last_day = get_last_day_of_month().date()
        
        if today != last_day:
            print("Not the last day of the month. Skipping installment generation.")
            return
        
        # Step 2: Fetch all active chit groups
        chit_groups = conn.execute(text("SELECT chit_group_id, start_date FROM chit_group WHERE status = 'active'")).fetchall()
        
        for chit_group in chit_groups:
            chit_group_id, start_date = chit_group
            start_date = datetime.strptime(start_date, "%Y-%m-%d")
            current_month_number = (today.year - start_date.year) * 12 + (today.month - start_date.month) + 1

            # Step 3: Fetch monthly subscription amount
            projection = conn.execute(text(
                "SELECT monthly_subcription FROM monthly_projections WHERE chit_group_id = :chit_group_id AND month_number = :month_number"
            ), {"chit_group_id": chit_group_id, "month_number": current_month_number}).fetchone()

            if not projection:
                print(f"No projection found for chit_group {chit_group_id}, month {current_month_number}")
                continue

            monthly_subscription = projection[0]

            # Step 4: Fetch all members of this chit group
            members = conn.execute(text("SELECT chit_member_id FROM chit_members WHERE chit_group_id = :chit_group_id"), 
                                   {"chit_group_id": chit_group_id}).fetchall()
            
            for member in members:
                chit_member_id = member[0]
                installment_id = str(uuid.uuid4())

                # Step 5: Insert the installment for each member
                conn.execute(text(
                    "INSERT INTO installments (installment_id, chit_member_id, month_number, due_date, total_amount, status) "
                    "VALUES (:installment_id, :chit_member_id, :month_number, :due_date, :total_amount, 'pending')"
                ), {
                    "installment_id": installment_id,
                    "chit_member_id": chit_member_id,
                    "month_number": current_month_number,
                    "due_date": str(last_day),
                    "total_amount": monthly_subscription
                })

        print("Installments generated successfully.")

# Run the function
generate_installments()