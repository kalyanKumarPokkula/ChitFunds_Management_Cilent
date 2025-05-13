from db import get_db
from models.chit_group import ChitGroup
from models.chit_member import ChitMember
from models.user import User
from models.projection import MonthlyProjection
from models.installment import Installment
import pandas as pd
from flask import jsonify
import uuid
from sqlalchemy import text
from datetime import datetime, timedelta


def chit_groups():
    print("inside the chit groups")
    """
    Retrieves all chit groups from the database, processes the data, 
    and returns a JSON response sorted by status.

    Returns:
        list: List of dictionaries containing chit group details.
    """
    db = get_db()
    try:
        # Query for all chit groups
        query = text("""
            SELECT chit_group_id, chit_name, chit_amount, duration_months, 
                total_members, monthly_installment, start_date, end_date, status
            FROM chit_groups
            ORDER BY 
            CASE 
                WHEN status = 'active' THEN 1
                WHEN status = 'upcoming' THEN 2
                WHEN status = 'completed' THEN 3
                ELSE 4
            END
        """)
        
        result = db.execute(query)
        print(result)

        # Convert rows to dictionaries
        chit_groups_data = [dict(row._mapping) for row in result]
        print(chit_groups_data)
        return chit_groups_data
    finally:
        db.close()


def add_chit(data):
    """
    Adds a new chit group to the database.

    Args:
        data (dict): A dictionary containing details about the chit group.

    Returns:
        dict: A message indicating whether the row was successfully added.
    """
    db = get_db()
    try:
        chit_group_id = str(uuid.uuid4().hex[:12])
        
        new_chit_group = ChitGroup(
            chit_group_id=chit_group_id,
            chit_name=str(data.get("chit_name", "")),
            chit_amount=float(data.get("chit_amount", 0)),
            duration_months=int(data.get("duration_months", 0)),
            total_members=int(data.get("total_members", 0)),
            monthly_installment=float(data.get("monthly_installment", 0)),
            status=str(data.get("status", "")),
            start_date=str(data.get("start_date", "")),
            end_date=str(data.get("end_date", ""))
        )
        
        db.add(new_chit_group)
        db.commit()
        
        return {"message": "Chit group added successfully", "chit_group_id": chit_group_id}
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()


def add_members(data):
    """
    Adds one or more members to a chit group.

    Args:
        data (dict): A dictionary containing chit group ID and user details.

    Returns:
        dict: A message indicating whether the members were successfully added.
    """
    db = get_db()
    try:
        chit_group_id = data.get("chit_group_id")
        members = data.get("user_ids", [])

        print("inside the add members")
        
        # Verify chit group exists
        chit_group = db.query(ChitGroup).filter(ChitGroup.chit_group_id == chit_group_id).first()
        if not chit_group:
            return {"message": "Chit group not found"}
        
        for member in members:
            print(member)
            user_id = member
            
            # Check if member already exists in the group
            existing_member = db.query(ChitMember).filter(
                ChitMember.chit_group_id == chit_group_id,
                ChitMember.user_id == user_id
            ).first()
            
            if existing_member:
                continue  # Skip if already a member
            
            # Create new chit member
            chit_member_id = str(uuid.uuid4().hex[:12])
            new_member = ChitMember(
                chit_member_id=chit_member_id,
                chit_group_id=chit_group_id,
                user_id=user_id
            )
            db.add(new_member)
            
            # Create installments for this member
            # start_date = datetime.strptime(chit_group.start_date, "%Y-%m-%d") if chit_group.start_date else datetime.now()
            
            # for month in range(1, chit_group.duration_months + 1):
            #     due_date = start_date + timedelta(days=30 * month)
            #     installment_id = str(uuid.uuid4().hex[:12])
                
            #     installment = Installment(
            #         installment_id=installment_id,
            #         chit_member_id=chit_member_id,
            #         month_number=month,
            #         due_date=due_date.strftime("%Y-%m-%d"),
            #         total_amount=chit_group.monthly_installment,
            #         status="unpaid",
            #         payment_date=None,
            #         payment_method=None
            #     )
            #     db.add(installment)
        
        db.commit()
        
        return {"message": "Members added successfully to the chit group"}
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()


