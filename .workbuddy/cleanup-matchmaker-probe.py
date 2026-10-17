"""Remove the probe service-matchmaker identity that was seeded onto an existing member.

`.workbuddy/seed-matchmaker-probe.py` granted `service_matchmaker` to an existing
demo member (users.id=3, phone 13812345678) by inserting an approved
`user_matchmaker_apply` row ('PROBE 红娘') plus a `user_role` row, purely so the
线索管理 分派跟进 dropdown had a second option during verification.

That was workaround data for a real gap: the workspace seeder granted
`user_role.service_matchmaker` without ever writing `user_matchmaker_apply`, and
`lead_options` / `_validate_owner` require both. The seeder now writes the apply
row itself (see `_ensure_matchmaker_apply`), so this probe identity is obsolete.

Retiring it has to mean deleting, not suspending: `status=0` on
`user_matchmaker_apply` means "待审核申请" (admin_home.py counts status=0 as
matchmaker_application), so a suspended probe row would surface as a phantom
红娘申请 in the review list.

The rows are identified by the probe's own signature (real_name 'PROBE 红娘' and
its granted_at timestamp), never by bare user id, so a real identity for user 3
created later is never touched.

Usage:  python .workbuddy/cleanup-matchmaker-probe.py          # report only
        python .workbuddy/cleanup-matchmaker-probe.py --purge  # delete the probe rows
"""

import sys

import pymysql

DB = dict(host="127.0.0.1", port=3306, user="root", password="051019", database="xuanshiai", charset="utf8mb4")

# The probe wrote both rows within the same second, but the two columns record it in
# different zones: `user_matchmaker_apply.created_at` was filled with UTC_TIMESTAMP()
# by the probe while `user_role.granted_at` fell back to the column default,
# CURRENT_TIMESTAMP, which MySQL renders in the session's local zone (UTC+8 here).
# So the timestamps land 8 hours apart on the same calendar date — match on the date.
PROBE_NAME = "PROBE 红娘"
PROBE_USER_ID = 3

purge = "--purge" in sys.argv

conn = pymysql.connect(**DB, cursorclass=pymysql.cursors.DictCursor)
try:
    with conn.cursor() as cur:
        cur.execute(
            """SELECT id, user_id, real_name, phone, status, created_at
               FROM user_matchmaker_apply WHERE user_id=%s AND real_name=%s""",
            (PROBE_USER_ID, PROBE_NAME),
        )
        apply_rows = cur.fetchall()
        print("probe apply rows:", apply_rows)

        apply_dates = {r["created_at"].date() for r in apply_rows}
        cur.execute(
            "SELECT id, user_id, role_code, status, granted_at FROM user_role WHERE user_id=%s AND role_code='service_matchmaker'",
            (PROBE_USER_ID,),
        )
        role_rows = [r for r in cur.fetchall() if r["granted_at"].date() in apply_dates]
        print("matching role rows:", role_rows)

        if not purge:
            print("\n(report only — re-run with --purge to delete these rows)")
        elif not apply_rows:
            print("\nno probe rows present; nothing to delete")
        else:
            cur.execute(
                "DELETE FROM user_matchmaker_apply WHERE id IN (%s)" % ",".join(str(r["id"]) for r in apply_rows)
            )
            print("\ndeleted apply rows:", cur.rowcount)
            if role_rows:
                cur.execute(
                    "DELETE FROM user_role WHERE id IN (%s)" % ",".join(str(r["id"]) for r in role_rows)
                )
                print("deleted role rows:", cur.rowcount)
            conn.commit()

        cur.execute(
            """SELECT a.user_id, a.real_name, a.phone, u.nickname, u.phone
               FROM user_matchmaker_apply a JOIN users u ON u.id = a.user_id
               WHERE a.application_type='service_matchmaker' AND a.status=1 ORDER BY a.user_id"""
        )
        print("\napproved service matchmakers now:", cur.fetchall())
finally:
    conn.close()
