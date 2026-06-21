import asyncio
import smtplib
from email.mime.text import MIMEText

from src.core.config import SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, FRONTEND_URL


class EmailService:
    async def enviar_recuperacion(self, email: str, token: str, nombre: str):
        link = f"{FRONTEND_URL}/auth/restablecer?token={token}"
        html = f"""
            <p>Hola {nombre},</p>
            <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
            <p><a href="{link}">{link}</a></p>
            <p>Este enlace expira en 1 hora.</p>
            <p>Si no solicitaste este cambio, ignora este mensaje.</p>
        """
        msg = MIMEText(html, "html")
        msg["Subject"] = "Recuperación de contraseña — La Comarca"
        msg["From"] = SMTP_USER
        msg["To"] = email

        def _send():
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
                server.starttls()
                server.login(SMTP_USER, SMTP_PASSWORD)
                server.sendmail(SMTP_USER, [email], msg.as_string())

        await asyncio.to_thread(_send)
