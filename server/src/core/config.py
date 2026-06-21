DB_HOST = "localhost"
DB_PORT = 5432
DB_NAME = "Comarca"
DB_USER = "postgres"
DB_PASSWORD = "123"

DATABASE_URL = f"postgresql+asyncpg://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

JWT_SECRET = "la-comarca-secret-key-temp"
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USER = "comarcatesting@gmail.com"
SMTP_PASSWORD = "rjak mvzu mbek vmun"
FRONTEND_URL = "http://localhost:4200"

NUBEFACT_API_URL = "https://api.nubefact.com/api/v1/b046e0ef-bcd5-4af6-b627-fa439b3dd055"
NUBEFACT_API_KEY = "6e82244b16aa4e0cb4e367e1593153425f7c376ddf6545019350219d7d00e556"