def add_chit_monthly_projections(data):
    """
    Adds multiple monthly projections for a chit group in the database.

    Args:
        data (dict): A dictionary containing the chit group ID and a list of monthly projections.

    Returns:
        dict: A message indicating whether the rows were successfully added.
    """
    db = get_db()
    try:
        monthly_chit_projections = data.get("monthly_chit_projections", [])
        chit_group_id = data.get("chit_group_id")
        
        for row in monthly_chit_projections:
            projection_id = str(uuid.uuid4().hex[:16])
            
            new_projection = MonthlyProjection(
                monthly_projections_id=projection_id,
                chit_group_id=chit_group_id,
                month_number=int(row.get("month_number", 0)),
                monthly_subcription=float(row.get("monthly_subcription", 0)),  # Will be updated when a user wins the auction
                total_payout=float(row.get("total_payout", 0))
            )
            
            db.add(new_projection)
        
        db.commit()
        
        return {"message": "Monthly projections added successfully"}
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()


def update_chit_group(data):
    """
    Updates a chit group in the database based on the provided data.

    Args:
        data (dict): A dictionary containing the updated values for the chit group.
                     The dictionary must include "chit_group_id" to identify the group.

    Returns:
        dict: A message indicating whether the update was successful or if no changes were detected.
    """
    db = get_db()
    try:
        chit_group_id = data.get("chit_group_id")
        chit_group = db.query(ChitGroup).filter(ChitGroup.chit_group_id == chit_group_id).first()
        
        if not chit_group:
            return {"message": "Chit group not found"}
        
        # Update fields if they exist in the data
        if "chit_name" in data:
            chit_group.chit_name = str(data.get("chit_name"))
        if "chit_amount" in data:
            chit_group.chit_amount = float(data.get("chit_amount"))
        if "duration_months" in data:
            chit_group.duration_months = int(data.get("duration_months"))
        if "total_members" in data:
            chit_group.total_members = int(data.get("total_members"))
        if "monthly_installment" in data:
            chit_group.monthly_installment = float(data.get("monthly_installment"))
        if "status" in data:
            chit_group.status = str(data.get("status"))
        if "start_date" in data:
            chit_group.start_date = str(data.get("start_date"))
        if "end_date" in data:
            chit_group.end_date = str(data.get("end_date"))
        
        db.commit()
        
        return {"message": "Chit group updated successfully"}
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()


# def get_chit_by_id(chit_group_id):
#     """
#     Retrieves details of a specific chit group by its ID from the database.

#     Args:
#         chit_group_id (str): The ID of the chit group to retrieve.

#     Returns:
#         dict: A dictionary containing chit group details along with its monthly projections.
#               If the chit group is not found, returns a JSON error response with a 404 status.
#     """
#     db = get_db()
#     try:
#         chit_group = db.query(ChitGroup).filter(ChitGroup.chit_group_id == str(chit_group_id)).first()
        
#         if not chit_group:
#             return jsonify({"error": "Chit group not found"}), 404
        
#         result = {
#             "chit_group_id": chit_group.chit_group_id,
#             "chit_name": chit_group.chit_name,
#             "chit_amount": chit_group.chit_amount,
#             "duration_months": chit_group.duration_months,
#             "total_members": chit_group.total_members,
#             "monthly_installment": chit_group.monthly_installment,
#             "status": chit_group.status,
#             "start_date": chit_group.start_date,
#             "end_date": chit_group.end_date,
#             "monthly_projections": monthly_projections(chit_group_id)
#         }
        
#         return result
#     finally:
#         db.close()

