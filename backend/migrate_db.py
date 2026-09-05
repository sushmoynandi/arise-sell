import asyncio
import asyncpg

async def main():
    conn = await asyncpg.connect("postgresql://postgres:postgres@localhost:5432/arisesell")
    print("Connected to PostgreSQL successfully.")
    
    # 1. Check subscription_plans columns
    rows = await conn.fetch("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'subscription_plans';")
    cols = {r["column_name"] for r in rows}
    print("Current columns in subscription_plans:", sorted(list(cols)))
    
    # Add show_on_home if missing
    if "show_on_home" not in cols:
        print("Adding show_on_home to subscription_plans...")
        await conn.execute("ALTER TABLE subscription_plans ADD COLUMN show_on_home BOOLEAN DEFAULT TRUE;")
        print("Added show_on_home successfully.")

    if "max_stores" not in cols:
        print("Adding max_stores to subscription_plans...")
        await conn.execute("ALTER TABLE subscription_plans ADD COLUMN max_stores INTEGER DEFAULT 1;")
        print("Added max_stores successfully.")

    if "max_seats" not in cols:
        print("Adding max_seats to subscription_plans...")
        await conn.execute("ALTER TABLE subscription_plans ADD COLUMN max_seats INTEGER DEFAULT 1;")
        print("Added max_seats successfully.")

    # 2. Check businesses columns
    b_rows = await conn.fetch("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'businesses';")
    b_cols = {r["column_name"] for r in b_rows}
    print("\nCurrent columns in businesses:", sorted(list(b_cols)))

    # 3. Check users columns
    u_rows = await conn.fetch("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users';")
    u_cols = {r["column_name"] for r in u_rows}
    print("\nCurrent columns in users:", sorted(list(u_cols)))

    await conn.close()

if __name__ == "__main__":
    asyncio.run(main())
