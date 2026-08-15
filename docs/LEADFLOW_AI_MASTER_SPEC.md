Absolutely. I think this is the right moment to establish a single source of truth before we start building.
Below is the Master Project Specification v1.0. I have deliberately made it detailed enough that we can use it as our working document throughout all three stages, while still leaving implementation-specific details—such as exact GHL webhook payloads—to be verified when we reach those steps.
The most important rule going forward will be:
We do not casually change the architecture while coding. If we discover a better approach, we update this specification first, then implement the change.
________________________________________
LeadFlow AI
Master Project Specification v1.0
Project: LeadFlow AI → GHL Automation → VendorFlow AI
Project Type: AI Automation / AI Agents / CRM / Workflow Automation / SaaS
Primary Goal: Build a portfolio-grade AI automation platform that demonstrates the ability to design, implement, and deploy complex business workflows using n8n, AI, GoHighLevel, APIs, PostgreSQL, FastAPI, React, WhatsApp, and Email.
Document Status: Master Specification
Version: 1.0
Development Strategy: Stage 1 → Stage 2 → Stage 3
________________________________________
1. Executive Summary
LeadFlow AI is a progressive AI automation platform that will be developed in three stages.
The project begins as an AI-powered lead qualification and follow-up system. It then integrates with GoHighLevel as a real CRM and automation environment. Finally, it evolves into VendorFlow AI, a multi-channel AI-assisted business-development platform for discovering, researching, qualifying, communicating with, and managing potential vendors and partners.
The project is deliberately designed as a learning + portfolio project.
The purpose is not simply to demonstrate knowledge of individual technologies.
The project should demonstrate the ability to:
•	Analyze a business process.
•	Break the process into automation workflows.
•	Connect multiple SaaS platforms through APIs and webhooks.
•	Use n8n for workflow orchestration.
•	Use LLMs where AI provides genuine value.
•	Use deterministic code where AI is unnecessary.
•	Maintain state across multi-step processes.
•	Extract structured information from unstructured conversations.
•	Integrate a CRM.
•	Implement human-in-the-loop workflows.
•	Handle failures and retries.
•	Monitor automation.
•	Build a usable dashboard.
•	Deploy the system.
________________________________________
2. Core Learning Objective
The primary learning objective is:
Learn how to design and build production-style AI business automation systems.
n8n is an important component, but it is not the entire objective.
The project should teach five major capabilities:
2.1 Workflow Architecture
Convert:
"When X happens, do Y, wait, check Z, then either continue or involve a human."
into a reliable automated workflow.
2.2 API Orchestration
Connect:
GHL
n8n
AI
FastAPI
PostgreSQL
WhatsApp
Email
Calendar
2.3 AI Agent Design
Build AI systems with:
•	Context
•	Memory
•	State
•	Tools
•	Structured outputs
•	Decision boundaries
•	Confidence
•	Human escalation
2.4 Human-in-the-Loop Automation
The system should understand that:
Not every business decision should be automated.
2.5 Production Automation
Learn:
•	Error handling
•	Retries
•	Logging
•	Authentication
•	Duplicate prevention
•	Idempotency
•	Monitoring
•	Audit trails
________________________________________
3. Project Philosophy
The following principles govern the entire project.
Principle 1 — Automation First
If a process can reliably be automated using deterministic logic, automate it.
Principle 2 — AI Where It Adds Value
Use AI for:
•	Understanding language
•	Classification
•	Summarization
•	Information extraction
•	Natural-language generation
•	Contextual decision support
Do not use AI for simple deterministic operations.
For example:
Good AI use:
Extract pricing and commission from a vendor's message.
Bad AI use:
Determine whether a database record already exists.
Use database logic for the second.
________________________________________
4. Principle 3 — Human Oversight
AI should assist humans rather than blindly replace them.
The system must support:
AI
 ↓
Decision
 ↓
Confidence / Risk Check
 ↓
Human if required
________________________________________
5. Principle 4 — One Source of Truth
The system should avoid unnecessary duplication of business state.
GHL will serve as the CRM system for Stage 2 and Stage 3.
PostgreSQL will store application-specific data, automation history, AI state, and analytics.
________________________________________
6. Principle 5 — Progressive Complexity
We will not build everything simultaneously.
Stage 1
↓
n8n fundamentals

Stage 2
↓
GHL integration

Stage 3
↓
Advanced AI business automation
Each stage must be functional before the next begins.
________________________________________
7. Project Stages
Stage 1
LeadFlow AI — AI Lead Automation
Technologies:
React
FastAPI
PostgreSQL
n8n
LLM
Email
SMS
Calendar
Purpose:
Learn workflow automation.
________________________________________
Stage 2
LeadFlow AI — GoHighLevel Integration
Technologies:
Stage 1
+
GoHighLevel
+
GHL APIs/Webhooks
Purpose:
Learn CRM automation and real-world SaaS integration.
________________________________________
Stage 3
VendorFlow AI — AI Business Development
Technologies:
Stage 2
+
AI Agents
+
WhatsApp
+
Email
+
Vendor Research
+
Conversation Memory
+
Structured Extraction
+
Human Handoff
Purpose:
Build the flagship portfolio system.
________________________________________
8. Overall Architecture
                         LEADFLOW AI
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
       React               FastAPI           PostgreSQL
          │                   │                   │
          │                   └────────┬──────────┘
          │                            │
          │                            ▼
          │                           n8n
          │                            │
          │             ┌──────────────┼──────────────┐
          │             │              │              │
          ▼             ▼              ▼              ▼
      Dashboard        AI             GHL       External APIs
                                       │
                              ┌────────┼────────┐
                              ▼        ▼        ▼
                           Email   WhatsApp   Calendar
