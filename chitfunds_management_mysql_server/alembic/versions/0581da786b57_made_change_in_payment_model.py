"""made change in payment model

Revision ID: 0581da786b57
Revises: eae5bf6ca72f
Create Date: 2025-05-08 17:41:38.125036

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision: str = '0581da786b57'
down_revision: Union[str, None] = 'eae5bf6ca72f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Execute each statement separately
    op.execute("ALTER TABLE payments MODIFY chit_member_id VARCHAR(150) NOT NULL")
    op.execute("ALTER TABLE payments MODIFY installment_id VARCHAR(150) NOT NULL")


def downgrade() -> None:
    """Downgrade schema."""
    # Execute each statement separately
    op.execute("ALTER TABLE payments MODIFY chit_member_id VARCHAR(36) NOT NULL")
    op.execute("ALTER TABLE payments MODIFY installment_id VARCHAR(36) NOT NULL")
