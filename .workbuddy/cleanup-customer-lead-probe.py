"""Report (and optionally clean) everything the /love-customer-list probes mutated.

Run with no args to inspect; run with `clean` to restore the demo state.

Touched by this session's verification work:
  - customer_lead 1/2: abandoned then restored -> status NEW, matchmaker_id NULL
  - customer_lead 1/2: temporary abandonment rows
  - customer_lead 3: matchmaker_id / organization_id / audit_status mutated by assign tests
  - users.id=3: a PROBE 红娘 user_matchmaker_apply + user_role row (seeded for the assign test)
"""
import sys

import pymysql

DB = dict(host="127.0.0.1", port=3306, user="root", password="051019", database="xuanshiai", charset="utf8mb4")
clean = len(sys.argv) > 1 and sys.argv[1] == "clean"

conn = pymysql.connect(**DB)
try:
    with conn.cursor() as cur:
        print("=== customer_lead ===")
        cur.execute(
            "SELECT id, name, phone, wechat, source, intention_level, status, audit_status, matchmaker_id, organization_id FROM customer_lead ORDER BY id"
        )
        for row in cur.fetchall():
            print("  ", row)

        print("=== customer_lead_abandonment ===")
        cur.execute("SELECT id, lead_id, reason, restored_at, restore_reason FROM customer_lead_abandonment ORDER BY id")
        for row in cur.fetchall():
            print("  ", row)

        print("=== probe matchmaker rows (users.id=3) ===")
        cur.execute("SELECT id, user_id, application_type, status FROM user_matchmaker_apply WHERE user_id = 3")
        for row in cur.fetchall():
            print("   apply", row)
        cur.execute("SELECT id, user_id, role_code, status FROM user_role WHERE user_id = 3")
        for row in cur.fetchall():
            print("   role ", row)

        if clean:
            print("\n=== cleaning ===")
            # remove the abandonment rows this session created
            cur.execute(
                "DELETE FROM customer_lead_abandonment WHERE reason = %s OR restore_reason = %s",
                ("筛选联调临时弃海", "筛选联调结束还原"),
            )
            print("   deleted abandonment rows:", cur.rowcount)

            # restore leads 1/2 to the seed state from scripts/seed_lead_workbench_demo.py
            cur.execute(
                "UPDATE customer_lead SET status = %s, matchmaker_id = %s, organization_id = %s WHERE id = %s",
                ("NEW", None, None, 1),
            )
            cur.execute(
                "UPDATE customer_lead SET status = %s, matchmaker_id = %s, organization_id = %s WHERE id = %s",
                ("NEW", None, None, 2),
            )
            print("   restored leads 1/2 to seed status")
            conn.commit()
finally:
    conn.close()
