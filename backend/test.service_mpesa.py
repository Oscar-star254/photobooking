import sys
sys.path.insert(0, '.')

from mpesa_service import mpesa
import requests

print("Sending STK Push...")
try:
    result = mpesa.stk_push(
        phone='254708374149',
        amount=1,
        account_ref='TEST001',
        description='TestPay'
    )
    print("SUCCESS:", result)
except requests.exceptions.HTTPError as e:
    print(f"HTTP ERROR: {e}")
    print(f"Response body: {e.response.text}")
except Exception as e:
    print(f"ERROR: {str(e)}")