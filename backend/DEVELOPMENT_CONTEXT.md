# LeadFlow AI Development Context

## 1. Project

LeadFlow AI is a product-first AI lead-response, qualification, follow-up, and conversion platform for real estate businesses. The repository currently uses a FastAPI backend, a React/Vite frontend, PostgreSQL through SQLAlchemy, OpenAI for lead qualification and follow-up email generation, n8n for scheduled follow-up orchestration, and Resend for email delivery.

## 2. Overall Product Goal

The product is intended to help real estate agencies, agents, developers, and property sales teams capture enquiries, prioritize leads, respond consistently, and maintain reliable follow-up. The documented lifecycle is lead capture, validation and deduplication, AI qualification, prioritization, follow-up, appointment or viewing, human handoff, and conversion.

GoHighLevel integration, multi-tenancy, billing, and VendorFlow AI appear in project direction documents as future work. Their exact product implementation is not currently confirmed by code.

## 3. Current Backend Functionality

- `POST /api/leads` validates input, normalizes email and phone data, rejects duplicate email addresses, creates a lead, runs AI qualification, persists a `LeadQualification`, and returns an `AI_QUALIFIED` lead.
- `GET /api/leads` and `GET /api/leads/{lead_id}` return stored lead and qualification data.
- `POST /api/leads/{lead_id}/followups` creates a `SCHEDULED` follow-up.
- `GET /api/leads/{lead_id}/followups` returns a lead's follow-ups.
- `GET /api/followups/due` returns only follow-ups with `status == 'SCHEDULED'` and `scheduled_at <=` database current time.
- `GET /api/followups/upcoming` returns scheduled follow-ups whose time is in the future.
- `POST /api/followups/{followup_id}/process` finds the follow-up, rejects non-`SCHEDULED` or future records, loads its lead and latest qualification, generates an AI email, calls Resend, then changes the follow-up to `SENT` and records `sent_at`.
- OpenAI and Resend credentials are read from `OPENAI_API_KEY` and `RESEND_API_KEY`; the database connection reads `DATABASE_URL`.

## 4. Current Testing Status

`backend/tests/test_leads_api.py` currently contains 13 passing tests.

1. `test_create_lead_success` - creates a lead and expects an `AI_QUALIFIED` response.
2. `test_duplicate_lead_rejected` - verifies a duplicate email returns HTTP 409.
3. `test_invalid_lead_rejected` - verifies invalid lead input returns HTTP 422.
4. `test_due_followup_is_returned` - verifies a past `SCHEDULED` follow-up is returned by the due endpoint.
5. `test_future_followup_is_not_returned` - verifies a future `SCHEDULED` follow-up is excluded from the due endpoint.
6. `test_sent_followup_is_not_returned` - verifies a past `SENT` follow-up is excluded from the due endpoint.
7. `test_process_followup_success` - verifies successful processing returns `SENT`, sets `sent_at`, and sends the generated email.
8. `test_sent_followup_cannot_be_processed` - verifies a `SENT` follow-up returns HTTP 400 before AI or email actions.
9. `test_future_followup_cannot_be_processed` - verifies a future `SCHEDULED` follow-up returns HTTP 400 before AI or email actions.
10. `test_nonexistent_followup_returns_404` - verifies an unknown follow-up ID returns HTTP 404.
11. `test_followup_without_qualification_cannot_be_processed` - verifies a follow-up without qualification returns HTTP 400 before AI or email actions.
12. `test_ai_email_generation_failure` - verifies an AI email-generation exception propagates and prevents email delivery.
13. `test_email_send_failure` - verifies an email-send exception leaves the follow-up `SCHEDULED` with no `sent_at` value.

Latest successful command:

```text
python -m pytest tests/test_leads_api.py -q
```

Result:

```text
13 passed in 77.55s
```

Follow-up processing tests mock `app.services.followup_processor.generate_followup_email` and `app.services.followup_processor.send_email`, so OpenAI and Resend are not called during those tests.

## 5. Current Follow-up Processing Rules

- Only `SCHEDULED` follow-ups can be processed.
- A follow-up whose `scheduled_at` is in the future cannot be processed.
- A successfully processed follow-up becomes `SENT`.
- `sent_at` is populated after successful email sending.

## 6. Current Development Direction

The next development focus is the Admin Dashboard. Do not begin with broad changes, a redesign, or implementation. First inspect the existing `AdminDashboard` frontend and the backend APIs/data it uses, understand what is already available, and identify one small concrete feature to implement using existing lead or follow-up data.

## 7. Development Approach

- Make changes incrementally.
- Understand existing code before modifying it.
- Avoid unnecessary refactoring.
- Reuse existing backend/API functionality where appropriate.
- Add focused tests for important backend behavior.
- Keep changes small and verifiable.
- Do not redesign existing functionality unless the requirement calls for it.

## 8. Important AI Coding Assistant Instruction

**"Do not assume that a feature needs to be built from scratch. First inspect the existing implementation and determine what already exists. For coding changes, prefer small, targeted modifications over broad autonomous exploration or refactoring."**

## 9. Next Session Starting Point

```text
NEXT SESSION:
1. Run the existing backend tests and confirm they still pass.
2. Inspect the current Admin Dashboard frontend.
3. Identify the backend APIs/data already available to the dashboard.
4. Compare the existing dashboard against the project's intended functionality.
5. Choose one small Admin Dashboard feature to implement.
6. Implement and test that feature incrementally.
```
