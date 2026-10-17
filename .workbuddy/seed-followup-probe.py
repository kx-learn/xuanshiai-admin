"""Seed throwaway rows for verifying /customer-follow-up, printing what it made."""
import pymysql

conn = pymysql.connect(host="127.0.0.1", user="root", password="051019", database="xuanshiai", charset="utf8mb4")
cur = conn.cursor()

# Pick up to 4 members that already have wechat_added data so the 加上了吗? filter bites.
cur.execute("SELECT id, nickname, wechat_added FROM users WHERE wechat_added IS NOT NULL ORDER BY id LIMIT 6")
members = cur.fetchall()
print("candidate members:", members)
if not members:
    raise SystemExit("no members with wechat_added set")

# Also keep the two seeded content items in mind: this script only touches follow-up/call tables.
cur.execute("SELECT id FROM admin_content_item ORDER BY id")
print("admin_content_item ids present:", cur.fetchall())

# Give the first few members an intention_level so 客户意向 has something to filter on.
for user_id, _, _ in members[:3]:
    cur.execute(
        "INSERT INTO user_profile (user_id, intention_level) VALUES (%s, %s) "
        "ON DUPLICATE KEY UPDATE intention_level = VALUES(intention_level)",
        (user_id, (user_id % 3) + 1),
    )

follow_ups = [
    (members[0][0], "PHONE", "PROBE 电话沟通，客户反馈本周有空到店", 5),
    (members[1][0], "WECHAT", "PROBE 微信沟通，已发送资料包", 5),
    (members[2][0], "VISIT", "PROBE 到店面谈，已约定周六下午", 5),
]
for user_id, method, content, created_by in follow_ups:
    cur.execute(
        "INSERT INTO member_follow_up (user_id, method, content, created_by, created_at) "
        "VALUES (%s, %s, %s, %s, NOW())",
        (user_id, method, content, created_by),
    )

calls = [
    (members[0][0], "OUTBOUND", "COMPLETED", 125, "PROBE 已沟通", 5),
    (members[1][0], "INBOUND", "MISSED", 0, "PROBE 未接听", 5),
]
for user_id, direction, status, duration, remark, created_by in calls:
    cur.execute(
        "INSERT INTO member_call_record (user_id, direction, status, duration_seconds, remark, created_by, created_at) "
        "VALUES (%s, %s, %s, %s, %s, %s, NOW())",
        (user_id, direction, status, duration, remark, created_by),
    )

conn.commit()
cur.execute("SELECT id, user_id, method FROM member_follow_up WHERE content LIKE 'PROBE%'")
print("seeded member_follow_up:", cur.fetchall())
cur.execute("SELECT id, user_id, direction FROM member_call_record WHERE remark LIKE 'PROBE%'")
print("seeded member_call_record:", cur.fetchall())
conn.close()