________________________________________
9. Component Responsibilities
React
Responsible for:
•	Dashboard
•	Vendor/lead management
•	Pipeline
•	Conversations
•	Analytics
•	Configuration
•	Human approval
•	Automation monitoring
React should not contain secret API credentials.
________________________________________
10. FastAPI
FastAPI will be the custom application/backend layer.
Use FastAPI for:
•	Custom business logic
•	Authentication
•	Complex validation
•	Database access
•	Advanced scoring
•	Custom AI services
•	API endpoints
•	Dashboard APIs
•	Webhook processing where appropriate
FastAPI should not duplicate workflows that are better suited to n8n.
________________________________________
11. PostgreSQL
PostgreSQL is the application's persistent data store.
It will store:
•	Leads
•	Vendors
•	Conversations
•	Messages
•	AI analysis
•	Qualification results
•	Automation logs
•	Follow-ups
•	Configuration
•	Audit records
________________________________________
12. n8n
n8n is the workflow orchestration layer.
Use n8n for:
•	Webhooks
•	API calls
•	Routing
•	Scheduling
•	Wait states
•	Workflow branching
•	AI calls
•	CRM synchronization
•	Notifications
•	Follow-ups
•	Integration logic
•	Error workflows
________________________________________
13. GoHighLevel
GHL becomes the CRM layer in Stage 2.
Use GHL for:
•	Contacts
•	Pipeline
•	Opportunities
•	Tags
•	Custom fields
•	Conversations
•	Appointments
•	CRM state
Exact API endpoints and webhook payloads must be verified against the current GHL documentation when implemented.
________________________________________
14. AI Layer
The primary AI provider will initially be:
Claude
The architecture should avoid making the entire application dependent on provider-specific logic.
Potential future providers:
•	OpenAI
•	Gemini
But multi-provider support is not an MVP requirement.
________________________________________
15. Communication Layer
Stage 3 will support:
•	WhatsApp
•	Email
•	Call tracking/workflows
Communication must use appropriate official APIs/providers and authorized test contacts.
________________________________________
16. Security Requirements
Never store credentials in:
•	React source code
•	GitHub
•	public configuration
•	client-side environment variables
Use environment variables or secure credential storage.
Potential variables:
DATABASE_URL
JWT_SECRET
GHL_API_KEY
GHL_LOCATION_ID
ANTHROPIC_API_KEY
OPENAI_API_KEY
N8N_WEBHOOK_SECRET
WHATSAPP_API credentials
EMAIL credentials
Exact variables will be finalized during implementation.
________________________________________
17. Stage 1 Specification
LeadFlow AI — AI Lead Automation
________________________________________
17.1 Stage 1 Objective
Build a system where an incoming lead is:
Captured
 ↓
Validated
 ↓
Analyzed by AI
 ↓
Scored
 ↓
Classified
 ↓
Stored
 ↓
Followed up
 ↓
Booked
OR
Human handoff
________________________________________
18. Stage 1 Lead Lifecycle
NEW
 ↓
PROCESSING
 ↓
AI QUALIFIED
 ↓
HOT / WARM / COLD
 ↓
CONTACTED
 ↓
FOLLOW-UP
 ↓
APPOINTMENT
 ↓
HUMAN HANDOFF
Terminal states:
WON
LOST
DO_NOT_CONTACT
________________________________________
19. Stage 1 Database
Initial tables:
leads
lead_qualification
followups
automation_logs
________________________________________
19.1 leads
Conceptual fields:
id
first_name
last_name
email
phone
source
message
status
created_at
updated_at
________________________________________
19.2 lead_qualification
id
lead_id
score
temperature
buying_intent
urgency
industry
service_category
summary
recommended_action
ai_confidence
created_at
________________________________________
19.3 followups
id
lead_id
channel
scheduled_at
status
attempt_number
sent_at
________________________________________
19.4 automation_logs
id
workflow_name
lead_id
execution_id
status
error_message
created_at
________________________________________
20. Stage 1 Workflow Catalog
WF-001 Lead Intake
WF-002 AI Qualification
WF-003 Lead Routing
WF-004 Follow-Up
WF-005 Appointment Handler
WF-006 Human Handoff
WF-007 Error Handler
________________________________________
21. WF-001 Lead Intake
Workflow:
Webhook
 ↓
Validate
 ↓
Normalize
 ↓
Check Duplicate
 ↓
Create Lead
 ↓
Trigger Qualification
Requirements:
•	Validate required fields.
•	Normalize email.
•	Normalize phone where appropriate.
•	Detect duplicates.
•	Prevent duplicate processing.
________________________________________
22. WF-002 AI Qualification
Input:
Name
Email
Phone
Source
Lead Message
AI returns structured JSON.
Example:
{
  "temperature": "HOT",
  "score": 92,
  "buying_intent": "HIGH",
  "urgency": "HIGH",
  "industry": "Marketing",
  "service_category": "AI Automation",
  "summary": "Lead is actively seeking an automation solution.",
  "recommended_action": "Book consultation"
}
The backend/n8n workflow must validate the output.
________________________________________
23. AI Rules
AI must:
•	Return valid structured output.
•	Avoid inventing facts.
•	Use only provided context.
•	Provide confidence where appropriate.
Invalid output:
AI
 ↓
Validation
 ↓
