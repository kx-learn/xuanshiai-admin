"""Verify find_conflicting_lead_id after the self-exclusion fix.

Cases:
  1. self-edit (own phone/wechat, own id excluded) -> None  (was: bogus conflict)
  2. unrelated contact                            -> None
  3. genuine collision with another lead          -> that other id
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
        rows = (await db.execute(text("SELECT id, phone, wechat FROM customer_lead ORDER BY id"))).all()

        print("case 1/2 — self-edit and unrelated contact:")
        for lead_id, phone, wechat in rows:
            self_conflict = await find_conflicting_lead_id(db, phone, wechat, exclude_lead_id=lead_id)
            unrelated = await find_conflicting_lead_id(db, "19900000000", "brand_new_wx", exclude_lead_id=lead_id)
            print(f"  lead {lead_id}: self={self_conflict} unrelated={unrelated}")

        print("case 3 — genuine collision (lead 1's contacts, editing as lead 2):")
        first = rows[0]
        collision = await find_conflicting_lead_id(db, first[1], first[2], exclude_lead_id=rows[1][0])
        print(f"  -> {collision} (expected {first[0]})")

        print("case 4 — phone-only / wechat-only inputs:")
        print("  phone only:", await find_conflicting_lead_id(db, "19900000000", None, exclude_lead_id=1))
        print("  wechat only:", await find_conflicting_lead_id(db, None, "brand_new_wx", exclude_lead_id=1))
        print("  both empty:", await find_conflicting_lead_id(db, "", "  ", exclude_lead_id=1))
    await engine.dispose()


asyncio.run(main())
