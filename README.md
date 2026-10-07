# AI Sales Automation Platform

An AI-powered sales automation platform for real-estate businesses that combines lead management, AI qualification, external CRM integration, workflow automation, and a tool-using AI sales agent with human-in-the-loop controls.

The project was built as a practical exploration of how AI agents can be connected to real business systems rather than functioning as standalone chatbots.

---

## Overview

Real-estate sales teams spend significant time reviewing leads, understanding customer requirements, updating CRM systems, scheduling follow-ups, and preparing communication.

This project explores how those workflows can be augmented with AI and automation.

The platform allows sales teams to:

- Capture and manage leads
- Automatically qualify leads using AI
- Assign leads to salespeople
- Manage properties
- Schedule and manage follow-ups
- Synchronize lead information with an external CRM
- Automate cross-system workflows using n8n
- Use an AI sales assistant to research leads and properties
- Generate follow-up drafts
- Trigger business workflows through AI tools
- Keep humans in control of consequential actions

---

# Core Architecture

```text
                         AI Sales Assistant
                                │
                                ▼
                         LangGraph Agent
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                 │
              ▼                 ▼                 ▼
        Lead Tools        Property Tools     CRM Tools
              │                 │                 │
              └─────────────────┼─────────────────┘
                                │
                                ▼
                         FastAPI Backend
                                │
                 ┌──────────────┼──────────────┐
                 │              │              │
                 ▼              ▼              ▼
            PostgreSQL        n8n          External CRM
                                │
                                ▼
                         Business Workflows
