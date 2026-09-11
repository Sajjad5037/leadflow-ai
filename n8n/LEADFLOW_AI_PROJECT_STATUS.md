# LeadFlow AI — Product Status & Direction

## 1. Product Vision

LeadFlow AI is a product-first project intended to become an AI-powered lead-response, qualification, follow-up, and conversion platform for real estate businesses. Its goal is eventual real business value for agencies, agents, developers, and property sales teams, not simply a technical demonstration.

```text
New enquiry
    -> Lead capture
    -> Validation and deduplication
    -> AI qualification
    -> Lead prioritization
    -> Automated response
    -> Scheduled follow-up
    -> Appointment or viewing
    -> Human agent handoff
    -> Conversion
```

The project remains a practical way to learn automation and SaaS engineering, but learning supports the product rather than defining it.

## 2. Product Philosophy

1. Product-first, portfolio-second.
2. Build features that solve real real-estate operational problems.
3. Learn automation technologies by applying them to real product requirements.
4. Do not add technology merely because it is interesting.
5. Prefer simple, reliable workflows over unnecessarily complex AI agents.
6. Keep business rules understandable and testable.
7. Use automation to orchestrate the system, not duplicate core backend logic.
8. Treat security, reliability, tenant isolation, and observability as future first-class product requirements.

A feature should ideally provide real product value and teach a useful technical capability.

## 3. Target Customers

The initial target market is independent real estate agents, small agencies, growing real estate teams, property developers, and property marketing or sales teams. The initial product focus is businesses that receive enquiries and need reliable lead response and follow-up.

## 4. Core Product Problem

Real estate businesses can lose potential customers when enquiries are not answered quickly, leads are not prioritized, follow-ups are inconsistent, and agents cannot identify who needs immediate attention. LeadFlow AI should automate repetitive lifecycle work while keeping people in control of important customer interactions and decisions.

## 5. Current Product Scope — Stage 1

The active roadmap is [docs/leadflow-ai-future-project-direction.md](../docs/leadflow-ai-future-project-direction.md). The original master specification is tracked in Git but is currently deleted from the working tree.

Implemented Stage 1 foundations are lead capture, validation, email normalization, duplicate detection, structured OpenAI qualification, qualification score and temperature, qualification persistence, follow-up creation, due and upcoming follow-up endpoints, n8n scheduling/API orchestration, AI follow-up email generation, Resend integration, and the `SENT` follow-up state.

The AI/email flow and `SENT` state require hardening and end-to-end verification. Follow-up stopping, appointment handling, human handoff, reliable failure handling, and observability are not implemented.

## 6. Current Architecture

```text
React public form
    -> FastAPI API and business services
    -> PostgreSQL persistent state
    -> OpenAI qualification and email intelligence

n8n scheduler and orchestrator
    -> FastAPI follow-up APIs
    -> Resend email adapter
```

- **React** provides the public lead intake form; an internal dashboard exists in code but is not rendered by `App`.
- **FastAPI** owns validation, duplicate handling, eligibility decisions, follow-up processing, and state transitions.
- **PostgreSQL** is the intended persistent datastore for leads, qualifications, and follow-ups.
- **OpenAI** generates validated qualification and email content.
- **n8n** schedules and orchestrates API calls.
- **Resend** is the current email-delivery adapter.

Do not move core business rules into n8n merely because n8n can technically perform them.

## 7. Current n8n Automation

`n8n/follow-up-email-automation.json` defines this active workflow:

```text
Schedule Trigger (every 1 minute)
    -> GET /api/followups/due
    -> POST /api/followups/{{$json.id}}/process
```

The follow-up ID is dynamic by design; the workflow processes each ID returned by the due endpoint instead of a hard-coded value. No IF node is present because FastAPI already determines which follow-ups are due. Adding an IF node for the same decision would duplicate business logic.

The companion Markdown workflow document still says every five minutes and describes an IF node. It must be aligned with the approved workflow design. Live n8n execution history is not in the repository, so activation and delivery results are UNKNOWN.

## 8. Current Implementation Status

### Completed

- Lead API creation, Pydantic validation, normalized email, and duplicate rejection.
- SQLAlchemy models for leads, qualifications, and follow-ups.
- Structured OpenAI qualification with score/temperature validation and persistence.
- Follow-up creation, list, upcoming, and due endpoints.
- Due query based on database time and `SCHEDULED` status.
- Dynamic n8n follow-up processing URL using `{{$json.id}}`.

### Working But Needs Hardening

