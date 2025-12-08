"""add review fields to segments

Revision ID: add_segment_review_fields
Revises: fbc64edbbfa7_add_raw_text_column_to_sermons
Create Date: 2025-12-08
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_segment_review_fields'
# Point to the actual revision ID string, not the filename.
down_revision = 'fbc64edbbfa7'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('segments', sa.Column('last_reviewed_by', sa.String(length=150), nullable=True))
    op.add_column('segments', sa.Column('last_reviewed_date', sa.DateTime(timezone=True), nullable=True))

def downgrade():
    op.drop_column('segments', 'last_reviewed_date')
    op.drop_column('segments', 'last_reviewed_by')