FAIL
 ↓
Retry / Repair
 ↓
FAIL
 ↓
Human/Error Workflow
________________________________________
24. Lead Routing
Score 80–100
→ HOT

Score 50–79
→ WARM

Score 0–49
→ COLD
This threshold can later become configurable.
________________________________________
25. Follow-Up Workflow
Example:
Initial Contact
 ↓
Wait
 ↓
Response?
 ├── YES → Stop automation
 └── NO
       ↓
    Follow-up 1
       ↓
      Wait
       ↓
    Follow-up 2
Never continue follow-ups if:
•	Lead responds.
•	Lead opts out.
•	Human takes over.
•	Appointment is booked.
•	Lead is marked lost.
________________________________________
26. Stage 1 Human Handoff
Trigger when:
•	Lead requests a human.
•	AI confidence is low.
•	Lead is highly qualified.
•	Complex question is asked.
•	Negotiation begins.
Workflow:
AI
 ↓
Human Required
 ↓
Pause Automation
 ↓
Notify Team
 ↓
Assign Owner
________________________________________
27. Stage 1 Completion Criteria
Stage 1 is complete only when:
[ ] Lead webhook works
[ ] Validation works
[ ] Duplicate detection works
[ ] AI qualification works
[ ] AI output is validated
[ ] Lead score is stored
[ ] Lead routing works
[ ] Follow-up works
[ ] Follow-up stops correctly
[ ] Appointment flow works
[ ] Human handoff works
[ ] Error handling works
[ ] Logs are stored
[ ] End-to-end test passes
Only after these are satisfied do we move to Stage 2.
________________________________________
28. Stage 2 Specification
GoHighLevel Integration
________________________________________
28.1 Stage 2 Objective
Connect LeadFlow AI to a real CRM environment.
Architecture:
Lead
 ↓
n8n
 ↓
AI
 ↓
GoHighLevel
 ↓
Pipeline
 ↓
Conversation
 ↓
Appointment
________________________________________
29. GHL CRM Model
GHL will contain:
Contacts
People/leads.
Opportunities
Sales pipeline records.
Tags
Automation state.
Custom Fields
AI-generated information.
Calendar
Appointments.
________________________________________
30. GHL Custom Fields
Initial fields:
AI Lead Score
AI Lead Temperature
AI Buying Intent
AI Urgency
AI Industry
AI Service Category
AI Summary
AI Recommended Action
AI Confidence
AI Qualification Date
________________________________________
31. GHL Tags
AI-HOT
AI-WARM
AI-COLD
AI-QUALIFIED
AI-NURTURE
AI-HUMAN-HANDOFF
AI-APPOINTMENT-BOOKED
AI-DO-NOT-CONTACT
________________________________________
32. GHL Pipeline
Initial pipeline:
New Lead
 ↓
AI Qualification
 ↓
Qualified
 ↓
Contacted
 ↓
Appointment Scheduled
 ↓
Sales Conversation
 ↓
Won
Alternative:
Lost
________________________________________
33. Stage 2 Workflow Catalog
WF-008 GHL Contact Sync
WF-009 GHL Opportunity Sync
WF-010 GHL Webhook Intake
WF-011 GHL Appointment Handler
WF-012 GHL Human Handoff
________________________________________
34. GHL Contact Synchronization
When a lead is qualified:
n8n
 ↓
GHL Contact
 ↓
Update Custom Fields
 ↓
Add Tags
Example:
Score = 92
Temperature = HOT
Intent = HIGH
GHL should reflect those values.
________________________________________
35. GHL Pipeline Synchronization
Example:
HOT
 ↓
GHL
 ↓
Qualified
When appointment is booked:
Qualified
 ↓
Appointment Scheduled
________________________________________
36. GHL Appointment Workflow
Appointment Booked
 ↓
Webhook
 ↓
Identify Contact
 ↓
Update Pipeline
 ↓
Add Appointment Tag
 ↓
Stop Follow-up
 ↓
Notify Sales
________________________________________
37. Stage 2 Completion Criteria
[ ] GHL test environment configured
[ ] Contact creation works
[ ] Contact update works
[ ] Custom fields work
[ ] Tags work
[ ] Pipeline works
[ ] Opportunities work
[ ] GHL webhook received
[ ] n8n processes webhook
[ ] AI results update GHL
[ ] Appointment flow works
[ ] Follow-up stops after appointment
[ ] Human handoff works
[ ] End-to-end test passes
________________________________________
38. Stage 3 Specification
VendorFlow AI
________________________________________
39. Stage 3 Objective
Transform LeadFlow into an AI-assisted business-development system for vendors and partners.
The system will help a company:
•	Discover vendors.
•	Research vendors.
•	Organize vendors.
•	Contact vendors.
•	Communicate with vendors.
•	Qualify vendors.
•	Extract information.
•	Track relationships.
•	Follow up.
•	Escalate to humans.
•	Measure performance.
________________________________________
40. Vendor Lifecycle
DISCOVERED
 ↓
RESEARCHED
 ↓
APPROVED FOR OUTREACH
 ↓
CONTACTED
 ↓
RESPONDED
 ↓
QUALIFYING
 ↓
QUALIFIED
 ↓
HUMAN REVIEW
 ↓
NEGOTIATION
 ↓
