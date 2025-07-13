import enum

from flask import jsonify
from db import get_db
from models.payment_installment import PaymentInstallment
from models.user import User
from models.chit_member import ChitMember
from models.chit_group import ChitGroup
from models.installment import Installment
from models.payment import Payment
import uuid
from datetime import datetime, timedelta, date
import pandas as pd
from sqlalchemy import text
from auth import get_password_hash

def create_new_user(data):
    db = get_db()
    try:
        user_id = str(uuid.uuid4().hex[:12])
        
        # Check if user with same phone, Aadhaar, or PAN exists
        existing_phone = db.query(User).filter(User.phone == str(data.get("phone"))).first()
        if existing_phone:
            return {"message": f"User with phone number {data['phone']} already exists."}
        
        if data.get("aadhaar_number"):
            existing_aadhaar = db.query(User).filter(User.aadhaar_number == str(data.get("aadhaar_number"))).first()
            if existing_aadhaar:
                return {"message": f"User with Aadhaar number {data['aadhaar_number']} already exists."}
        
        if data.get("pan_number"):
            existing_pan = db.query(User).filter(User.pan_number == str(data.get("pan_number"))).first()
            if existing_pan:
                return {"message": f"User with PAN number {data['pan_number']} already exists."}
        
        # Hash the password if provided, otherwise use a default hashed password
        password = data.get("password", "123456")
        hashed_password = get_password_hash(password)
        
        # Create new user
        new_user = User(
            user_id=user_id,
            full_name=str(data.get("full_name")),
            email=str(data.get("email")),
            password=hashed_password,
            phone=str(data.get("phone")),
            aadhaar_number=str(data.get("aadhaar_number")),
            pan_number=str(data.get("pan_number")),
            address=str(data.get("address")),
            city=str(data.get("city")),
            state=str(data.get("state")),
            pincode=str(data.get("pincode")),
            role=data.get("role"),
            is_verified=True,
        )
        
        db.add(new_user)
        db.commit()
        return {"message": "Successfully created a new user"}
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()

def get_users():
    """
    Retrieves user details from the database.

    Returns:
        list[dict]: A list of dictionaries containing user_id, full_name, and phone number.
    """
    db = get_db()
    try:
        # Query all users with basic information
        users_query = text("""
            SELECT user_id, full_name, phone
            FROM users
        """)
        
        result = db.execute(users_query)
        users = [dict(row._mapping) for row in result]
        
        return users
    finally:
        db.close()

def get_members():
    db = get_db()
    try:
        # Execute a custom SQL query to get the count of active chits per user
        sql = text("""
            SELECT u.user_id, u.full_name, u.email, u.phone, 
                COUNT(DISTINCT cm.chit_group_id) as chit_count
            FROM users u
            LEFT JOIN chit_members cm ON u.user_id = cm.user_id
            LEFT JOIN chit_groups cg ON cm.chit_group_id = cg.chit_group_id AND cg.status = 'active'
            GROUP BY u.user_id, u.full_name, u.email, u.phone
        """)
        
        result = db.execute(sql)
        members = [dict(row._mapping) for row in result]
        
        return members
    finally:
        db.close()


def member_overdue_amounts(installments, chit_group_ids):
    # Handle None inputs
    if installments is None:
        installments = []
    if chit_group_ids is None:
        chit_group_ids = []
        
    overdue_summary = {}

    print("inside member overdue amounts")
    print(chit_group_ids)
    
    # Safely create the mapping
    chit_member_to_group = {}
    try:
        chit_member_to_group = {item['chit_member_id']: item['chit_group_id'] for item in chit_group_ids}
    except (TypeError, KeyError, AttributeError):
        # If any error occurs during mapping creation
        pass

    for inst in installments:
        
        total = float(inst.get("total_amount", 0) or 0)
        paid = float(inst.get("paid_amount", 0) or 0)
        status = inst.get("status", "").lower()
        overdue = total - paid

        if status in ["unpaid", "partial"] and overdue > 0:
            cm_id = inst.get("chit_member_id")
            if not cm_id:
                continue
                
            if cm_id not in overdue_summary:
                overdue_summary[cm_id] = {
                    "chit_member_id": cm_id,
                    "total_overdue_amount": 0,
                    "overdue_months": 0,
                    "chit_group_id": chit_member_to_group.get(cm_id)
                }
            overdue_summary[cm_id]["total_overdue_amount"] += overdue
            overdue_summary[cm_id]["overdue_months"] += 1

    return list(overdue_summary.values())






