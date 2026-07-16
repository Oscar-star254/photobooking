import os
import base64
import requests
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()


class MpesaService:
    def __init__(self):
        self.consumer_key    = os.getenv("MPESA_CONSUMER_KEY")
        self.consumer_secret = os.getenv("MPESA_CONSUMER_SECRET")
        self.shortcode       = os.getenv("MPESA_SHORTCODE", "174379")
        self.passkey = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919"
        self.callback_url    = os.getenv("MPESA_CALLBACK_URL", "https://photobooking-1-dxlo.onrender.com/api/payments/mpesa/callback")
        self.env             = os.getenv("MPESA_ENV", "sandbox")

        self.base_url = (
            "https://sandbox.safaricom.co.ke"
            if self.env == "sandbox"
            else "https://api.safaricom.co.ke"
        )

    def _get_access_token(self):
        credentials = base64.b64encode(
            f"{self.consumer_key}:{self.consumer_secret}".encode()
        ).decode()

        response = requests.get(
            f"{self.base_url}/oauth/v1/generate?grant_type=client_credentials",
            headers={"Authorization": f"Basic {credentials}"},
            timeout=30,
        )
        response.raise_for_status()
        return response.json()["access_token"]

    def _get_timestamp(self):
        return datetime.now().strftime("%Y%m%d%H%M%S")

    def _get_password(self, timestamp):
        raw = f"{self.shortcode}{self.passkey}{timestamp}"
        return base64.b64encode(raw.encode()).decode()

    def _normalize_phone(self, phone):
        phone = phone.strip().replace("+", "").replace(" ", "").replace("-", "")
        if phone.startswith("0"):
            phone = "254" + phone[1:]
        if not phone.startswith("254"):
            phone = "254" + phone
        return phone

    def stk_push(self, phone, amount, account_ref, description):
        phone     = self._normalize_phone(phone)
        timestamp = self._get_timestamp()
        token     = self._get_access_token()

        payload = {
            "BusinessShortCode": self.shortcode,
            "Password":          self._get_password(timestamp),
            "Timestamp":         timestamp,
            "TransactionType":   "CustomerPayBillOnline",
            "Amount":            int(amount),
            "PartyA":            phone,
            "PartyB":            self.shortcode,
            "PhoneNumber":       phone,
            "CallBackURL":       self.callback_url,
            "AccountReference":  str(account_ref)[:12],
            "TransactionDesc":   str(description)[:13],
        }

        print("Payload being sent:")
        for k, v in payload.items():
            print(f"  {k}: {v}")

        response = requests.post(
            f"{self.base_url}/mpesa/stkpush/v1/processrequest",
            json=payload,
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type":  "application/json",
            },
            timeout=30,
        )

        print(f"\nResponse Status: {response.status_code}")
        print(f"Response Body: {response.text}")

        response.raise_for_status()
        return response.json()

    def query_stk_status(self, checkout_request_id):
        timestamp = self._get_timestamp()
        token     = self._get_access_token()

        payload = {
            "BusinessShortCode": self.shortcode,
            "Password":          self._get_password(timestamp),
            "Timestamp":         timestamp,
            "CheckoutRequestID": checkout_request_id,
        }

        response = requests.post(
            f"{self.base_url}/mpesa/stkpushquery/v1/query",
            json=payload,
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type":  "application/json",
            },
            timeout=30,
        )
        response.raise_for_status()
        return response.json()


if __name__ == "__main__":
    try:
        mpesa = MpesaService()
        print("✓ MpesaService initialized successfully")
        print(f"  - Environment: {mpesa.env}")
        print(f"  - Base URL: {mpesa.base_url}")
        print(f"  - Shortcode: {mpesa.shortcode}")
        print(f"  - Callback URL: {mpesa.callback_url}")

        required_creds = ["consumer_key", "consumer_secret", "passkey", "callback_url"]
        missing = [cred for cred in required_creds if getattr(mpesa, cred) is None]

        if missing:
            print(f"⚠ Missing credentials: {', '.join(missing)}")
        else:
            print("✓ All required credentials are set")

            print("\nTesting STK Push...")
            try:
                result = mpesa.stk_push(
                    phone="254708374149",
                    amount=1,
                    account_ref="TEST001",
                    description="TestPay"
                )
                print("\n✅ STK Push SUCCESS:", result)
            except requests.exceptions.HTTPError as e:
                print(f"\n❌ HTTP ERROR: {e}")
                print(f"Response: {e.response.text}")
            except Exception as e:
                print(f"\n❌ ERROR: {str(e)}")

    except Exception as e:
        print(f"✗ Error: {e}")
else:
    mpesa = MpesaService()