APPROVED PARTNER
Alternative states:
UNRESPONSIVE
NOT_INTERESTED
DO_NOT_CONTACT
DISQUALIFIED
________________________________________
41. Vendor Discovery
MVP sources:
•	CSV
•	Manual entry
•	Authorized APIs
•	Approved public/first-party data
The system must not depend on scraping a website that prohibits automated collection.
Discovery is deliberately separated from outreach.
________________________________________
42. Vendor Research
When a vendor is created:
Vendor
 ↓
Research
 ↓
AI Extraction
 ↓
Structured Profile
 ↓
CRM
Information:
Company
Website
Services
Industry
Location
Specialties
Pricing
Target customers
Availability
Unknown information should be represented as unknown/null.
________________________________________
43. Vendor Database
Main table:
vendors
Conceptual schema:
id
ghl_contact_id
company_name
website
email
phone
whatsapp
location
industry
services
description
pricing
commission
availability
status
score
qualification_status
ai_summary
ai_confidence
assigned_to
created_at
updated_at
________________________________________
44. Vendor Conversations
Table:
vendor_conversations
Fields:
id
vendor_id
channel
external_conversation_id
status
started_at
last_message_at
Channels:
WHATSAPP
EMAIL
CALL
________________________________________
45. Messages
Table:
messages
Fields:
id
conversation_id
sender_type
message
message_hash
timestamp
ai_generated
Sender types:
VENDOR
AI
HUMAN
SYSTEM
________________________________________
46. Qualification
Table:
vendor_qualification
Fields:
id
vendor_id
services
pricing
commission
locations
availability
experience
score
confidence
qualified_at
________________________________________
47. Vendor Qualification Requirements
The AI should attempt to collect:
Services offered
Pricing
Commission
Location
Availability
Experience
Capacity
Specialties
Turnaround time
Minimum engagement
The exact fields can be modified depending on the fictional business scenario.
________________________________________
48. Qualification State Machine
SERVICES
 ↓
PRICING
 ↓
COMMISSION
 ↓
LOCATION
 ↓
AVAILABILITY
 ↓
FINAL QUALIFICATION
The AI must know which fields are already complete.
________________________________________
49. Conversation Memory
For each conversation, the AI receives:
Vendor Profile
+
Conversation History
+
Known Information
+
Missing Information
+
Current Qualification State
Example:
Services       COMPLETE
Pricing        COMPLETE
Commission     MISSING
Location       COMPLETE
Availability   MISSING
The AI should ask only relevant next questions.
________________________________________
50. Structured Extraction
Example vendor message:
"We charge $600 per project and offer 15% referral commission."
AI output:
{
  "pricing": "$600/project",
  "commission": "15%"
}
Database is updated automatically.
________________________________________
51. Extraction Confidence
Example:
{
  "pricing": "$600/project",
  "pricing_confidence": 0.96,
  "commission": "15%",
  "commission_confidence": 0.92
}
Low confidence:
AI Confidence < Threshold
 ↓
Human Review
________________________________________
52. AI Conversation Behavior
The AI should:
•	Remember previous answers.
•	Avoid repeated questions.
•	Ask concise questions.
•	Acknowledge useful information.
•	Adapt to vendor responses.
•	Extract additional information even if unsolicited.
•	Stop when the vendor is uninterested.
•	Escalate when necessary.
The goal is natural, context-aware communication, not pretending that an AI is secretly a human.
________________________________________
53. WhatsApp
Use an appropriate official WhatsApp Business API/provider.
Architecture:
WhatsApp
 ↓
Official API / Provider
 ↓
n8n Webhook
 ↓
Vendor Identification
 ↓
Conversation Retrieval
 ↓
AI Agent
 ↓
Structured Extraction
 ↓
Response
 ↓
WhatsApp
Exact provider will be selected during implementation.
________________________________________
54. Email
Architecture:
Email
 ↓
Email Provider
 ↓
n8n
 ↓
Identify Vendor
 ↓
Load Conversation
 ↓
AI
 ↓
Extract Data
 ↓
Generate Response
 ↓
Send / Human Approval
Email thread identity must be preserved.
________________________________________
55. Unified Communication Timeline
The dashboard should combine:
WhatsApp
Email
Call
into one timeline.
Example:
Aug 10
Email sent

Aug 11
Vendor replied

Aug 11
AI extracted pricing

Aug 12
WhatsApp conversation

Aug 13
Commission received

Aug 14
Vendor qualified

Aug 15
Human review
________________________________________
56. Call Tracking
MVP:
Call scheduled
Call completed
Call outcome
Notes
Next action
Owner
Later:
Call Recording
 ↓
Transcription
 ↓
AI Summary
 ↓
Structured Extraction
 ↓
Vendor Profile
Actual call transcription integration is optional and should not block the core project.
________________________________________
57. Vendor Scoring
Initial scoring model:
Services match       20
Pricing known        15
Commission known     20
Location match       15
Availability         10
Experience            10
Business fit          10
-------------------------
Total                100
Classification:
80–100 HIGH
60–79  MEDIUM
0–59   LOW
The scoring system should eventually become configurable.
________________________________________
58. Human Handoff
Triggers:
Vendor requests human
AI confidence low
Vendor highly qualified
Negotiation begins
Complex question
Potential complaint
Business-sensitive decision
Workflow:
AI
 ↓
Human Required
 ↓
Pause Automation
 ↓
Add Handoff Tag
 ↓
Assign Owner
 ↓
Notify Human
________________________________________
59. Negotiation
Negotiation should normally be human-led.
AI may provide:
Vendor pricing
Commission
Requirements
Conversation summary
Potential concerns
Suggested internal response
But automated negotiation is outside the initial MVP.
________________________________________
60. Follow-Up Engine
Workflow:
Initial Outreach
 ↓
