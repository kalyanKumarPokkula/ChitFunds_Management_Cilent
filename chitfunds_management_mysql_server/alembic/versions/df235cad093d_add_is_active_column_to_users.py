"""Add is_active column to users

Revision ID: df235cad093d
Revises: 0eb72bc29ab8
Create Date: 2025-06-12 15:52:31.983373

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'df235cad093d'
down_revision: Union[str, None] = '0eb72bc29ab8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