def get_users_chit_details(user_id):
    db = get_db()
    try:
        # Get user info
        user_query = text("SELECT * FROM users WHERE user_id = :user_id")
        result = db.execute(user_query, {"user_id": user_id}).fetchone()
        if not result:
            return {}

        user = dict(result._mapping)
        user_info_fields = ["full_name", "email", "phone", "address", "state", "city", "user_id", "pincode", "is_verified"]
        user_information = {key: user[key] for key in user_info_fields}

        print(user_information)

        # Get chit_members for user
        members_query = text("SELECT * FROM chit_members WHERE user_id = :user_id")
        chit_members = [dict(row._mapping) for row in db.execute(members_query, {"user_id": user_id})]



        if not chit_members:
            return {
                "user": user_information,
                "current_month_payment": [],
                "payment_overdues": [],
                "chit_count": 0,
                "current_total_amount": 0,
                "total_overdue_amount": 0
            }

        chit_group_ids = list(set(m["chit_group_id"] for m in chit_members))
        member_ids = [m["chit_member_id"] for m in chit_members]

        # Get active chit groups
        query = text(f"""
            SELECT * FROM chit_groups
            WHERE chit_group_id IN :ids AND status = 'active'
        """)
        
        # Ensure we have items before creating tuple
        if not chit_group_ids:
            active_chits = []
        else:
            active_chits = [dict(row._mapping) for row in db.execute(query, {"ids": tuple(chit_group_ids)})]

        if not active_chits:
            return {
                "user": user_information,
                "current_month_payment": [],
                "payment_overdues": [],
                "chit_count": 0,
                "current_total_amount": 0,
                "total_overdue_amount": 0
            }

        active_chit_ids = [c["chit_group_id"] for c in active_chits]

        # Get installments for user's active chit_members
        query = text(f"""
            SELECT * FROM installments
            WHERE chit_member_id IN :ids
        """)
        
        # Ensure we have items before creating tuple
        if not member_ids:
            installments = []
        else:
            installments = [dict(row._mapping) for row in db.execute(query, {"ids": tuple(member_ids)})]

        # Prepare mapping for overdue calculation
        chit_member_group_map = [
            {"chit_member_id": m["chit_member_id"], "chit_group_id": m["chit_group_id"]}
            for m in chit_members if m["chit_group_id"] in active_chit_ids
        ] 

        overdue_summary = member_overdue_amounts(installments, chit_member_group_map)


        # Calculate current_month
        today = datetime.today()
        for chit in active_chits:
            # try:
            print(chit)
            start_date = chit["start_date"]  # already a datetime.date
            month_diff = (today.year - start_date.year) * 12 + (today.month - start_date.month) + 1
            chit["current_month"] = min(month_diff, chit["duration_months"])

            # except:
            #     chit["current_month"] = 1

        # Prepare payment_overdues
        chit_map = {ch["chit_group_id"]: ch for ch in active_chits}
        payment_overdues = []
        for item in overdue_summary:
            chit = chit_map.get(item["chit_group_id"], {})
            payment_overdues.append({
                "chit_group_id": item["chit_group_id"],
                "chit_member_id": item["chit_member_id"],
                "chit_name": chit.get("chit_name", ""),
                "overdue_months": item["overdue_months"],
                "total_overdue_amount": item["total_overdue_amount"]
            })

        # Current month installments
        total_overdue_amount = 0

        for item in overdue_summary:
            total_overdue_amount += item["total_overdue_amount"]

        current_month_payment = []
        current_total_amount = 0

        member_map = {m["chit_member_id"]: m for m in chit_members}

        for inst in installments:
            cm_id = inst["chit_member_id"]
            member = member_map.get(cm_id)
            if not member:
                continue
            group_id = member["chit_group_id"]
            chit = chit_map.get(group_id)
            if not chit:
                continue
            if inst["month_number"] == chit["current_month"]:
                current_month_payment.append({
                    "chit_member_id": cm_id,
                    "chit_group_id": group_id,
                    "chit_name": chit["chit_name"],
                    "month_number": inst["month_number"],
                    "total_amount": inst["total_amount"],
                    "status": inst["status"]
                })
                current_total_amount += float(inst.get("total_amount", 0) or 0)
        
        overdue_lookup = {
            (entry["chit_member_id"], entry["chit_group_id"]): {
                "overdue_months": entry["overdue_months"],
                "total_overdue_amount": entry["total_overdue_amount"]
            }
            for entry in payment_overdues
        }

        # Add overdue information to current_month_payment
        for item in current_month_payment:
            key = (item["chit_member_id"], item["chit_group_id"])
            overdue_info = overdue_lookup.get(key, {"overdue_months": 0, "total_overdue_amount": 0})
            item.update(overdue_info)
            
        return {
            "user": user_information,
            "current_month_payment": current_month_payment,
            "payment_overdues": payment_overdues,
            "chit_count": len(active_chits),
            "current_total_amount": int(current_total_amount),
            "total_overdue_amount": int(total_overdue_amount)
        }

    finally:
        db.close()

