from users import get_members, get_payments, get_users_chit_details, get_current_month_payment_stats, process_payment,get_unpaid_installments
import uuid
data = {
    "chit_member_id" : "3c27dd148d9f",
    "installment_ids" : [
         "1",
       "3"
    ],
    "payment_amount" : 6400,
    "payment_method": "cash",
    "reference_number" : "cash"
}
get_payments()