Wait
 ↓
Response?
 ├── YES → Continue Conversation
 └── NO
       ↓
   Follow-up 1
       ↓
      Wait
       ↓
   Follow-up 2
       ↓
      Wait
       ↓
   Final Follow-up
Stop conditions:
Response
Opt-out
Human handoff
Qualified
Disqualified
Do Not Contact
________________________________________
61. Outreach Rules
The system must support:
Approval Required
before automated outreach.
This is especially important for the portfolio version.
The system should not be designed to spam large numbers of people.
________________________________________
62. GHL Vendor Pipeline
Discovered
 ↓
Researching
 ↓
Approved for Outreach
 ↓
Contacted
 ↓
Responded
 ↓
Qualifying
 ↓
Qualified
 ↓
Human Review
 ↓
Negotiation
 ↓
Approved Partner
________________________________________
63. GHL Vendor Tags
VENDOR-NEW
VENDOR-RESEARCHED
VENDOR-CONTACTED
VENDOR-RESPONDED
VENDOR-QUALIFYING
VENDOR-QUALIFIED
VENDOR-HUMAN-HANDOFF
VENDOR-NEGOTIATION
VENDOR-APPROVED
VENDOR-NOT-INTERESTED
VENDOR-DO-NOT-CONTACT
________________________________________
64. GHL Custom Fields
Vendor Type
Vendor Services
Vendor Location
Vendor Pricing
Vendor Commission
Vendor Score
AI Qualification
AI Summary
AI Confidence
Conversation Status
Human Handoff
Last AI Action
Next Follow-up
________________________________________
65. Stage 3 n8n Workflow Catalog
WF-013 Vendor Intake
WF-014 Vendor Research
WF-015 Vendor Deduplication
WF-016 Vendor GHL Sync
WF-017 Vendor Outreach
WF-018 WhatsApp Incoming Message
WF-019 Email Incoming Message
WF-020 Conversation Processing
WF-021 Structured Extraction
WF-022 Vendor Qualification
WF-023 Vendor Follow-Up
WF-024 Human Handoff
WF-025 Appointment/Call Handler
WF-026 Daily BD Summary
WF-027 Automation Error Handler
________________________________________
66. WF-013 Vendor Intake
Import / Webhook
 ↓
Normalize
 ↓
Duplicate Check
 ↓
Create Vendor
 ↓
Trigger Research
________________________________________
67. WF-014 Vendor Research
Vendor
 ↓
Approved Data
 ↓
AI Research
 ↓
Structured Output
 ↓
Validation
 ↓
PostgreSQL
 ↓
GHL
________________________________________
68. WF-015 Deduplication
Potential identifiers:
Email
Phone
Website
Company Name
Workflow:
New Vendor
 ↓
Normalize
 ↓
Search
 ↓
Match?
 ├── YES → Review/Merge
 └── NO → Create
________________________________________
69. WF-017 Outreach
Approved Vendor
 ↓
Check Contact Permission
 ↓
Generate Message
 ↓
Human Approval
 ↓
Send
 ↓
Log
 ↓
Update CRM
________________________________________
70. WF-018 WhatsApp Incoming Message
WhatsApp Webhook
 ↓
Identify Vendor
 ↓
Load Conversation
 ↓
Load Vendor Profile
 ↓
AI Agent
 ↓
Extract Information
 ↓
Update Vendor
 ↓
Determine Next Action
 ↓
Human?
 ├── YES → Handoff
 └── NO → Response
________________________________________
71. WF-019 Email Incoming Message
Same fundamental architecture as WhatsApp.
Email
 ↓
Identify
 ↓
Load Context
 ↓
AI
 ↓
Extract
 ↓
Update
 ↓
Respond/Handoff
________________________________________
72. WF-020 Conversation Processing
This is the core Stage 3 AI workflow.
Input:
Vendor
Conversation
Current State
Known Fields
Missing Fields
AI performs:
Understand
 ↓
Classify
 ↓
Extract
 ↓
Update State
 ↓
Determine Next Action
________________________________________
73. WF-021 Structured Extraction
The AI should return structured information.
Example:
{
  "services": ["SEO", "Digital Marketing"],
  "pricing": "$600/project",
  "commission": "15%",
  "locations": ["Lahore", "Islamabad"],
  "availability": "Available next month"
}
Unknown:
{
  "commission": null
}
No hallucination.
________________________________________
74. WF-022 Qualification
Known Information
 ↓
Check Missing Fields
 ↓
All Required?
 ├── YES → Score
 └── NO → Ask Next Question
________________________________________
75. WF-023 Follow-Up
Scheduled workflow:
Find Due Vendors
 ↓
Check Status
 ↓
Check Response
 ↓
Check Opt-Out
 ↓
Generate Follow-up
 ↓
Approval
 ↓
Send
 ↓
Log
________________________________________
76. WF-024 Human Handoff
AI
 ↓
Escalation Trigger
 ↓
Pause Automation
 ↓
Create Task
 ↓
Assign Owner
 ↓
Notify
 ↓