def get_current_month_projections_data(monthly_projections_df, chit_group_df):
    # This function can be implemented for MySQL if needed
    pass

def get_all_member_installments(member_id):
    db = get_db()
    try:
            # Get all installments for a specific member
        installments_query = text("""
            SELECT i.*, cg.chit_name
            FROM installments i
            JOIN chit_members cm ON i.chit_member_id = cm.chit_member_id
            JOIN chit_groups cg ON cm.chit_group_id = cg.chit_group_id
            WHERE i.chit_member_id = :member_id
            ORDER BY i.month_number ASC
        """)

        result = db.execute(installments_query, {"member_id": member_id}).mappings()
        installments = [dict(row) for row in result]

        return installments

    finally:
        db.close()

# def get_current_month_payment_stats():
#     db = get_db()
#     try:
#         # Get current month payment statistics
#         stats_query = text("""
#             SELECT cg.chit_group_id, cg.chit_name, cg.start_date, cg.duration_months,
#                 COUNT(CASE WHEN i.status = 'paid' THEN 1 ELSE NULL END) as paid_count,
#                 COUNT(CASE WHEN i.status = 'unpaid' THEN 1 ELSE NULL END) as unpaid_count,
#                 SUM(CASE WHEN i.status = 'paid' THEN i.total_amount ELSE 0 END) as paid_amount,
#                 SUM(CASE WHEN i.status = 'unpaid' THEN i.total_amount ELSE 0 END) as unpaid_amount
#             FROM chit_groups cg
#             JOIN chit_members cm ON cg.chit_group_id = cm.chit_group_id
#             JOIN installments i ON cm.chit_member_id = i.chit_member_id
#             WHERE cg.status = 'active'
#             GROUP BY cg.chit_group_id, cg.chit_name, cg.start_date, cg.duration_months
#         """)
        
#         result = db.execute(stats_query)
#         stats = [dict(row) for row in result]
        
#         return stats
#     finally:
#         db.close()



