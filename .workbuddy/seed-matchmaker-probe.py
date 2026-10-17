"""Seed a second service matchmaker so the 分派跟进 dropdown has a real option to switch to.

Adds an approved `user_matchmaker_apply` row for an existing member user
(idempotent), so /customer-leads/options returns a non-empty `matchmakers`.
"""
import pymysql

USER_ID = 3  # existing member with a nickname-less profile is fine; options join only needs users + user_role

conn = pymysql.connect(host="127.0.0.1", port=3306, user="root", password="051019", database="xuanshiai")
try:
    with conn.cursor() as cur:
        # ensure the user exists and holds the service_matchmaker role
        cur.execute("SELECT COUNT(*) FROM users WHERE id = %s", (USER_ID,))
        if not cur.fetchone()[0]:
            raise SystemExit(f"users.id={USER_ID} does not exist; adjust USER_ID")

        cur.execute(
            """INSERT INTO user_role (user_id, role_code, status)
               SELECT %s, 'service_matchmaker', 1
               WHERE NOT EXISTS (
                 SELECT 1 FROM user_role WHERE user_id = %s AND role_code = 'service_matchmaker'
               )""",
            (USER_ID, USER_ID),
        )
        cur.execute(
            "UPDATE user_role SET status = 1 WHERE user_id = %s AND role_code = 'service_matchmaker'",
            (USER_ID,),
        )

        cur.execute(
            """INSERT INTO user_matchmaker_apply
                 (user_id, application_type, real_name, phone, status, created_at, updated_at)
               SELECT %s, 'service_matchmaker', 'PROBE 红娘', '13800000000', 1, UTC_TIMESTAMP(), UTC_TIMESTAMP()
               WHERE NOT EXISTS (
                 SELECT 1 FROM user_matchmaker_apply
                 WHERE user_id = %s AND application_type = 'service_matchmaker'
               )""",
            (USER_ID, USER_ID),
        )
        cur.execute(
            "UPDATE user_matchmaker_apply SET status = 1 WHERE user_id = %s AND application_type = 'service_matchmaker'",
            (USER_ID,),
        )
    conn.commit()

    with conn.cursor() as cur:
        cur.execute(
            """SELECT a.user_id, a.status, u.nickname FROM user_matchmaker_apply a
               JOIN users u ON u.id = a.user_id
               WHERE a.application_type = 'service_matchmaker' AND a.status = 1"""
        )
        print("approved service matchmakers:", cur.fetchall())
finally:
    conn.close()

