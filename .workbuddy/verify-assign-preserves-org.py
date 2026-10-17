"""Verify assign_lead writes only the fields the caller sent.

Case A: send only matchmaker_id -> organization_id must survive (was: NULLed).
Case B: send both -> both must be written (the existing modal path must keep working).
"""
import json
import urllib.error
import urllib.request

import pymysql

TOKEN = open(r"C:\Users\21612\AppData\Local\Temp\admin_token.txt", encoding="utf-8").read().strip()
URL = "http://127.0.0.1:8000/api/v1/admin/customer-leads/3/assignment"

DB = dict(host="127.0.0.1", port=3306, user="root", password="051019", database="xuanshiai")


def assign(body: dict) -> tuple[int, str]:
    req = urllib.request.Request(
        URL,
        data=json.dumps(body).encode(),
        headers={"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"},
        method="PATCH",
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, resp.read().decode()
    except urllib.error.HTTPError as err:
        return err.code, err.read().decode()


def read_lead() -> tuple:
    conn = pymysql.connect(**DB)
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT matchmaker_id, organization_id FROM customer_lead WHERE id = 3")
            return cur.fetchone()
    finally:
        conn.close()


def seed(org):
    conn = pymysql.connect(**DB)
    try:
        with conn.cursor() as cur:
            cur.execute("UPDATE customer_lead SET organization_id = %s WHERE id = 3", (org,))
        conn.commit()
    finally:
        conn.close()


print("=== Case A: only matchmaker_id, organization_id must survive ===")
seed(1)
print("  before:", read_lead())
status, body = assign({"matchmaker_id": 3})
print("  HTTP", status, body[:120])
after = read_lead()
print("  after: ", after)
print("  PASS" if after == (3, 1) else "  FAIL")

print("\n=== Case B: both fields, both must be written ===")
seed(1)
status, body = assign({"matchmaker_id": 3, "organization_id": None})
print("  HTTP", status, body[:120])
after = read_lead()
print("  after: ", after)
print("  PASS" if after == (3, None) else "  FAIL")

# leave the demo row tidy
seed(1)
print("\nrestored:", read_lead())
