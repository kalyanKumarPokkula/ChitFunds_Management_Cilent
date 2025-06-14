"""Add is_active column to users

Revision ID: d8f9afeccceb
Revises: df235cad093d
Create Date: 2025-06-12 15:52:52.663164

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd8f9afeccceb'
down_revision: Union[str, None] = 'df235cad093d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
