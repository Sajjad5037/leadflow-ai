# Al Qaim Estate — AI Sales Automation Platform

Al Qaim Estate is an AI-powered sales automation platform designed for real-estate businesses. It combines lead management, AI-assisted qualification, property management, CRM integration, and workflow automation to help sales teams understand prospects, organize opportunities, and coordinate follow-ups.

Built with **React, FastAPI, PostgreSQL, OpenAI, LangGraph, and n8n**, the platform connects an AI sales assistant with business APIs and external systems. The AI agent can retrieve lead and property information, search CRM records, prepare follow-up messages, and trigger controlled business workflows through tool calling and API integrations.

The project demonstrates how AI agents can be integrated into practical business processes rather than operating as standalone chatbots.

## Table of Contents

- [Project Overview](#project-overview)
- [Core Features](#core-features)
- [End-to-End Sales Workflow](#end-to-end-sales-workflow)
- [Lead Management](#lead-management)
- [AI-Powered Lead Qualification](#ai-powered-lead-qualification)
- [LangGraph AI Sales Assistant](#langgraph-ai-sales-assistant)
- [Follow-Up Workflow Automation](#follow-up-workflow-automation)
- [CRM Integration](#crm-integration)
- [Property Management](#property-management)
- [Human-in-the-Loop Approval](#human-in-the-loop-approval)
- [System Architecture](#system-architecture)
- [Data Model](#data-model)
- [API Architecture](#api-architecture)
- [Technology Stack](#technology-stack)
- [Repository Structure](#repository-structure)
- [Deployment](#deployment)
- [Engineering Highlights](#engineering-highlights)
- [Testing and Verification](#testing-and-verification)
- [My Contributions](#my-contributions)
- [Project Status](#project-status)

---

## Project Overview

### The Problem

Real-estate sales teams often manage incoming inquiries, investor requirements, property information, CRM records, and follow-up activities across disconnected systems.

This creates several operational challenges:

- Lead information can be fragmented across multiple channels.
- Salespeople need to assess each prospect's requirements and readiness.
- Important follow-ups can be delayed or overlooked.
- Property information must be connected to prospective buyers' requirements.
- Sales teams may need to switch between lead-management tools and external CRM systems.
- Repetitive administrative work reduces the time available for meaningful customer interactions.

### The Solution

Al Qaim Estate brings these activities into an AI-assisted sales platform.

The system combines centralized lead management with AI qualification, property information, CRM connectivity, and automated follow-up workflows.

The AI sales assistant uses LangGraph to coordinate language-model reasoning and business tools. When a user requests a follow-up, the agent can invoke an n8n webhook, which connects to the FastAPI backend to create a scheduled follow-up record.

The architecture separates AI reasoning, workflow orchestration, and business logic so that actions are executed through defined application interfaces.

### Product Vision

The platform is designed to support the following business process:

1. Capture and organize prospective buyers and investors.
2. Understand their requirements and qualify their interest.
3. Assign leads to appropriate salespeople.
4. Identify potentially relevant properties.
5. Support sales conversations and follow-up planning.
6. Synchronize lead information with external CRM systems.
7. Automate repetitive sales workflows.
8. Provide visibility into leads, assignments, properties, and follow-up activity.

The longer-term objective is to develop an AI-assisted real-estate sales operating system that supports sales teams while keeping consequential decisions under human control.

## Core Features

- **Centralized lead management:** Create, retrieve, and manage prospective customer records.
- **AI lead qualification:** Analyze lead information and classify prospects using HOT, WARM, and COLD qualification categories.
- **Lead assignment:** Organize leads for sales staff.
- **Role-specific dashboards:** Provide separate administrative and salesperson workspaces.
- **Property management:** Maintain property information for sales activities.
- **Follow-up scheduling:** Create and track scheduled lead follow-ups.
- **LangGraph agent orchestration:** Coordinate an AI assistant with defined business tools.
- **Tool-based business operations:** Retrieve lead details, search CRM records, inspect properties, and initiate approved workflows.
- **n8n workflow automation:** Connect webhook-triggered workflows to backend APIs.
- **External CRM integration:** Search for existing contacts, create CRM contacts, and associate leads with CRM records.
- **Human-in-the-loop approval:** Review proposed follow-up messages before sending them through the approval workflow.
- **Email integration:** Use an email delivery service for follow-up communication.
- **Cloud deployment:** Host application services and the automation workflow online.

---

## End-to-End Sales Workflow

The platform connects lead management, AI assistance, CRM synchronization, and follow-up automation.

```text
Prospective Buyer or Investor
              |
              v
       Lead Capture
              |
              v
     Centralized Lead Record
              |
              v
      AI Lead Qualification
              |
              v
    Lead Assignment to Sales
              |
              v
    AI Sales Assistant
              |
       +------+------+
       |             |
       v             v
  Property and    CRM Contact
  Lead Research   Lookup/Sync
       |             |
       +------+------+
              |
              v
      Follow-Up Planning
              |
              v
       LangGraph Agent
              |
              v
        n8n Webhook
              |
              v
       FastAPI Backend
              |
              v
     Scheduled Follow-Up
              |
              v
      Database Tracking
              |
              v
      Follow-Up Processing
```

This diagram represents the platform's implemented capabilities and intended business flow. Not every stage is necessarily executed automatically for every lead.

---

## Lead Management

Lead management provides the foundation for the sales workflow.

The FastAPI backend exposes endpoints for creating leads, retrieving lead information, and accessing follow-up records.

### Lead Operations

- Create a lead record.
- Retrieve the lead list.
- Retrieve an individual lead by ID.
- Access lead details through the AI assistant.
- Assign leads to sales staff.
- Associate a lead with an external CRM contact.
- Retrieve follow-up information associated with a lead.

### Lead Lifecycle

```text
Lead Created
     |
     v
Lead Information Stored
     |
     v
AI Qualification
     |
     v
Sales Assignment
     |
     v
Sales Activity and Follow-Up
     |
     v
Opportunity Management
```

The platform is designed to make lead information accessible to both sales users and the AI assistant through application-controlled APIs.

---

## AI-Powered Lead Qualification

The platform uses OpenAI to support lead qualification.

Lead information is analyzed to identify the prospect's requirements, investment intent, and potential readiness for further sales engagement.

### Qualification Categories

| Category | Purpose |
|---|---|
| HOT | Indicates a potentially high-priority sales opportunity. |
| WARM | Indicates a prospect who may need additional information or engagement. |
| COLD | Indicates a prospect with lower immediate sales readiness. |

These categories support prioritization and sales decision-making. They are not guarantees that a prospect will or will not convert.

### Qualification Workflow

```text
Lead Information
       |
       v
AI Analysis
       |
       v
Structured Qualification Result
       |
       v
HOT / WARM / COLD
       |
       v
Sales Team Review and Action
```

Structured AI output allows the application to use qualification results within the lead-management workflow.

---

## LangGraph AI Sales Assistant

The AI sales assistant uses LangGraph to coordinate language-model reasoning, tool execution, and business operations.

Rather than relying only on conversational responses, the agent can invoke defined tools to retrieve information or initiate actions through application APIs.

### Available Tool Capabilities

The assistant includes tools for operations such as:

- Retrieving lead details.
- Retrieving CRM contact information.
- Searching for CRM contacts by email.
- Comparing local lead information with CRM information.
- Retrieving property details.
- Searching available properties.
- Drafting follow-up messages.
- Triggering n8n workflows to schedule follow-ups.

The actual tools available to the agent depend on the implemented tool definitions.

### Agent Architecture

```text
User Request
     |
     v
LangGraph StateGraph
     |
     v
LLM Reasoning
     |
     v
Tool Selection
     |
     v
Tool Execution
     |
     +----------------------+
     |                      |
     v                      v
Business API             CRM API
     |                      |
     v                      v
Lead and Property        Contact Data
Information
     |
     v
Agent Response
```

### Why LangGraph?

LangGraph provides a structured way to coordinate an agent's reasoning and tool calls.

In this project, it connects the language model to business-specific tools while allowing the backend to retain responsibility for database operations, validation, and external service calls.

This approach makes the assistant more useful than a basic chatbot because it can interact with actual application data and initiate defined business workflows.

---

## Follow-Up Workflow Automation

Follow-up scheduling connects the LangGraph AI assistant, online n8n, FastAPI, and PostgreSQL.

The AI agent can interpret a natural-language request such as:

> Schedule an email follow-up for lead ID 8 for tomorrow at 1 PM Pakistan time.

The agent converts the request into structured parameters and sends them to the n8n production webhook.

### Scheduling Workflow

```text
User Requests Follow-Up
          |
          v
LangGraph Agent
          |
          v
Extract Lead ID and Time
          |
          v
Convert Local Time to UTC
          |
          v
POST Request to n8n Webhook
          |
          v
n8n HTTP Request Node
          |
          v
FastAPI Follow-Up Endpoint
          |
          v
Create Follow-Up Record
          |
          v
PostgreSQL
          |
          v
Return Scheduling Confirmation
```

### Online n8n Integration

The production webhook is hosted on Railway:

```text
POST /webhook/al-qaim-agent
```

The complete webhook URL is configured in the backend environment/code.

The n8n workflow receives the request and calls the deployed FastAPI backend to create a follow-up record.

The backend endpoint used by this workflow is:

```text
POST /api/leads/{lead_id}/followups
```

The workflow sends structured data including:

- Lead ID
- Communication channel
- Scheduled timestamp
- Attempt number

### Timezone-Aware Scheduling

The AI assistant's scheduling instructions interpret unspecified scheduling times in Pakistan Standard Time (UTC+05:00), unless the user specifies another timezone.

The scheduled timestamp is converted to UTC before the scheduling tool is called.

For example:

| Field | Example |
|---|---|
| User-requested time | 1:00 PM Pakistan time |
| UTC equivalent | 08:00 UTC |
| Follow-up channel | EMAIL |
| Initial status | SCHEDULED |

### Verification

The online workflow was tested using lead ID `8`. The AI assistant confirmed that the follow-up was scheduled for October 10, 2026, at 1:00 PM Pakistan time, corresponding to `2026-10-10T08:00:00Z`.

The assistant returned workflow run ID `9` and status `SCHEDULED`.

This verifies the scheduling path and record-creation response. Actual email delivery at the scheduled time must be verified separately.

---

## CRM Integration

Al Qaim Estate integrates with a separate CRM service to connect lead-management records with external contact and opportunity data.

The CRM service uses FastAPI and PostgreSQL and maintains CRM-specific tables such as `crm_contacts` and `crm_opportunities`.

### CRM Capabilities

- Retrieve CRM contacts.
- Search contacts by email.
- Retrieve individual contacts.
- Create CRM contacts.
- Work with CRM opportunity records through the CRM API.
- Synchronize eligible leads with CRM contacts.
- Associate local leads with external CRM contact IDs.
- Identify leads that have not yet been synchronized.
- Compare local lead information with CRM information.

### CRM Synchronization Workflow

```text
Al Qaim Lead
     |
     v
Check CRM Association
     |
     v
Search CRM by Email
     |
     +---------------------+
     |                     |
     v                     v
Contact Found          No Contact Found
     |                     |
     v                     v
Link Existing           Create CRM Contact
Contact                     |
     |                     |
     +----------+----------+
                |
                v
       Save CRM Contact ID
                |
                v
       Lead and CRM Linked
```

The integration supports reconciliation between lead records and CRM contacts, reducing the need to manually create duplicate contact records.

### CRM API Examples

The CRM service includes endpoints such as:

```text
GET  /api/contacts
GET  /api/contacts/by-email/{email}
GET  /api/contacts/{contact_id}
POST /api/contacts
```

The main Al Qaim backend also provides lead synchronization operations:

```text
POST  /api/leads/{lead_id}/sync-crm
PATCH /api/leads/{lead_id}/crm-contact
GET   /api/leads/unsynced
```

These endpoints connect the primary lead-management application to the external CRM service.

---

## Property Management

Property management provides a source of property information for sales users and the AI assistant.

The platform includes property-management functionality and AI tools for retrieving property details and searching available properties.

### Intended Sales Workflow

```text
Lead Requirements
        |
        v
Understand Budget and Preferences
        |
        v
Search Available Properties
        |
        v
Review Potential Matches
        |
        v
Salesperson Reviews Options
        |
        v
Continue Sales Conversation
```

Property information can help the sales team connect a prospect's requirements with available real-estate opportunities.

AI-generated suggestions should be treated as decision support. Property availability, pricing, and suitability should be confirmed against current business records before being presented as definitive.

---

## Human-in-the-Loop Approval

The platform includes an approval workflow for consequential actions, particularly sending AI-drafted follow-up emails.

The AI assistant can prepare a proposed follow-up message and present it for review before the email is sent.

### Approval Workflow

```text
User Requests Follow-Up Draft
             |
             v
AI Drafts Message
             |
             v
Present Draft for Review
             |
       +-----+-----+
       |           |
       v           v
    Approve       Reject
       |           |
       v           v
 Send Email     Do Not Send
       |
       v
 Return Result
```

The approval API supports the approval interaction, and the application uses Resend for email delivery.

This design keeps the user involved before the system performs the email-sending action. Scheduling a follow-up and approving a drafted email are distinct workflows.

---

## System Architecture

Al Qaim Estate separates the frontend, backend business logic, AI orchestration, workflow automation, and CRM integration.

### Architecture Overview

```text
                   SALES USERS
                       |
                       v
              React / Vite Frontend
                       |
                       v
               FastAPI Backend
                       |
        +--------------+--------------+
        |              |              |
        v              v              v
   PostgreSQL       OpenAI         Resend
   Application     Language       Email Service
      Data          Model
                       |
                       v
                 LangGraph Agent
                       |
                Defined Tool Calls
                       |
             +---------+---------+
             |                   |
             v                   v
         Business APIs       n8n Workflow
                                 |
                                 v
                         FastAPI Follow-Up API

             External CRM Service
                       |
                       v
              CRM PostgreSQL Data
```

### Frontend

The React frontend provides the user-facing application, including administrative and salesperson interfaces.

Responsibilities include:

- Displaying leads and lead details.
- Supporting sales and administrative operations.
- Presenting property information.
- Providing access to the AI assistant.
- Displaying proposed actions and approval controls.

### Backend

FastAPI owns the application and business logic.

Responsibilities include:

- Exposing REST APIs.
- Validating requests.
- Managing lead and follow-up operations.
- Interacting with PostgreSQL through SQLAlchemy.
- Calling AI services.
- Integrating with the CRM service.
- Executing the approval workflow.
- Coordinating email and automation integrations.

### AI Layer

OpenAI and LangGraph support language understanding, reasoning, and tool orchestration.

The agent does not require unrestricted database access. It invokes defined tools, which communicate with application services.

### Workflow Automation

n8n coordinates external workflow steps through webhooks and HTTP requests.

The architectural principle is:

**LangGraph coordinates AI tool usage; n8n orchestrates workflows; FastAPI owns business logic and data operations.**

---

## Data Model

PostgreSQL provides persistent storage for application records.

### Main Application Data

The platform manages entities and records associated with:

- Leads
- Properties
- Follow-ups
- CRM contact associations
- Sales assignments
- User and role information

The precise schema is defined by the implemented SQLAlchemy models.

### CRM Data

The separate CRM service maintains CRM-specific records, including:

- `crm_contacts`
- `crm_opportunities`

### Follow-Up Record

A follow-up record contains fields such as:

| Field | Purpose |
|---|---|
| `id` | Identifies the follow-up record. |
| `lead_id` | Associates the follow-up with a lead. |
| `channel` | Specifies the communication channel, such as email. |
| `scheduled_at` | Stores the scheduled timestamp. |
| `status` | Tracks the follow-up state. |
| `attempt_number` | Identifies the attempt number. |
| `sent_at` | Records the sending timestamp when available. |

The scheduling test confirmed creation of a record with `EMAIL` as the channel and `SCHEDULED` as the status.

---

## API Architecture

The FastAPI backend exposes REST endpoints for lead management, follow-ups, CRM synchronization, and AI assistant interactions.

### Lead Management

```text
POST /api/leads
GET  /api/leads
GET  /api/leads/{lead_id}
```

### Follow-Up Management

```text
POST /api/leads/{lead_id}/followups
GET  /api/leads/{lead_id}/followups
GET  /api/followups/due
GET  /api/followups/upcoming
```

### CRM Integration

```text
POST  /api/leads/{lead_id}/sync-crm
PATCH /api/leads/{lead_id}/crm-contact
GET   /api/leads/unsynced
```

### AI Assistant

```text
POST /api/ai-assistant/chat
POST /api/ai-assistant/approve
```

These endpoints provide the application interfaces used by the frontend, AI assistant, and automation workflows.

The exact request schemas, authentication requirements, and response formats should be confirmed against the current API implementation.

---

## Technology Stack

### Frontend

- React
- Vite
- JavaScript
- CSS

### Backend

- Python
- FastAPI
- SQLAlchemy
- REST APIs
- HTTPX

### Database

- PostgreSQL

### AI and Agent Orchestration

- OpenAI API
- LangGraph
- LangChain Core
- LangChain OpenAI
- Tool calling
- Structured AI responses

### Workflow Automation

- n8n
- Webhooks
- HTTP Request nodes
- JSON-based data exchange

### Email and External Integrations

- Resend
- External CRM API
- HTTPX

### Deployment

- **Frontend:** Vercel
- **Backend:** Railway
- **CRM service:** Railway
- **n8n:** Self-hosted on Railway
- **Database:** PostgreSQL

---

## Repository Structure

The main Al Qaim Estate application is maintained in the LeadFlow AI repository.

```text
leadflow-ai/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── ai_assistant.py
│   │   ├── services/
│   │   │   └── crm_service.py
│   │   ├── ai_sales_assistant.py
│   │   └── main.py
│   └── requirements.txt
├── frontend/
│   └── src/
└── README.md
```

This is a high-level view of the main application modules. The exact directory structure may contain additional routers, models, schemas, components, and configuration files.

### Repositories

- **Main application:** [leadflow-ai](https://github.com/Sajjad5037/leadflow-ai)
- **External CRM:** [al-qaim-crm](https://github.com/Sajjad5037/al-qaim-crm)

---

## Deployment

The application is deployed as connected services.

### Main Backend

Production API:

https://leadflow-ai-production-e5f0.up.railway.app

### External CRM

Production service:

https://al-qaim-crm-production.up.railway.app

### Online n8n

The n8n workflow editor is hosted on Railway. The production webhook uses the `al-qaim-agent` path.

### Deployment Architecture

```text
User Browser
     |
     v
React Frontend
     |
     v
Al Qaim FastAPI Backend
     |
     +----------------------+
     |          |           |
     v          v           v
 PostgreSQL   LangGraph    CRM API
                 |
                 v
           Online n8n
                 |
                 v
        Follow-Up API
                 |
                 v
            PostgreSQL
```

The backend's n8n webhook URL must point to the online n8n instance, and the n8n HTTP Request node must call the deployed FastAPI API rather than a local Docker hostname.

---

## Engineering Highlights

### LangGraph Tool Orchestration

Integrated an AI assistant with business-specific tools for retrieving lead information, searching properties and CRM records, and triggering workflows.

### Natural-Language Scheduling

Implemented a scheduling interaction that converts a natural-language request into structured follow-up parameters.

### Timezone Conversion

Configured scheduling instructions to interpret unspecified times in Pakistan Standard Time and convert them to UTC before invoking the scheduling tool.

### Online Workflow Integration

Deployed n8n on Railway and connected the LangGraph agent to its production webhook.

### Backend-Owned Business Logic

Kept lead and follow-up creation inside FastAPI rather than allowing the AI model or workflow engine to directly manipulate application database records.

### CRM Synchronization

Connected the primary lead-management system to a separate CRM service and implemented contact lookup, creation, and association workflows.

### Human-in-the-Loop Actions

Implemented an approval path for proposed follow-up emails before sending.

### Full-Stack Development and Deployment

Worked across React, FastAPI, PostgreSQL, AI integration, CRM APIs, workflow automation, and cloud deployment.

---

## Testing and Verification

The following capabilities have been demonstrated during development:

- The deployed AI assistant responds to conversational requests.
- The assistant can initiate the online n8n production webhook.
- The n8n workflow calls the deployed FastAPI follow-up endpoint.
- A follow-up record can be created and returned with a scheduled status.
- A scheduling request for 1:00 PM Pakistan time was converted to 08:00 UTC.
- The assistant returned a scheduling confirmation with a workflow run ID.

### Verification Still Required

The following should be tested independently before treating the system as production-ready:

- Actual email delivery at the scheduled time.
- Handling of failed email sends and retries.
- Duplicate-trigger prevention and idempotency.
- Authentication and authorization for automation endpoints.
- Robust error reporting across the AI agent, n8n, and backend.
- Behavior under multiple simultaneous requests.
- Monitoring and durable automation audit records.

A successful scheduling response confirms that the scheduling path worked for the tested request. It does not, by itself, establish that the email was subsequently delivered.

---

## My Contributions

My work on Al Qaim Estate includes:

- Developing the React-based sales application.
- Building FastAPI endpoints and backend business logic.
- Integrating PostgreSQL through SQLAlchemy.
- Implementing AI-assisted lead qualification.
- Developing a LangGraph-based AI sales assistant.
- Connecting the assistant to lead, property, and CRM tools.
- Implementing follow-up scheduling through n8n.
- Configuring timezone-aware scheduling.
- Integrating the application with an external CRM service.
- Implementing CRM contact lookup and synchronization.
- Developing a human approval flow for follow-up emails.
- Integrating Resend for email delivery.
- Deploying the backend and automation services on Railway.
- Testing and debugging the end-to-end integration between AI tools, webhooks, and backend APIs.

---

## Project Value

Al Qaim Estate demonstrates how AI agents can be integrated into real business workflows.

Instead of functioning only as a conversational interface, the AI assistant can use tools to retrieve business information and initiate controlled operations. LangGraph coordinates agent behavior, n8n orchestrates workflow steps, and FastAPI remains responsible for business logic and persistence.

The project demonstrates practical experience with full-stack engineering, LLM integration, agentic workflows, REST API design, CRM connectivity, and cloud-based automation.

## Project Status

Al Qaim Estate is an evolving AI sales automation prototype with a deployed backend, an online n8n workflow, an AI sales assistant, CRM integration, and tested follow-up scheduling.

The scheduling workflow has been demonstrated end to end for a controlled test request. Further verification of scheduled email delivery, reliability, security, and failure handling remains necessary before describing the platform as a fully production-hardened sales automation system.
