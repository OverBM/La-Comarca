import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL") or "postgresql+asyncpg://postgres:123@localhost:5432/Comarca"

JWT_SECRET = os.getenv("JWT_SECRET") or "la-comarca-secret-key-temp"
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

SMTP_HOST = os.getenv("SMTP_HOST") or "smtp.gmail.com"
SMTP_PORT = int(os.getenv("SMTP_PORT") or "587")
SMTP_USER = os.getenv("SMTP_USER") or ""
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD") or ""
FRONTEND_URL = os.getenv("FRONTEND_URL") or "http://localhost:4200"

NUBEFACT_API_URL = os.getenv("NUBEFACT_API_URL") or "https://api.nubefact.com"
NUBEFACT_API_KEY = os.getenv("NUBEFACT_API_KEY") or ""
