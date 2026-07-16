import os
import requests
import logging
from datetime import datetime, timezone

logger = logging.getLogger(__name__)


class WhatsAppService:
    """
    Sends WhatsApp messages via the WhatsApp Business API (Meta)
    or Twilio WhatsApp sandbox for testing.
    """

    def __init__(self):
        self.provider        = os.getenv("WHATSAPP_PROVIDER", "twilio")
        self.frontend_url    = os.getenv("FRONTEND_URL", "https://photobooking-zeta.vercel.app")

        if self.provider == "twilio":
            self.account_sid  = os.getenv("TWILIO_ACCOUNT_SID")
            self.auth_token   = os.getenv("TWILIO_AUTH_TOKEN")
            self.from_number  = os.getenv("TWILIO_WHATSAPP_FROM", "whatsapp:+14155238886")
        else:
            self.access_token = os.getenv("WA_ACCESS_TOKEN")
            self.phone_id     = os.getenv("WA_PHONE_NUMBER_ID")

    def _normalize_phone(self, phone: str) -> str:
        phone = phone.strip().replace(" ", "").replace("-", "").replace("+", "")
        if phone.startswith("0"):
            phone = "254" + phone[1:]
        if not phone.startswith("254"):
            phone = "254" + phone
        return phone

    def send_gallery_ready(self, phone: str, client_name: str, package_name: str, gallery_id: str, is_paid: bool) -> dict:
        gallery_link = f"{self.frontend_url}/dashboard/gallery/{gallery_id}"

        if is_paid:
            download_note = "Your downloads are ready. Click the link above to view and download your photos."
        else:
            download_note = (
                f"To download your photos, please complete payment of your {package_name} package. "
                "Your downloads will unlock automatically after payment is confirmed."
            )

        message = (
            f"📸 Hello *{client_name}*,\n\n"
            f"Great news! Your *{package_name}* gallery is now ready.\n\n"
            f"View your photos here:\n{gallery_link}\n\n"
            f"{download_note}\n\n"
            f"Thank you for choosing *LensKenya*. "
            f"We appreciate your trust and hope you enjoy your memories! ❤️"
        )

        if self.provider == "twilio":
            return self._send_via_twilio(phone, message)
        else:
            return self._send_via_meta(phone, message)

    def send_booking_confirmed(self, phone: str, client_name: str, package_name: str, booking_date: str) -> dict:
        message = (
            f"✅ Hello *{client_name}*,\n\n"
            f"Your *{package_name}* booking has been confirmed!\n\n"
            f"📅 Date: *{booking_date}*\n\n"
            f"We will be in touch soon with more details.\n\n"
            f"Thank you for choosing *LensKenya*! 📸"
        )

        if self.provider == "twilio":
            return self._send_via_twilio(phone, message)
        else:
            return self._send_via_meta(phone, message)

    def _send_via_twilio(self, phone: str, message: str) -> dict:
        if not self.account_sid or not self.auth_token:
            logger.warning("Twilio credentials not set")
            return {"success": False, "error": "Twilio not configured"}

        to_number = f"whatsapp:+{self._normalize_phone(phone)}"

        try:
            response = requests.post(
                f"https://api.twilio.com/2010-04-01/Accounts/{self.account_sid}/Messages.json",
                auth=(self.account_sid, self.auth_token),
                data={
                    "From": self.from_number,
                    "To":   to_number,
                    "Body": message,
                },
                timeout=30,
            )
            data = response.json()
            if response.status_code in (200, 201):
                logger.info("WhatsApp sent via Twilio to %s sid=%s", phone, data.get("sid"))
                return {"success": True, "sid": data.get("sid"), "provider": "twilio"}
            else:
                logger.error("Twilio error: %s", data)
                return {"success": False, "error": data.get("message", "Unknown error"), "provider": "twilio"}
        except Exception as e:
            logger.exception("Twilio request failed")
            return {"success": False, "error": str(e), "provider": "twilio"}

    def _send_via_meta(self, phone: str, message: str) -> dict:
        if not self.access_token or not self.phone_id:
            logger.warning("Meta WhatsApp credentials not set")
            return {"success": False, "error": "Meta WhatsApp not configured"}

        url = f"https://graph.facebook.com/v18.0/{self.phone_id}/messages"

        payload = {
            "messaging_product": "whatsapp",
            "to":   self._normalize_phone(phone),
            "type": "text",
            "text": {"body": message},
        }

        try:
            response = requests.post(
                url,
                json=payload,
                headers={
                    "Authorization": f"Bearer {self.access_token}",
                    "Content-Type":  "application/json",
                },
                timeout=30,
            )
            data = response.json()
            if response.status_code == 200:
                logger.info("WhatsApp sent via Meta to %s", phone)
                return {"success": True, "message_id": data.get("messages", [{}])[0].get("id"), "provider": "meta"}
            else:
                logger.error("Meta WhatsApp error: %s", data)
                return {"success": False, "error": str(data), "provider": "meta"}
        except Exception as e:
            logger.exception("Meta WhatsApp request failed")
            return {"success": False, "error": str(e), "provider": "meta"}


whatsapp = WhatsAppService()