CRM Update
________________________________________
77. WF-026 Daily BD Summary
The system should generate a summary containing:
New vendors
Contacted
Responses
Qualified
Human handoffs
Calls
Top opportunities
Failed workflows
Pending follow-ups
________________________________________
78. Dashboard
The React dashboard will contain:
Overview
Total Vendors
Contacted
Responses
Qualified
Human Handoffs
Calls
Pipeline
Discovered
Researching
Contacted
Responded
Qualifying
Qualified
Negotiation
Approved
Vendor Table
Company
Services
Location
Score
Pricing
Commission
Status
Last Contact
Next Action
Owner
________________________________________
79. Conversation Screen
Display:
Vendor Profile
+
AI Summary
+
Qualification
+
Conversation
+
Extracted Data
+
Missing Information
+
Next Action
+
Human Handoff
________________________________________
80. AI Business Development Assistant
The dashboard AI can answer:
Show qualified vendors.

Which vendors offer the highest commission?

Which vendors cover Lahore?

Which vendors haven't responded?

Which vendors require human follow-up?

Summarize today's conversations.

Why was this vendor qualified?

Which vendors are missing pricing?

Which vendors are ready for negotiation?
________________________________________
81. AI Tools
Initial read-only tools:
search_vendors()
get_vendor()
get_vendor_history()
get_qualified_vendors()
get_pending_followups()
get_human_handoffs()
get_vendor_metrics()
get_missing_information()
Potential write tools:
assign_vendor()
pause_automation()
create_followup()
schedule_call()
Write operations should require confirmation.
________________________________________
82. AI Agent Architecture
                  AI AGENT
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
     Context        Tools        State
        │            │            │
        └────────────┼────────────┘
                     ▼
               Decision
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
       Respond     Extract     Escalate
________________________________________
83. AI Decision Boundaries
AI may:
•	Summarize.
•	Classify.
•	Extract.
•	Draft.
•	Recommend.
•	Ask qualification questions.
AI should not independently:
•	Approve major business agreements.
•	Negotiate sensitive terms.
•	Override opt-out.
•	Circumvent platform restrictions.
•	Make irreversible decisions.
________________________________________
84. Auditability
Every important AI action should be traceable.
Record:
Vendor
Workflow
AI Action
Prompt/version identifier
Output
Confidence
Timestamp
Human override
Final action
Exact prompt storage strategy will be determined based on privacy/security requirements.
________________________________________
85. Error Handling
All workflows need:
Success
Failure
Retry
Fallback
Human Notification
Potential failures:
GHL API
WhatsApp API
Email API
AI API
Database
Webhook
Authentication
Rate limit
Invalid JSON
________________________________________
86. Idempotency
Critical workflows must be safe to run twice.
For example:
Webhook received
 ↓
Check message_hash
 ↓
Already processed?
 ├── YES → Ignore
 └── NO → Process
This prevents:
•	Duplicate CRM contacts.
•	Duplicate messages.
•	Duplicate follow-ups.
•	Duplicate qualification.
________________________________________
87. Testing Strategy
Testing will occur at four levels.
Unit Testing
FastAPI logic.
Integration Testing
APIs and database.
Workflow Testing
n8n executions.
End-to-End Testing
Complete business scenarios.
________________________________________
88. Stage 3 Test Scenarios
Test 1
Create vendor.
Expected:
Vendor created
GHL contact created
Test 2
Duplicate vendor.
Expected:
Duplicate detected
Test 3
AI research.
Expected:
Structured vendor profile
Test 4
Vendor response.
Expected:
AI extracts information
Test 5
Missing information.
Expected:
AI asks relevant next question
Test 6
Vendor opts out.
Expected:
DO_NOT_CONTACT
All follow-ups stopped
Test 7
Vendor requests human.
Expected:
AI stops
Human notified
Test 8
Qualified vendor.
Expected:
Score calculated
CRM updated
Human review
________________________________________
89. Compliance and Responsible Automation
The portfolio implementation should:
•	Use authorized test contacts.
•	Use official APIs.
•	Respect platform terms.
•	Respect opt-outs.
•	Avoid spam.
•	Avoid bypassing restrictions.
•	Provide human control.
•	Protect personal information.
•	Secure credentials.
The purpose of the portfolio project is to demonstrate automation engineering, not mass unsolicited outreach.
________________________________________
90. Deployment Architecture
                    Internet
                       │
                       ▼
                  Vercel
                    React
                       │
                       ▼
                  Railway
                   FastAPI
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
        PostgreSQL              n8n
                                  │
                    ┌─────────────┼─────────────┐
                    ▼             ▼             ▼
                   GHL          AI APIs      Messaging
________________________________________
91. Environment Strategy
Development
Local React
Local/Flexible FastAPI
Development PostgreSQL
Development n8n
GHL test environment
Test communication accounts
Production
Vercel
Railway
PostgreSQL
n8n Cloud/Self-hosted
Production GHL
Production communication providers
________________________________________
92. Repository Structure
Recommended:
leadflow-ai/
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── hooks/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── ai/
│   │   ├── workflows/
│   │   └── utils/
│   │
│   └── tests/
│
├── n8n/
│   ├── stage1/
│   ├── stage2/
│   └── stage3/
│
├── docs/
│   ├── architecture/
│   ├── database/
│   ├── api/
│   └── workflows/
│
├── README.md
└── .gitignore
________________________________________
93. n8n Workflow Naming
Use consistent names.
ST1-WF001-Lead-Intake
ST1-WF002-AI-Qualification
ST1-WF003-Lead-Routing

ST2-WF008-GHL-Contact-Sync
ST2-WF009-GHL-Opportunity-Sync
ST2-WF010-GHL-Webhook

