import sqlite3

conn = sqlite3.connect('taskflow.db')
cur = conn.cursor()

print("=== TABLES ===")
cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
print(cur.fetchall())

print("\n=== USERS ===")
cur.execute("SELECT id, name, email FROM users")
print(cur.fetchall())

print("\n=== TASKS ===")
cur.execute("SELECT id, title, status, due_date, due_time, user_id FROM tasks")
for row in cur.fetchall():
    print(row)

print("\n=== REMINDERS ===")
cur.execute("SELECT id, task_id, reminder_time, status FROM reminders")
for row in cur.fetchall():
    print(row)

conn.close()
print("\nDone.")
