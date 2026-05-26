import os
from twilio.rest import Client

class TwilioWhatsAppClient:
    def __init__(self):
        account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        self.whatsapp_from = os.getenv("TWILIO_WHATSAPP_NUMBER", "whatsapp:+14155238886")
        
        if account_sid and auth_token:
            self.client = Client(account_sid, auth_token)
        else:
            self.client = None
            print("⚠️ Twilio client not initialized: Missing credentials")

    def send_message(self, to_number: str, body: str):
        if self.client:
            return self.client.messages.create(
                body=body,
                from_=self.whatsapp_from,
                to=to_number
            )
        return None

twilio_client_wrapper = TwilioWhatsAppClient()