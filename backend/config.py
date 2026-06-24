import os
from dotenv import load_dotenv

load_dotenv()

# Railway automatically sets DATABASE_URL when you add a Postgres plugin.
# Locally falls back to SQLite for development.
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./taskflow.db"
)

JWT_SECRET = os.getenv(
    "JWT_SECRET",
    "super-secret-key-for-taskflow-app-2026"
)

JWT_ALGORITHM = "HS256"

JWT_EXPIRE_DAYS = int(
    os.getenv("JWT_EXPIRE_DAYS", "30")
)

# CORS — allow all origins so the mobile app works from any network.
# In production the Railway URL is already HTTPS so wildcard is fine here.
CORS_ORIGINS = ["*"]

REMINDER_POLL_SECONDS = int(
    os.getenv("REMINDER_POLL_SECONDS", "30")
)

VALID_CATEGORIES = frozenset(
    {
        "General",
        "Work",
        "Personal",
        "Health",
        "Study",
        "Shopping",
    }
)