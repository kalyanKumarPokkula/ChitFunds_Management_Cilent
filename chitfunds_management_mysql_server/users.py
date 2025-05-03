from db import get_db
from models.user import User
from models.chit_member import ChitMember
from models.chit_group import ChitGroup
from models.installment import Installment
import uuid
from datetime import datetime
import pandas as pd
from sqlalchemy import text

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
        
        # Create new user
        new_user = User(
            user_id=user_id,
            full_name=str(data.get("full_name")),
            email=str(data.get("email")),
            password=str("123456"),
            phone=str(data.get("phone")),
            aadhaar_number=str(data.get("aadhaar_number")),
            pan_number=str(data.get("pan_number")),
            address=str(data.get("address")),
            city=str(data.get("city")),
            state=str(data.get("state")),
            pincode=str(data.get("pincode")),
            created_at=datetime.now(),
            is_verified=True,
            updated_at=datetime.now()
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

def get_users_chit_details(user_id):
    db = get_db()
    try:
        # Get user information
        user = db.query(User).filter(User.user_id == user_id).first()
        
        if not user:
            return {"error": "User not found"}
        
        user_information = {
            "full_name": user.full_name,
            "email": user.email,
            "phone": user.phone,
            "address": user.address,
            "state": user.state,
            "city": user.city,
            "user_id": user.user_id,
            "pincode": user.pincode,
            "is_verified": user.is_verified
        }
        
        # Get active chits for the user
        active_chits_query = text("""
            SELECT cg.chit_group_id, cg.chit_name, cg.start_date, cg.duration_months,
                   cm.chit_member_id
            FROM chit_groups cg
            JOIN chit_members cm ON cg.chit_group_id = cm.chit_group_id
            WHERE cm.user_id = :user_id AND cg.status = 'active'
        """)
        
        active_chits_result = db.execute(active_chits_query, {"user_id": user_id})
        active_chits = [dict(row) for row in active_chits_result]
        
        if not active_chits:
            user_details = {
                "user": user_information,
                "current_month_payment": [],
                "payment_overdues": [],
                "chit_count": 0,
                "current_total_amount": 0
            }
            return user_details
        
        # Get current month for each chit
        today = datetime.today()
        current_month_payments = []
        payment_overdues = []
        current_total_amount = 0
        
        for chit in active_chits:
            start_date = datetime.strptime(chit["start_date"], "%Y-%m-%d") if chit["start_date"] else datetime.now()
            current_month = min(
                ((today.year - start_date.year) * 12 + (today.month - start_date.month) + 1),
                int(chit["duration_months"])
            )
            
            # Get current month installment
            current_installment = db.query(Installment).filter(
                Installment.chit_member_id == chit["chit_member_id"],
                Installment.month_number == current_month
            ).first()
            
            if current_installment:
                current_month_payments.append({
                    "chit_member_id": chit["chit_member_id"],
                    "chit_group_id": chit["chit_group_id"],
                    "chit_name": chit["chit_name"],
                    "month_number": current_month,
                    "total_amount": current_installment.total_amount,
                    "status_x": current_installment.status
                })
                
                if current_installment.status != "paid":
                    current_total_amount += current_installment.total_amount
            
            # Get overdue installments
            overdue_installments_query = text("""
                SELECT i.chit_member_id, i.month_number, i.total_amount, i.status,
                       COUNT(i.month_number) as overdue_months,
                       SUM(i.total_amount) as total_overdue_amount
                FROM installments i
                WHERE i.chit_member_id = :chit_member_id
                AND i.status != 'paid'
                GROUP BY i.chit_member_id
            """)
            
            overdue_result = db.execute(overdue_installments_query, {"chit_member_id": chit["chit_member_id"]})
            overdue_data = [dict(row) for row in overdue_result]
            
            if overdue_data:
                for overdue in overdue_data:
                    payment_overdues.append({
                        "chit_group_id": chit["chit_group_id"],
                        "chit_member_id": overdue["chit_member_id"],
                        "chit_name": chit["chit_name"],
                        "overdue_months": overdue["overdue_months"],
                        "total_overdue_amount": overdue["total_overdue_amount"]
                    })
        
        user_details = {
            "user": user_information,
            "current_month_payment": current_month_payments,
            "payment_overdues": payment_overdues,
            "chit_count": len(active_chits),
            "current_total_amount": current_total_amount
        }
        
        return user_details
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()

def get_current_month_projections_data(monthly_projections_df, chit_group_df):
    # This function can be implemented for MySQL if needed
    pass

def member_overdue_amounts(df, chit_group_ids):
    # This function's logic is now handled within get_users_chit_details
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
        """)
        
        result = db.execute(installments_query, {"member_id": member_id})
        installments = [dict(row) for row in result]
        
        return installments
    finally:
        db.close()

def get_current_month_payment_stats():
    db = get_db()
    try:
        # Get current month payment statistics
        stats_query = text("""
            SELECT cg.chit_group_id, cg.chit_name, cg.start_date, cg.duration_months,
                COUNT(CASE WHEN i.status = 'paid' THEN 1 ELSE NULL END) as paid_count,
                COUNT(CASE WHEN i.status = 'unpaid' THEN 1 ELSE NULL END) as unpaid_count,
                SUM(CASE WHEN i.status = 'paid' THEN i.total_amount ELSE 0 END) as paid_amount,
                SUM(CASE WHEN i.status = 'unpaid' THEN i.total_amount ELSE 0 END) as unpaid_amount
            FROM chit_groups cg
            JOIN chit_members cm ON cg.chit_group_id = cm.chit_group_id
            JOIN installments i ON cm.chit_member_id = i.chit_member_id
            WHERE cg.status = 'active'
            GROUP BY cg.chit_group_id, cg.chit_name, cg.start_date, cg.duration_months
        """)
        
        result = db.execute(stats_query)
        stats = [dict(row) for row in result]
        
        return stats
    finally:
        db.close()
