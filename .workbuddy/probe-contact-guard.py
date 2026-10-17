"""Run the real find_conflicting_lead_id against the live DB for each lead.

Also dumps the exact rows so collation/whitespace surprises are visible.
"""
import asyncio
import sys

sys.path.insert(0, r"E:\houduan\xuanshiai")

from sqlalchemy import text
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.services.customer_lead_contact import find_conflicting_lead_id

DSN = "mysql+aiomysql://root:051019@127.0.0.1:3306/xuanshiai"


async def main() -> None:
    engine = create_async_engine(DSN, future=True)
    session_factory = async_sessionmaker(engine, expire_on_commit=False)
    async with session_factory() as db:
        rows = (await db.execute(text("SELECT id, phone, wechat, status FROM customer_lead ORDER BY id"))).all()
        for lead_id, phone, wechat, status in rows:
            conflict = await find_conflicting_lead_id(db, phone, wechat, exclude_lead_id=lead_id)
            print(f"lead {lead_id} phone={phone!r} wechat={wechat!r} status={status} -> conflict={conflict}")

        print("\n-- same-phone in-range check --")
        print("total leads:", (await db.execute(text("SELECT COUNT(*) FROM customer_lead"))).scalar())
    await engine.dispose()


asyncio.run(main())
