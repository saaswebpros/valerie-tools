# Valerie AI Webhook Tools (NestJS)

Backend webhook service for the **Valerie AI Receptionist** (SaaS Web Pros).
Provides the three tools ElevenLabs calls during a conversation.

## Endpoints (all POST, JSON body, return 200)

| Path           | Body fields                                                              | Purpose                          |
|----------------|--------------------------------------------------------------------------|----------------------------------|
| `/create-lead` | name, email, phone, service_type, project_details, timeline, budget, appointment_details | Capture/persist a lead (JSONL) |
| `/send-email`  | name, email, phone, service_type                                         | Send confirmation email          |
| `/send-sms`    | phone, name, service_type                                                | Send confirmation SMS via Twilio |

Also: `GET /` and `GET /health` for status checks.

## Credentials
- **Twilio** (SMS): read from `~/.config/abacusai_auth_secrets.json` (`twilio` service) or env
  `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`.
- **Email**: uses SMTP env vars `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`,
  `FROM_EMAIL`. If SMTP is not configured it logs and returns success (matches reference behavior).

## Run
```bash
npm install
npm run build
PORT=3000 node dist/main.js
```

Leads are appended to `~/valerie_leads.jsonl`.
