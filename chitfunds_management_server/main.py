from users import get_members, get_users_chit_details, get_current_month_payment_stats
import uuid

print(uuid.uuid4().hex[:16])
get_current_month_payment_stats()