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
