"""Initial multi-tenant schema baseline

Revision ID: 0001_initial_schema
Revises: 
Create Date: 2026-09-02 02:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '0001_initial_schema'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