def get_chit_by_id(chit_group_id):
    """
    Retrieves details of a specific chit group by its ID from the database.

    Args:
        chit_group_id (str or int): The ID of the chit group to retrieve.

    Returns:
        dict: A dictionary containing chit group details along with its monthly projections.
              If the chit group is not found, returns a JSON error response with a 404 status.
    """
    db = get_db()
    try:
        chit_group = db.query(ChitGroup).filter(ChitGroup.chit_group_id == str(chit_group_id)).first()

        if not chit_group:
            return jsonify({"error": "Chit group not found"}), 404

        # Step 1: Calculate current month
        start_date = chit_group.start_date
        duration_months = chit_group.duration_months

        today = datetime.today()
        current_month = ((today.year - start_date.year) * 12 + (today.month - start_date.month) + 1)
        current_month = min(current_month, duration_months)

        # Step 2: Fetch monthly projections
        projections = monthly_projections(chit_group_id)

        # Step 3: Get current projection based on current month
        current_projection = next((item for item in projections if int(item["month_number"]) == current_month), None)

        # Step 4: Update values from current projection
        if current_projection:
            monthly_installment = current_projection["monthly_subcription"]
            chit_amount = current_projection["total_payout"]
        else:
            monthly_installment = chit_group.monthly_installment
            chit_amount = chit_group.chit_amount

        # Step 5: Prepare the result
        result = {
            "chit_group_id": chit_group.chit_group_id,
            "chit_name": chit_group.chit_name,
            "chit_amount": chit_amount,
            "duration_months": chit_group.duration_months,
            "total_members": chit_group.total_members,
            "monthly_installment": monthly_installment,
            "status": chit_group.status,
            "start_date": chit_group.start_date,
            "end_date": chit_group.end_date,
            "monthly_projections": projections,
            "current_month": current_month
        }

        # Step 6: Calculate current month installment stats
        installments = db.execute(text("""
            SELECT 
                COUNT(CASE WHEN status = 'PAID' THEN 1 END) AS paid_count,
                COUNT(CASE WHEN status IN ('UNPAID', 'PARTIAL') THEN 1 END) AS unpaid_count,
                SUM(total_amount) AS total_payable,
                SUM(paid_amount) AS total_paid
            FROM installments
            WHERE chit_member_id IN (
                SELECT chit_member_id FROM chit_members WHERE chit_group_id = :chit_group_id
            )
            AND month_number = :current_month
        """), {
            "chit_group_id": chit_group_id,
            "current_month": current_month
        }).fetchone()

        # Safely handle NULL sums
        paid_count = installments.paid_count or 0
        unpaid_count = installments.unpaid_count or 0
        total_payable = installments.total_payable or 0
        total_paid = installments.total_paid or 0

        # Step 7: Add to result
        result.update({
            "current_month_paid_count": paid_count,
            "current_month_unpaid_count": unpaid_count,
            "current_month_total_payable": total_payable,
            "current_month_total_paid": total_paid
        })

        return result
    finally:
        db.close()


def monthly_projections(chit_group_id):
    """
    Retrieves and processes monthly projection data for a given chit group.

    Args:
        chit_group_id (str): The ID of the chit group to filter projections.

    Returns:
        list[dict]: A list of dictionaries containing monthly projection details
                    along with user information.
    """
    db = get_db()
    try:
        query = text("""
            SELECT mp.monthly_projections_id, mp.month_number, mp.monthly_subcription, 
                mp.total_payout, u.full_name
            FROM monthly_projections mp
            LEFT JOIN users u ON mp.user_id = u.user_id
            WHERE mp.chit_group_id = :chit_group_id
            ORDER BY mp.month_number
        """)
        
        result = db.execute(query, {"chit_group_id": chit_group_id})
        projections = []
        
        for row in result:
            row_dict = row._asdict()
            if row_dict.get("full_name") is None:
                row_dict["full_name"] = ""
            projections.append(row_dict)
        
        return projections
    finally:
        db.close()


def delete_chit_group_by_id(chit_group_id):
    """
    Deletes a chit group and all related data from the database.

    Args:
        chit_group_id (str): The ID of the chit group to delete.

    Returns:
        dict: A message indicating the result of the deletion.
    """
    db = get_db()
    try:
        # Check if the chit group exists
        chit_group = db.query(ChitGroup).filter(ChitGroup.chit_group_id == str(chit_group_id)).first()
        
        if not chit_group:
            return {"message": "Chit group not found"}
        
        # Delete related monthly projections
        db.query(MonthlyProjection).filter(MonthlyProjection.chit_group_id == chit_group_id).delete()
        
        # Get chit members for this group to delete their installments
        chit_members = db.query(ChitMember).filter(ChitMember.chit_group_id == chit_group_id).all()
        
        for member in chit_members:
            # Delete installments for this member
            db.query(Installment).filter(Installment.chit_member_id == member.chit_member_id).delete()
        
        # Delete chit members
        db.query(ChitMember).filter(ChitMember.chit_group_id == chit_group_id).delete()
        
        # Finally delete the chit group
        db.query(ChitGroup).filter(ChitGroup.chit_group_id == chit_group_id).delete()
        
        db.commit()
        
        return {"message": "Chit group and related data deleted successfully"}
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()