ST3-WF013-Vendor-Intake
ST3-WF014-Vendor-Research
ST3-WF017-Vendor-Outreach
ST3-WF018-WhatsApp-Incoming
ST3-WF019-Email-Incoming
ST3-WF020-Conversation-Processing
ST3-WF024-Human-Handoff
________________________________________
94. API Design
FastAPI endpoints will evolve with each stage.
Initial examples:
POST /api/leads
GET  /api/leads
GET  /api/leads/{id}

POST /api/leads/{id}/qualify

POST /api/webhooks/n8n
Stage 3:
POST /api/vendors
GET  /api/vendors
GET  /api/vendors/{id}

POST /api/vendors/{id}/research
POST /api/vendors/{id}/qualify

GET /api/vendors/{id}/conversation
GET /api/vendors/{id}/timeline

POST /api/vendors/{id}/handoff
Exact endpoint contracts will be finalized before implementation.
________________________________________
95. API Contract Rule
Whenever we create an endpoint, document:
Endpoint
Method
Purpose
Authentication
Request
Response
Errors
Calling system
Called system
Example:
POST /api/vendors/{id}/qualify

Purpose:
Store vendor qualification result.

Caller:
n8n

Authentication:
Internal service authentication

Request:
Qualification object

Response:
Updated vendor

Errors:
400
401
404
422
500
________________________________________
96. Documentation Rule
Whenever we make a significant architectural decision, record:
Decision
Reason
Alternatives considered
Date
Impact
Example:
Decision:
Use n8n for orchestration and FastAPI for complex logic.

Reason:
Avoid duplicating business logic in workflow nodes.

Alternative:
Implement everything in FastAPI.

Impact:
Cleaner separation of responsibilities.
________________________________________
97. Development Process
For every feature:
1. Define requirement
2. Define architecture
3. Define data
4. Define workflow
5. Implement
6. Test
7. Debug
8. Document
9. Mark complete
Do not jump directly from:
"We need WhatsApp"
to code.
First define:
WhatsApp
 ↓
Provider
 ↓
Webhook
 ↓
n8n
 ↓
Conversation
 ↓
AI
 ↓
Database
 ↓
Response
Then implement.
________________________________________
98. Change Management
If we discover a better architecture:
Do not immediately rewrite code.
First:
Current Design
 ↓
Problem
 ↓
Proposed Change
 ↓
Impact
 ↓
Update Specification
 ↓
Implement
This keeps the project coherent.
________________________________________
99. MVP Definition
The entire project should not become an enormous SaaS product.
The MVP must demonstrate one complete end-to-end business process.
The strongest MVP scenario is:
Vendor Added
 ↓
AI Research
 ↓
GHL Contact
 ↓
Approved Outreach
 ↓
WhatsApp/Email
 ↓
Vendor Responds
 ↓
AI Understands Response
 ↓
Structured Extraction
 ↓
Vendor Profile Updated
 ↓
Qualification Score
 ↓
Human Handoff
 ↓
CRM Updated
 ↓
Analytics
If this works reliably, the project has achieved its primary purpose.
________________________________________
100. Features We Will NOT Prioritize Initially
Do not allow scope creep into:
•	Multi-tenant SaaS billing.
•	Complex subscription management.
•	Mobile application.
•	Dozens of communication channels.
•	Fully autonomous negotiation.
•	Large-scale mass outreach.
•	Sophisticated voice AI.
•	Complex scraping infrastructure.
•	Multiple LLM providers.
•	Enterprise RBAC.
These can be future enhancements.
________________________________________
101. Portfolio Objective
The finished project should answer a client's question:
"Can this developer build a real AI automation system rather than just a chatbot?"
The answer should be obvious from the demonstration.
________________________________________
102. Portfolio Case Study
The final case study should contain:
Executive Summary
What the system does.
Business Problem
What manual process it replaces.
Solution
How automation solves the problem.
Architecture
System diagram.
Technology Stack
React
FastAPI
PostgreSQL
n8n
GoHighLevel
Claude
WhatsApp
Email
AI Usage
Explain:
•	Qualification
•	Extraction
•	Classification
•	Summarization
•	Conversation management
Technical Challenges
Examples:
•	Webhook reliability
•	AI structured output
•	Conversation state
•	Duplicate prevention
•	Human handoff
•	Multi-system synchronization
Business Value
Explain the manual work reduced.
Results
Use only genuine results from our test implementation.
________________________________________
103. Loom Demonstration
The final Loom should demonstrate one complete scenario.
Recommended flow:
0:00 — Problem

0:45 — Architecture

1:30 — Vendor creation

2:00 — AI research

2:45 — GHL synchronization

3:30 — n8n workflow

4:15 — Vendor conversation

5:00 — AI extraction

5:45 — Qualification

6:15 — Human handoff

6:45 — Dashboard

7:30 — Technical architecture