def get_current_month_payment_stats():
    db = get_db()
    try:
        today = datetime.today()

        # Step 1: Get all active chit groups with start date
        chit_groups_query = text("""
            SELECT chit_group_id, start_date, duration_months
            FROM chit_groups
            WHERE status = 'active'
        """)
        chit_groups = db.execute(chit_groups_query).mappings().all()

        current_month_map = {}
        for group in chit_groups:
            start_date = group['start_date']
            duration = group['duration_months']
            current_month = ((today.year - start_date.year) * 12 + (today.month - start_date.month) + 1)
            current_month = min(current_month, duration)
            current_month_map[group['chit_group_id']] = current_month

        # Step 2: Get current month's installments with their total and paid
        installments_query = text("""
            SELECT cg.chit_group_id, i.total_amount, i.paid_amount, i.month_number
            FROM installments i
            JOIN chit_members cm ON i.chit_member_id = cm.chit_member_id
            JOIN chit_groups cg ON cm.chit_group_id = cg.chit_group_id
            WHERE cg.status = 'active'
        """)
        rows = db.execute(installments_query).mappings().all()

        # Step 3: Filter only installments of current month
        filtered = []
        for row in rows:
            group_id = row['chit_group_id']
            if row['month_number'] == current_month_map[group_id]:
                filtered.append(row)

        # Step 4: Aggregate amounts
        from collections import defaultdict
        agg = defaultdict(lambda: {"total_due_this_month": 0, "total_paid_this_month": 0})

        for row in filtered:
            group_id = row['chit_group_id']
            total = float(row['total_amount'] or 0)
            paid = float(row['paid_amount'] or 0)
            agg[group_id]["total_due_this_month"] += total
            agg[group_id]["total_paid_this_month"] += paid

        # Step 5: Compute unpaid and form result
        result = []
        for group_id, values in agg.items():
            unpaid = values["total_due_this_month"] - values["total_paid_this_month"]
            result.append({
                "chit_group_id": group_id,
                "total_due_this_month": values["total_due_this_month"],
                "total_paid_this_month": values["total_paid_this_month"],
                "total_unpaid_this_month": unpaid
            })

        # Step 6: Calculate overdue amount from unpaid installments
        overdue_query = text("""
            SELECT total_amount, paid_amount
            FROM installments
            WHERE status = 'unpaid'
        """)
        overdue_rows = db.execute(overdue_query).mappings().all()

        total_overdue = sum(
            float(row['total_amount'] or 0) - float(row['paid_amount'] or 0)
            for row in overdue_rows
        )

        # Step 7: Get unpaid projections (user_id = 0)
        unpaid_projections = 0
        for chit_group_id, current_month in current_month_map.items():
            projection_query = text("""
                SELECT total_payout
                FROM monthly_projections
                WHERE chit_group_id = :chit_group_id
                AND month_number = :month
                AND user_id IS NULL
            """)
            rows = db.execute(projection_query, {
                "chit_group_id": chit_group_id,
                "month": current_month
            }).mappings().all()
            
            unpaid_projections += sum(float(r['total_payout'] or 0) for r in rows)

        # Step 8: Return final stats
        totals = {
            "total_due_this_month": sum(d["total_due_this_month"] for d in result),
            "total_paid_this_month": sum(d["total_paid_this_month"] for d in result),
            "total_unpaid_this_month": int(total_overdue),
            "unpaid_current_month_projections": int(unpaid_projections)
        }

        return totals
    finally:
        db.close()

def get_last_day_of_month():
    today = datetime.today()
    next_month = today.replace(day=28) + timedelta(days=4)
    return next_month - timedelta(days=next_month.day)

