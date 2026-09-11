# Follow-up Email Automation

## Purpose

Automatically process scheduled follow-ups when they become due.

## Workflow

Schedule Trigger
    ↓
GET /api/followups/due
    ↓
IF
    ↓ TRUE
POST /api/followups/{followup_id}/process

## Schedule

The workflow runs every 5 minutes.

## Step 1 — Schedule Trigger

Triggers the workflow every 5 minutes.

## Step 2 — Get Due Follow-ups

HTTP Method:
GET

Endpoint:
`/api/followups/due`

This endpoint returns follow-ups where:

- status = `SCHEDULED`
- scheduled_at <= current database time

## Step 3 — IF Condition

Checks:

`status == SCHEDULED`

and

`scheduled_at <= current time`

Only due scheduled follow-ups continue through the TRUE branch.

## Step 4 — Process Follow-up

HTTP Method:
POST

Dynamic endpoint:

`https://leadflow-ai-production-e5f0.up.railway.app/api/followups/{{$json.id}}/process`

The follow-up ID comes dynamically from the previous HTTP response.

For example:

`id = 1`

becomes:

`/api/followups/1/process`

## Backend Processing

FastAPI:

1. Finds the follow-up.
2. Finds the associated lead.
3. Gets the lead's AI qualification.
4. Generates the follow-up email.
5. Sends the email through Resend.
6. Changes the follow-up status to `SENT`.
7. Records `sent_at`.

## Architecture

n8n is responsible for triggering the follow-up process when the follow-up becomes due.

FastAPI remains responsible for the actual follow-up processing and email sending.
