import asyncio
import sys
import asyncpg

sys.stdout.reconfigure(encoding='utf-8')
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Float, Numeric, JSON
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base
# Import all models so Base.metadata is fully populated
import app.models.tenant
import app.models.user
import app.models.channel
import app.models.conversation
import app.models.product
import app.models.order
import app.models.pipeline
import app.models.campaign
import app.models.automation
import app.models.knowledge
import app.models.ai_config
import app.models.billing
import app.models.admin

def get_sql_type(col: Column) -> str:
    t = col.type
    if isinstance(t, UUID):
        return "UUID"
    if isinstance(t, Boolean):
        return "BOOLEAN"
    if isinstance(t, Integer):
        return "INTEGER"
    if isinstance(t, Numeric):
        return f"NUMERIC({t.precision or 10}, {t.scale or 2})"
    if isinstance(t, Float):
        return "DOUBLE PRECISION"
    if isinstance(t, DateTime):
        return "TIMESTAMP WITH TIME ZONE" if getattr(t, "timezone", False) else "TIMESTAMP WITHOUT TIME ZONE"
    if isinstance(t, JSON):
        return "JSONB"
    if isinstance(t, Text):
        return "TEXT"
    if isinstance(t, String):
        return f"VARCHAR({t.length or 255})"
    return "TEXT"

async def main():
    conn = await asyncpg.connect("postgresql://postgres:postgres@localhost:5432/arisesell")
    print("Connecting to PostgreSQL to check all table schemas against SQLAlchemy models...")

    for table_name, table in Base.metadata.tables.items():
        # Check if table exists
        exists = await conn.fetchval(
            "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = $1);",
            table_name
        )
        if not exists:
            print(f"⚠️ Table {table_name} does not exist in DB yet.")
            continue

        db_cols_rows = await conn.fetch(
            "SELECT column_name FROM information_schema.columns WHERE table_name = $1;",
            table_name
        )
        existing_cols = {r["column_name"] for r in db_cols_rows}

        for col_name, col in table.columns.items():
            if col_name not in existing_cols:
                sql_type = get_sql_type(col)
                nullable = "NULL" if col.nullable else "NULL"
                alter_stmt = f'ALTER TABLE "{table_name}" ADD COLUMN "{col_name}" {sql_type} {nullable};'
                print(f"⚡ Adding missing column: {table_name}.{col_name} ({sql_type})")
                try:
                    await conn.execute(alter_stmt)
                    print(f"  ✅ Added {table_name}.{col_name}")
                except Exception as e:
                    print(f"  ❌ Error adding {table_name}.{col_name}: {e}")

    print("\n🎉 Schema sync & auto-migration completed successfully!")
    await conn.close()

if __name__ == "__main__":
    asyncio.run(main())