- AI-generated follow-up email, Resend delivery call, and `SENT`/`sent_at` update are implemented but not end-to-end verified.
- The follow-up processor validates status, lead, and qualification but does not reject a future `scheduled_at` value when called directly.
- Public frontend lead intake is integrated. The coded admin dashboard is not reachable from the active application.
- Configuration reads `DATABASE_URL`, `OPENAI_API_KEY`, and `RESEND_API_KEY`; there is no committed environment example.

### In Progress

- No code implementation is currently in progress. The active priority is planning reliable, testable Stage 1 follow-up processing.

### Blocked

- Backend test collection is blocked because the selected Python environment lacks `resend`; Pylance also cannot resolve `sqlalchemy`, `openai`, `resend`, or `psycopg` despite their declarations in `backend/requirements.txt`.

### Not Started

- Follow-up stop conditions, appointments, human handoff, idempotency, retry/failure states, durable logs, authentication, authorization, migrations, monitoring, multi-tenancy, GHL, Make, Zapier, and VendorFlow AI.

## 9. Testing & Reliability

- **Frontend build: working.** `npm.cmd run build` completed on 2026-08-30.
- **Backend automated tests: blocked.** `python -m pytest -q` fails during collection because `resend` is unavailable in the selected environment.
- **Existing tests: incomplete.** They cover lead creation, duplicate rejection, and invalid input only. They do not mock AI/email calls or test follow-ups, and they expect `NEW` even though code sets `AI_QUALIFIED` after qualification.
- **n8n execution: not tested in repository evidence.**

Before claiming product reliability, add and run tests for due, future, sent, and multiple due follow-ups; AI failures; email failures; duplicate processing/idempotency; n8n execution; API/database integration; and production monitoring behavior.

## 10. Product Reliability Requirements

Commercial use will require idempotent follow-up processing, safe state transitions, retry handling, failure states, durable automation logs, execution history, observability, authentication, authorization, API security, input validation, database migrations, backup/recovery planning, error handling, rate-limit awareness, and secure credential management.

These are requirements for the product direction, not permission to implement them before the focused Stage 1 plan is approved.

## 11. Multi-Tenant SaaS Direction

The eventual product is expected to support multiple independent real estate businesses:

```text
Real Estate Agency A -> Users, Leads, Follow-ups, Automations, Settings
Real Estate Agency B -> Users, Leads, Follow-ups, Automations, Settings
```

Tenant isolation must eventually prevent one organization from accessing another organization's data. Design future APIs, data ownership, configuration, and authorization with this in mind, but do not implement multi-tenancy yet.

## 12. Admin/Product UI Direction

The internal dashboard should evolve into a practical product interface with:

- **Overview:** operational summary and priority signals.
- **Leads:** lead details, qualification, state, and ownership.
- **Follow-ups:** scheduled, sent, failed, and pending actions.
- **Automation:** workflow status and execution visibility.
- **Analytics:** lead-response and conversion signals.
- **Settings:** organization-level configuration when multi-tenancy is introduced.

Prioritize useful operational screens before cosmetic dashboard expansion.

## 13. Real Estate Product Workflow

```text
Lead arrives
    -> Validate
    -> Deduplicate
    -> Qualify with AI
    -> Prioritize
    -> Respond
    -> Schedule follow-up
    -> Follow up automatically
    -> Detect meaningful response
    -> Stop automation when appropriate
    -> Book appointment/viewing
    -> Hand off to human
    -> Track outcome
```

Future stop conditions are lead response, opt-out, appointment booking, lost status, and human-agent takeover. These conditions are not yet implemented.

## 14. Automation Platform Learning Roadmap

### n8n — Current

Learn scheduling, HTTP Request, expressions, dynamic data, execution history, retries, error workflows, webhooks, branching, and orchestration through real product needs. Current evidence covers Schedule Trigger, GET/POST requests, `$json`, and dynamic URLs.

### Make — Next

After the n8n follow-up workflow is stable, recreate selected workflows in Make to compare scenario design, modules, error handling, data mapping, scheduling, and integrations.

### Zapier — After Make

Recreate selected appropriate workflows to learn triggers, actions, paths, filters, and business-user-friendly automation.

### GoHighLevel — Later

Use GHL as a real CRM integration for contacts, custom fields, tags, opportunities, pipelines, appointments, webhooks, human handoff, and CRM synchronization. The learning roadmap never overrides product priorities.

## 15. Product Roadmap

### Phase 1 — Core LeadFlow Product

Complete reliable lead capture, AI qualification, follow-up scheduling and processing, email delivery, testing, error handling, and idempotency.