def get_users_by_chit_group(chit_group_id):
    """
    Retrieves user details for a specific chit group using a MySQL database.

    Args:
        chit_group_id (str or int): The ID of the chit group.

    Returns:
        list[dict]: A list of dictionaries containing user details for the specified chit group.
    """
    db = get_db()
    try:
        # Step 1: Get chit members in the given group
        query = text("""
            SELECT chit_member_id, user_id, chit_group_id
            FROM chit_members
            WHERE chit_group_id = :chit_group_id
        """)
        result = db.execute(query, {"chit_group_id": chit_group_id})
        matched_members = [dict(row._mapping) for row in result]

        if not matched_members:
            return []

        member_ids = [m["chit_member_id"] for m in matched_members]
        user_id_map = {m["chit_member_id"]: m["user_id"] for m in matched_members}
        chit_group_map = {m["chit_member_id"]: m["chit_group_id"] for m in matched_members}

        # Step 2: Fetch unpaid installments
        query = text("""
            SELECT chit_member_id, total_amount, paid_amount, month_number
            FROM installments
            WHERE chit_member_id IN :member_ids AND status = 'unpaid'
        """)
        result = db.execute(query, {"member_ids": tuple(member_ids)})
        installments = [dict(row._mapping) for row in result]

        # Step 3: Aggregate pending installments
        pending_summary = {}
        for inst in installments:
            cm_id = inst["chit_member_id"]
            total = float(inst.get("total_amount") or 0)
            paid = float(inst.get("paid_amount") or 0)
            pending_amt = total - paid

            if cm_id not in pending_summary:
                pending_summary[cm_id] = {"total_pending_amount": 0, "pending_months": 0}
            pending_summary[cm_id]["total_pending_amount"] += pending_amt
            pending_summary[cm_id]["pending_months"] += 1

        # Step 4: Get user details
        user_ids = list(set(m["user_id"] for m in matched_members))
        query = text("""
            SELECT user_id, full_name, phone
            FROM users
            WHERE user_id IN :user_ids
        """)
        result = db.execute(query, {"user_ids": tuple(user_ids)})
        users = {row._mapping["user_id"]: dict(row._mapping) for row in result}

        # Step 5: Get lifted members from monthly_projections
        query = text("""
            SELECT user_id, month_number, total_payout
            FROM monthly_projections
            WHERE chit_group_id = :chit_group_id AND user_id IS NOT NULL
        """)
        result = db.execute(query, {"chit_group_id": chit_group_id})
        projections = {row._mapping["user_id"]: dict(row._mapping) for row in result}

        # Step 6: Combine all into final result
        final_result = []
        for cm in matched_members:
            cm_id = cm["chit_member_id"]
            uid = cm["user_id"]

            user_info = users.get(uid, {})
            pending = pending_summary.get(cm_id, {"total_pending_amount": 0, "pending_months": 0})
            projection = projections.get(uid, {"month_number": "not_lifted", "total_payout": 0})

            final_result.append({
                "user_id": uid,
                "chit_member_id": cm_id,
                "chit_group_id": cm["chit_group_id"],
                "full_name": user_info.get("full_name", ""),
                "phone": user_info.get("phone", ""),
                "month_number": projection["month_number"],
                "total_payout": projection["total_payout"],
                "pending_months": pending["pending_months"],
                "total_pending_amount": pending["total_pending_amount"],
            })

        return final_result

    finally:
        db.close()


def chit_lifted_member(data):
    """
    Updates the monthly projection when a member has won the auction.

    Args:
        data (dict): A dictionary containing details about the winning member.

    Returns:
        dict: A message indicating whether the update was successful.
    """
    db = get_db()
    try:
        chit_group_id = data.get("chit_group_id")
        month_number = int(data.get("month_number", 0))
        user_id = data.get("user_id")
        
        # Update the monthly projection for this month and chit
        projection = db.query(MonthlyProjection).filter(
            MonthlyProjection.chit_group_id == chit_group_id,
            MonthlyProjection.month_number == month_number
        ).first()
        
        if not projection:
            return {"message": "Monthly projection not found"}
        
        projection.user_id = user_id
        projection.lifted_date = datetime.now().date()
        db.commit()
        
        return {"message": "Chit lifted member updated successfully"}
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()