def generate_installments():
    db = get_db()
    try:
        # Step 1: Identify the last day of the month
        today = datetime.today().date()
        last_day = get_last_day_of_month().date()

        print(today)

        
        if today != last_day:
            print("Not the last day of the month. Skipping installment generation.")
            return
        
        # Step 2: Fetch all active chit groups
        chit_groups = db.execute(text("SELECT chit_group_id, start_date FROM chit_group WHERE status = 'active'")).fetchall()
        
        for chit_group in chit_groups:
            chit_group_id, start_date = chit_group
            start_date = datetime.strptime(start_date, "%Y-%m-%d")
            current_month_number = (today.year - start_date.year) * 12 + (today.month - start_date.month) + 1

            # Step 3: Fetch monthly subscription amount
            projection = db.execute(text(
                "SELECT monthly_subcription FROM monthly_projections WHERE chit_group_id = :chit_group_id AND month_number = :month_number"
            ), {"chit_group_id": chit_group_id, "month_number": current_month_number}).fetchone()

            if not projection:
                print(f"No projection found for chit_group {chit_group_id}, month {current_month_number}")
                continue

            monthly_subscription = projection[0]

            # Step 4: Fetch all members of this chit group
            members = db.execute(text("SELECT chit_member_id FROM chit_members WHERE chit_group_id = :chit_group_id"), 
                                 {"chit_group_id": chit_group_id}).fetchall()
            
            for member in members:
                chit_member_id = member[0]
                installment_id = str(uuid.uuid4().hex[:16])

                # Step 5: Insert the installment for each member
                db.execute(text(
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
    finally:
        db.close()


def generate_current_month_installments(chit_group_id):
    db = get_db()
    try:
        # Step 1: Fetch chit group
        chit_group = db.execute(text(
            "SELECT chit_group_id, start_date, duration_months FROM chit_groups WHERE chit_group_id = :group_id"
        ), {"group_id": chit_group_id}).fetchone()
        
        if not chit_group:
            return {"error": "Chit group not found."}

        # Access tuple elements by index instead of string keys
        start_date = pd.to_datetime(chit_group[1])  # start_date is at index 1
        duration_months = chit_group[2]  # duration_months is at index 2

        # Step 2: Compute current month
        today = datetime.today()
        current_month = ((today.year - start_date.year) * 12) + (today.month - start_date.month) + 1
        current_month = min(current_month, duration_months)

        # Step 3: Get all member IDs in the group
        members = db.execute(text(
            "SELECT chit_member_id FROM chit_members WHERE chit_group_id = :group_id"
        ), {"group_id": chit_group_id}).fetchall()

        # Convert the list of tuples into a list of member_ids
        member_ids = [row[0] for row in members]
        if not member_ids:
            return {"message": "No members in chit group."}

        # Step 4: Get current month projection
        projection = db.execute(text(
            "SELECT monthly_subcription FROM monthly_projections WHERE chit_group_id = :group_id AND month_number = :month"
        ), {"group_id": chit_group_id, "month": current_month}).fetchone()

        if not projection:
            return {"error": "Monthly projection not found for current month."}

        # Access monthly_subscription at index 0
        monthly_subscription = int(projection[0])

        # Step 5: Get members who already have an installment for this month
        existing_installments = db.execute(text(
            "SELECT chit_member_id FROM installments WHERE chit_member_id IN :member_ids AND month_number = :month"
        ), {"member_ids": tuple(member_ids), "month": current_month}).fetchall()

        # Convert the result of the query to a set of existing member ids
        existing_member_ids = {row[0] for row in existing_installments}
        missing_member_ids = set(member_ids) - existing_member_ids

        if not missing_member_ids:
            print("✅ All members already have current month installments.")
            return {"message": "✅ All members already have current month installments."}

        # Step 6: Insert missing installments
        # Set due_date as the 25th of the current month
        due_date = today.replace(day=25)

        new_installments = []
        for member_id in missing_member_ids:
            new_installments.append({
                "installment_id": str(uuid.uuid4().hex[:16]),
                "chit_member_id": member_id,
                "month_number": current_month,
                "due_date": due_date.strftime("%Y-%m-%d"),
                "total_amount": monthly_subscription,
                "paid_amount": 0,
                "status": "unpaid"
            })

        db.execute(text("""
            INSERT INTO installments (installment_id, chit_member_id, month_number, due_date, total_amount, paid_amount, status)
            VALUES (:installment_id, :chit_member_id, :month_number, :due_date, :total_amount, :paid_amount, :status)
        """), new_installments)

        db.commit()

        return {"message": "✅ Successfully created installments for missing members."}
    
    finally:
        db.close()



def get_chit_groups_by_user_id(user_id):
    """
    Retrieves all active chit groups for a given user from the database.

    Args:
        user_id (str or int): The user's ID.

    Returns:
        list[dict]: A list of dictionaries containing chit group information the user is part of.
    """
    db = get_db()
    try:
        # Join chit_members and chit_groups where user_id matches and chit is active
        results = (
            db.query(
                ChitGroup.chit_group_id,
                ChitMember.chit_member_id,
                ChitGroup.chit_name,
                ChitGroup.chit_amount,
            )
            .join(ChitMember, ChitGroup.chit_group_id == ChitMember.chit_group_id)
            .filter(ChitMember.user_id == user_id)
            .filter(ChitGroup.status == "active")
            .all()
        )

        # Format result into list of dictionaries
        output = []
        for row in results:
            output.append({
                "chit_group_id": row.chit_group_id,
                "chit_member_id": row.chit_member_id,
                "chit_name": row.chit_name,
                "chit_amount": row.chit_amount,
                "user_id": user_id
            })

        return output
    finally:
        db.close()

def get_unpaid_installments(user_id):
    db = get_db()
    try:
        # Step 1: Get active chit members of the user
        active_members = (
            db.query(ChitMember)
            .join(ChitGroup, ChitGroup.chit_group_id == ChitMember.chit_group_id)
            .filter(ChitMember.user_id == user_id, ChitGroup.status == "active")
            .all()
        )

        grouped_data = {}

        for member in active_members:
            # Step 2: Get unpaid installments for this chit_member
            unpaid_installments = (
                db.query(Installment)
                .filter(
                    Installment.chit_member_id == member.chit_member_id,
                     Installment.status.in_(["unpaid", "partial"])
                )
                .all()
            )

            # Step 3: Process unpaid installments
            installments_list = []
            for inst in unpaid_installments:
                total_amount = inst.total_amount or 0
                paid_amount = inst.paid_amount or 0
                overdue_amount = total_amount - paid_amount

                installments_list.append({
                    "installment_id": inst.installment_id,
                    "month_number": inst.month_number,
                    "total_amount": float(total_amount),
                    "paid_amount": float(paid_amount),
                    "overdue_amount": float(overdue_amount),
                    "status": inst.status.value if isinstance(inst.status, enum.Enum) else inst.status

                })

            if installments_list:
                key = (member.chit_group.chit_name, member.chit_group_id, member.chit_member_id)
                grouped_data[key] = {
                    "chit_name": member.chit_group.chit_name,
                    "chit_group_id": member.chit_group_id,
                    "chit_member_id": member.chit_member_id,
                    "unpaid_installments": installments_list
                }

        # Step 4: Convert to list format
        result = list(grouped_data.values())
        return result

    finally:
        db.close()


def process_payment(data):
    db = get_db()
    try:
        # Get installment IDs and total payment amount
        installments_data = data["installments"]
        total_payment_amount = float(data["total_amount"])
        remaining_amount = total_payment_amount
        processed = False
        
        # Process each installment in the order provided
        for installment_item in installments_data:
            installment_id = installment_item["installment_id"]
            
            # Get current installment details
            query = text("""
                SELECT installment_id, total_amount, paid_amount, status 
                FROM installments 
                WHERE installment_id = :installment_id
                FOR UPDATE
            """)
            row = db.execute(query, {"installment_id": installment_id}).fetchone()
            
            if not row:
                continue  # Skip if installment not found
                
            # Calculate due amount
            current_paid = float(row.paid_amount or 0)
            total_amount = float(row.total_amount)
            due_amount = total_amount - current_paid
            
            # Skip if already fully paid
            if due_amount <= 0:
                continue
                
            processed = True
            
            # Calculate payment amount for this installment
            payment_amount = min(remaining_amount, due_amount)
            new_paid = current_paid + payment_amount
            # new_status = 'paid' if new_paid >= total_amount else 'unpaid'

            if new_paid >= total_amount:
                new_status = 'paid'
            elif new_paid > 0:
                new_status = 'partial'
            else:
                new_status = 'unpaid'
            
           # Update installment with payment_date
            update_query = text("""
                UPDATE installments 
                SET paid_amount = :paid_amount, 
                    status = :status,
                    payment_date = :payment_date
                WHERE installment_id = :installment_id
            """)

            db.execute(update_query, {
                "paid_amount": new_paid,
                "status": new_status,
                "payment_date": date.today(),  # Only the date part, no time
                "installment_id": installment_id
            })
            
            # Reduce remaining payment amount
            remaining_amount -= payment_amount
            
            # Stop if no more money to allocate
            if remaining_amount <= 0:
                break
                
        # Check if any valid installments were processed
        if not processed:
            return {"error": "No valid installments to process"}
            
        # Create payment record
        payment_id = uuid.uuid4().hex[:18]
        payment_method = data.get("online_payment_method", "cash")
        
        # Handle empty payment method
        if not payment_method:
            payment_method = "cash"
            
        # Handle missing cash or online amounts
        cash_amount = data.get("cash_amount", 0)
        if cash_amount == "" or cash_amount is None:
            cash_amount = 0
            
        online_amount = data.get("online_amount", 0)
        if online_amount == "" or online_amount is None:
            online_amount = 0
            
        # Insert payment record
        db.execute(text("""
            INSERT INTO payments (
                payment_id, payment_amount, payment_date, 
                net_paid_cash, net_paid_online,
                payment_method, reference_number, payment_status
            ) VALUES (
                :payment_id, :payment_amount, :payment_date, 
                :net_paid_cash, :net_paid_online,
                :payment_method, :reference_number, :payment_status
            )
        """), {
            "payment_id": payment_id,
            "payment_amount": data["total_amount"],
            "payment_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "net_paid_cash": int(cash_amount),
            "net_paid_online": int(online_amount),
            "payment_method": payment_method,
            "reference_number": data.get("reference_number", "N/A"),
            "payment_status": "success"
        })
        
        # Link payments to installments
        for installment in installments_data:
            db.execute(text("""
                INSERT INTO payment_installments (
                    payment_id, installment_id, chit_member_id
                ) VALUES (
                    :payment_id, :installment_id, :chit_member_id
                )
            """), {
                "payment_id": payment_id,
                "installment_id": installment["installment_id"],
                "chit_member_id": installment["chit_member_id"]
            })
        
        # Commit changes
        db.commit()
        
        return {
            "message": "Payment processed successfully",
            "payment_id": payment_id
        }
        
    except Exception as e:
        db.rollback()
        return {"error": str(e)}
        
    finally:
        db.close()

def get_payments():
    db = get_db()
    try:
        # The SQL query joins payments with payment_installments, chit_members, users, and chit_groups
        query = text("""
            SELECT
                p.payment_id,
                p.payment_amount,
                p.payment_date,
                p.net_paid_cash,
                p.net_paid_online,
                p.payment_status,
                p.reference_number,
                p.payment_method,
                GROUP_CONCAT(DISTINCT u.full_name) AS full_names,
                GROUP_CONCAT(DISTINCT cm.chit_group_id) AS chit_group_ids,
                GROUP_CONCAT(DISTINCT cg.chit_name) AS chit_names
            FROM payments p
            LEFT JOIN payment_installments pi ON pi.payment_id = p.payment_id
            LEFT JOIN chit_members cm ON cm.chit_member_id = pi.chit_member_id
            LEFT JOIN users u ON u.user_id = cm.user_id
            LEFT JOIN chit_groups cg ON cg.chit_group_id = cm.chit_group_id
            GROUP BY 
                p.payment_id, p.payment_amount, p.payment_date, 
                p.net_paid_cash, p.net_paid_online, p.payment_status, 
                p.reference_number, p.payment_method
            ORDER BY p.payment_date DESC
        """)

        result = db.execute(query)
        # Convert the result to a list of dictionaries
        payments = [dict(row) for row in result.mappings().all()]

        return payments

    except Exception as e:
        return {"error": str(e)}
    finally:
        db.close()


def get_payment_details(payment_id, user_name):
    db = get_db()
    try:
        # Step 1: Fetch payment info
        payment_query = text("""
            SELECT
                payment_id,
                payment_amount,
                payment_date,
                net_paid_cash,
                net_paid_online,
                payment_method,
                reference_number,
                payment_status
            FROM payments
            WHERE payment_id = :payment_id
        """)
        payment = db.execute(payment_query, {"payment_id": payment_id}).mappings().first()
        if not payment:
            return {"error": "Payment not found"}

        # Step 2: Fetch all linked installments, chit members, and group details
        installment_query = text("""
            SELECT
                pi.installment_id,
                pi.chit_member_id,
                i.month_number,
                i.total_amount,
                cm.chit_group_id,
                cg.chit_name,
                u.full_name
            FROM payment_installments pi
            JOIN installments i ON pi.installment_id = i.installment_id
            JOIN chit_members cm ON pi.chit_member_id = cm.chit_member_id
            JOIN chit_groups cg ON cm.chit_group_id = cg.chit_group_id
            JOIN users u ON cm.user_id = u.user_id
            WHERE pi.payment_id = :payment_id
            ORDER BY i.month_number ASC
        """)
        rows = db.execute(installment_query, {"payment_id": payment_id}).mappings().all()

        # Step 3: Allocate payment amount across installments
        payment_balance = int(payment["payment_amount"])
        installment_details = []

        for row in rows:
            total = row["total_amount"]
            if payment_balance >= total:
                paid = total
                payment_balance -= total
            else:
                paid = payment_balance
                payment_balance = 0

            installment_details.append({
                "installment_id": row["installment_id"],
                "month_number": row["month_number"],
                "total_amount": total,
                "paid_amount": paid,
                "chit_member_id": row["chit_member_id"],
                "chit_group_id": row["chit_group_id"],
                "chit_name": row["chit_name"],
                "full_name": row["full_name"]
            })

            if payment_balance == 0:
                break

        # Step 4: Return final result
        result = {
            "payment_id": payment["payment_id"],
            "payment_amount": payment["payment_amount"],
            "payment_date": str(payment["payment_date"]),
            "net_paid_cash": payment["net_paid_cash"],
            "net_paid_online": payment["net_paid_online"],
            "payment_method": payment["payment_method"],
            "reference_number": payment["reference_number"],
            "payment_status": payment["payment_status"],
            "user_name": user_name,
            "installment_details": installment_details
        }

        return result

    except Exception as e:
        return {"error": str(e)}
    finally:
        db.close()

def delete_chit_member(chit_member_id):
    db = get_db()
    try:
        # Step 1: Fetch chit member
        print(chit_member_id)
        chit_member = db.query(ChitMember).filter(
            ChitMember.chit_member_id == chit_member_id
        ).first()
        if not chit_member:
            return {"message": "Chit member not found"}
        

        # Step 2: Get chit_group to find start_date
        chit_group = db.query(ChitGroup).filter(
            ChitGroup.chit_group_id == chit_member.chit_group_id
        ).first()
        if not chit_group or not chit_group.start_date:
            return {"message": "Chit group or start date not found"}
        

        # Step 3: Calculate month difference
        today = datetime.today()
        start_date = chit_group.start_date
        current_month = ((today.year - start_date.year) * 12) + (today.month - start_date.month) + 1
    

        if current_month > 1:
            return {"message": "Cannot delete: More than 1 month has passed since group start"}

        # Step 4: Fetch member's installments
        installments = db.query(Installment).filter(
            Installment.chit_member_id == chit_member_id
        ).all()

        for i in installments:
            print({k: v for k, v in i.__dict__.items() if not k.startswith('_')})

        # Step 5: Check for PAID status
        for inst in installments:
            status = inst.status
            if status.value == 'paid':
                return {"message": "Cannot delete: Member has paid the installment"}

        # Step 6: Delete unpaid/partial installments and related payment_installments
        for inst in installments:
            db.execute(text("""
                DELETE FROM payment_installments 
                WHERE installment_id = :installment_id
            """), {"installment_id": inst.installment_id})

            db.query(Installment).filter(
                Installment.installment_id == inst.installment_id
            ).delete()

        # Step 7: Delete chit member
        db.query(ChitMember).filter(
            ChitMember.chit_member_id == chit_member_id
        ).delete()

        db.commit()
        return {"message": "Chit member deleted successfully"}

    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()


def get_admin_by_id(admin_id):
    db = get_db()
    try:
        # Fetch admin by ID and ensure the user is active
        admin = db.query(User).filter(
            User.user_id == admin_id,
            User.is_active == True
        ).first()

        if not admin:
            return {"message": "Admin not found"}

        # Prepare admin data as a dictionary
        address = admin.address + " " + admin.city + " " + admin.state + " " + admin.pincode
        return {
            "user_id": admin.user_id,
            "full_name": admin.full_name,
            "email": admin.email,
            "phone_number": admin.phone,
            "is_active": admin.is_active,
            "address": address,
            "created_at": admin.created_at.strftime("%B %Y"),
        }

    finally:
        db.close()



def deactivate_user(user_id):
    db = get_db()
    try:
        # 1. Check if user exists
        user = db.query(User).filter(User.user_id == user_id).first()
        if not user:
            return {"message": "User not found"}

        # 2. Check if user is part of any active chit group
        active_memberships = (
            db.query(ChitMember)
            .join(ChitGroup, ChitMember.chit_group_id == ChitGroup.chit_group_id)
            .filter(
                ChitMember.user_id == user_id,
                ChitGroup.status == "ACTIVE"
            )
            .all()
        )

        if active_memberships:
            return {"message": "User is in an active chit group. Cannot deactivate."}

        # 3. Set is_active = False (soft delete)
        user.is_active = False
        user.updated_at = datetime.now()
        db.commit()

        return {"message": "User has been deactivated successfully"}

    except Exception as e:
        db.rollback()
        return {"error": str(e)}
    finally:
        db.close()