### Phase 2 — Product UI

Build the practical admin dashboard, lead management, follow-up management, automation visibility, and basic analytics.

### Phase 3 — Production Foundations

Build authentication, authorization, multi-tenant architecture and isolation, migrations, logging, monitoring, secure configuration, and reliable background processing.

### Phase 4 — GoHighLevel Integration

Add CRM synchronization and appointment/handoff capabilities.

### Phase 5 — Automation Platform Expansion

Recreate selected workflows in Make and Zapier to understand platform tradeoffs.

### Phase 6 — Productization

Add onboarding, organization settings, usage controls, billing/subscription architecture, customer documentation, support considerations, and deployment discipline. Pricing plans are not yet defined.

### Phase 7 — Commercial Validation

Eventually test with real or pilot real-estate users, focusing on actual workflows, feedback, reliability, usability, measurable business value, and feature prioritization.

## 16. Future VendorFlow AI

VendorFlow AI remains the future Stage 3 project: vendor intake, research, qualification, outreach, response processing, relationship tracking, and human escalation. It should inherit LeadFlow's product, automation, reliability, and tenant-isolation principles. It must not distract from completing LeadFlow AI.

## 17. Portfolio Direction

The portfolio case study is a consequence of building a real product, not the project's primary purpose. It should eventually document the problem, product, architecture, automation workflows, AI components, integrations, tests, reliability improvements, screenshots, deployment, lessons learned, and business value.

## 18. Important Architectural Decisions

- FastAPI owns core business logic and eligibility decisions.
- n8n orchestrates automation and must not duplicate backend business rules.
- PostgreSQL is the intended persistent datastore.
- AI outputs must be validated before use or persistence.
- External providers remain replaceable integration adapters: Resend now, GHL later.
- Build one reliable layer before adding another.
- Product reliability matters more than adding features quickly.
- Design toward multi-tenancy without prematurely implementing it.

## 19. Out of Scope For Now

- Full multi-tenancy and billing.
- Enterprise RBAC.
- Advanced autonomous agents.
- WhatsApp, voice/call automation, and complex scraping.
- VendorFlow AI.
- Make and Zapier workflows.
- Full GoHighLevel integration.
- Mobile applications and large infrastructure refactors.

## 20. Immediate Next Steps

1. Fix the backend development/test environment.
2. Get the current automated tests running.
3. Correct stale tests and mock OpenAI and Resend.
4. Add follow-up tests for due, future, sent, and multiple due records.
5. Test AI and email failure scenarios.
6. Implement safe follow-up state transitions and idempotency in FastAPI.
7. Align n8n workflow documentation with the actual JSON; do not add a redundant IF node.
8. Perform controlled n8n end-to-end testing and inspect execution history.
9. Add durable automation logging and failure visibility.
10. Implement appropriate follow-up stopping rules.
11. Only then move into broader product UI improvements.

Do not jump to GHL, Make, Zapier, billing, or multi-tenancy because they appear in the roadmap.

## 21. Definition of a Product-Ready Stage 1

Stage 1 is complete only when leads are captured reliably; duplicates are handled; AI qualification is reliable and validated; follow-ups are scheduled and reliably identified; n8n orchestrates processing; AI emails are generated safely and delivered through the configured provider; duplicate sends are prevented; failures are represented and recoverable; important success and failure paths are tested; automation execution is observable; and another developer can understand the system from its documentation.

## 22. Change Log

| Date | Change |
|---|---|
| 2026-08-30 | Created the living project status snapshot from the repository, roadmap, and implementation audit. |
| 2026-08-30 | Verified the n8n JSON uses dynamic `{{$json.id}}`; recorded the one-minute JSON versus five-minute documentation mismatch. |
| 2026-08-30 | Verified frontend production build succeeds; backend test collection is blocked by missing `resend` in the selected Python environment. |
| 2026-08-30 | LeadFlow AI direction changed from portfolio-first/learning project to product-first commercial SaaS direction. The project will still be used to learn AI automation technologies, but all major implementation decisions should now consider eventual real-world use by real estate businesses. |

## Document Maintenance Rule

This is a living project document. On a status update, read this document first; inspect the actual repository and relevant documentation; compare claims to implementation; correct stale claims; update completed, in-progress, blocked, and not-started status; and refresh immediate next steps. Preserve the long-term product direction, rewrite affected sections rather than appending routine history, and do not make code changes unless explicitly requested. Do not claim production readiness unless repository evidence and tests support it.
