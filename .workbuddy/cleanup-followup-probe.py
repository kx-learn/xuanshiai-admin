"""Remove everything seeded by the /customer-follow-up verification probes."""
import pymysql

conn = pymysql.connect(host="127.0.0.1", port=3306, user="root", password="051019", database="xuanshiai")
try:
    with conn.cursor() as cur:
        deleted = {}
        cur.execute("DELETE FROM member_follow_up WHERE content LIKE 'PROBE %'")
        deleted["member_follow_up"] = cur.rowcount
        cur.execute("DELETE FROM member_call_record WHERE remark LIKE 'PROBE %'")
        deleted["member_call_record"] = cur.rowcount
        cur.execute("DELETE FROM admin_content_item WHERE id IN (1, 2)")
        deleted["admin_content_item"] = cur.rowcount
        cur.execute("UPDATE user_profile SET intention_level = NULL WHERE user_id IN (1, 2, 3)")
        deleted["user_profile.intention_level"] = cur.rowcount
    conn.commit()

    with conn.cursor() as cur:
        print("deleted:", deleted)
        for table, where in (
            ("member_follow_up", "content LIKE 'PROBE %'"),
            ("member_call_record", "remark LIKE 'PROBE %'"),
            ("admin_content_item", "id IN (1, 2)"),
        ):
            cur.execute(f"SELECT COUNT(*) FROM {table} WHERE {where}")
            print(f"  {table} remaining: {cur.fetchone()[0]}")
        cur.execute("SELECT user_id, intention_level FROM user_profile WHERE user_id IN (1,2,3)")
        print("  user_profile rows:", cur.fetchall())
finally:
    conn.close()