8:00 — Summary
The video should emphasize business outcome, not just clicking through nodes.
________________________________________
104. Portfolio Screenshots
Capture:
1.	Architecture diagram
2.	n8n workflow
3.	GHL pipeline
4.	Vendor profile
5.	Conversation screen
6.	AI extraction
7.	Human handoff
8.	Analytics dashboard
9.	Database schema
10.	API documentation
________________________________________
105. Final Portfolio Positioning
The project should eventually be presented as:
LeadFlow AI
AI Business Automation Platform
Stage 1
AI Lead Qualification & Follow-Up
Stage 2
GoHighLevel CRM Automation
Stage 3
VendorFlow AI — Multi-Channel AI Business Development
________________________________________
106. Final Skill Set Demonstrated
By completing all three stages, the project should demonstrate:
Python
FastAPI
React
PostgreSQL
REST APIs
Webhooks
n8n
GoHighLevel
AI Agents
LLMs
Structured Outputs
Conversation Memory
State Machines
CRM Automation
WhatsApp APIs
Email APIs
Calendar APIs
Human-in-the-Loop
Workflow Orchestration
Error Handling
Retry Logic
Idempotency
Logging
Analytics
Deployment
________________________________________
107. Final Architecture
The final system should conceptually be:
                         LEADFLOW AI
                              │
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
       React               FastAPI           PostgreSQL
          │                   │                   │
          │                   └────────┬──────────┘
          │                            │
          │                            ▼
          │                           n8n
          │                            │
          │            ┌───────────────┼────────────────┐
          │            │               │                │
          │            ▼               ▼                ▼
          │           AI              GHL          External APIs
          │                            │                │
          │                  ┌─────────┼─────────┐      │
          │                  ▼         ▼         ▼      │
          │               Contacts  Pipeline  Calendar  │
          │                                             │
          │                            ┌────────────────┘
          │                            │
          │                            ▼
          │                       WhatsApp
          │
          │
          └────────────── Dashboard / Analytics
________________________________________
108. Master Project Workflow
Our actual development process will be:
                 MASTER SPECIFICATION
                         │
                         ▼
                  STAGE 1 DESIGN
                         │
                         ▼
                  STAGE 1 BUILD
                         │
                         ▼
                   STAGE 1 TEST
                         │
                         ▼
               STAGE 1 COMPLETION
                         │
                         ▼
                  STAGE 2 DESIGN
                         │
                         ▼
                  GHL INTEGRATION
                         │
                         ▼
                   STAGE 2 TEST
                         │
                         ▼
               STAGE 2 COMPLETION
                         │
                         ▼
                  STAGE 3 DESIGN
                         │
                         ▼
                VENDORFLOW BUILD
                         │
                         ▼
                   END-TO-END TEST
                         │
                         ▼
                   DEPLOYMENT
                         │
                         ▼
                  LOOM DEMO
                         │
                         ▼
                PORTFOLIO CASE STUDY
________________________________________
109. Definition of "Done"
The project is not done merely because:
"The workflow runs."
It is done when:
[ ] Architecture is documented
[ ] Database is documented
[ ] APIs are documented
[ ] n8n workflows are documented
[ ] AI behavior is documented
[ ] Error paths exist
[ ] Duplicate prevention exists
[ ] Human handoff works
[ ] Test scenarios pass
[ ] Deployment works
[ ] Credentials are secured
[ ] Dashboard works
[ ] Loom demonstration works
[ ] Portfolio documentation is complete
________________________________________
110. Final Project Goal
The ultimate objective is to be able to demonstrate the following scenario:
A vendor enters the system. The platform researches and structures the vendor's information, synchronizes the vendor with the CRM, prepares an approved personalized outreach message, receives the vendor's response through an appropriate communication channel, uses an AI agent to understand the response and extract structured business information, maintains conversation state, determines what information is still missing, continues the qualification process, scores the vendor, updates the CRM, schedules or requests human involvement when appropriate, stops automated follow-ups when the vendor responds or opts out, and provides the business team with a complete timeline and analytics view.
That single workflow demonstrates the core capability we are trying to develop:
Designing and implementing AI-powered business automation systems from end to end.
________________________________________
111. Working Agreement for This Project
This document is our source of truth.
When we work on the project:
If we need to build something
We first identify its place in this specification.
Example:
"Let's build vendor qualification."
We refer to:
Stage 3
WF-022
Vendor Qualification
If we discover an API behaves differently
We verify the actual behavior and update the relevant section.
If architecture needs to change
We document the change before implementing it.
If a feature isn't in scope
We don't automatically add it.
If a stage isn't complete
We don't move to the next stage just because the next feature looks interesting.
________________________________________
112. Current Status
At the beginning:
Stage 1: NOT STARTED
Stage 2: NOT STARTED
Stage 3: NOT STARTED
The implementation order is:
1. Project foundation
2. Stage 1
3. Stage 1 testing
4. Stage 1 completion
5. Stage 2
6. Stage 2 testing
7. Stage 2 completion
8. Stage 3
9. Stage 3 testing
10. Deployment
11. Portfolio documentation
________________________________________
113. First Implementation Task
We should not start with GHL, WhatsApp, or AI agents.
Our first implementation task should be:
Stage 1 — Project Foundation
Set up:
leadflow-ai/
│
├── frontend/
├── backend/
├── n8n/
└── docs/
Then establish:
React
   ↓
FastAPI
   ↓
PostgreSQL
and verify that the basic application works.
After that:
FastAPI
   ↓
n8n
Then build WF-001 Lead Intake.
That gives you the cleanest possible introduction to n8n and prevents us from throwing five new technologies at you at once.
________________________________________
The most important thing about this document
I would save this exact document as your LEADFLOW_AI_MASTER_SPEC.md.
From this point forward, this is our project blueprint.
As we actually build, some details will necessarily evolve—for example, the exact GHL webhook structure, the chosen WhatsApp provider, or an API endpoint. That's normal. Those aren't reasons to redesign the project; we'll update the specification when those facts become known.
The architecture, staged learning path, workflow naming, responsibilities, scope boundaries, and completion criteria above are our baseline.
And I think this is a much better way for us to build the project than jumping from one code snippet to another. It gives us a genuine engineering project to work through, while simultaneously teaching you the exact AI automation + n8n + CRM + AI-agent skills that keep appearing in the Upwork jobs you've been evaluating.

