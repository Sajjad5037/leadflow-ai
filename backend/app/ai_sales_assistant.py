from typing import TypedDict, Optional, Annotated
from langgraph.graph.message import add_messages
from typing import Annotated
import os
from app.ai.qualification import generate_followup_email
from langchain_core.tools import tool
import httpx
from langgraph.graph import StateGraph, START, END
from langchain_openai import ChatOpenAI
from langgraph.prebuilt import ToolNode
from langchain_core.messages import SystemMessage, HumanMessage
from langgraph.checkpoint.memory import InMemorySaver
import json



# ============================================================
# 1. STATE
# ============================================================
class AssistantState(TypedDict):
    lead_id: int
    message: str
    lead_details: Optional[dict]
    lead_analysis: Optional[str]
    llm_response: Optional[object]
    pending_action: Optional[dict]
    messages: Annotated[list, add_messages]
    error: Optional[str]



@tool
def get_lead_details(lead_id: int) -> dict:
    """
    Get detailed information about a lead from the Al Qaim API.
    """

    url = f"http://localhost:8000/api/leads/{lead_id}"

    response = httpx.get(url, timeout=10.0)
    response.raise_for_status()

    return response.json()

@tool
def get_crm_contact(contact_id: int) -> dict:
    """
    Get contact information from the external Al Qaim CRM.
    """

    url = f"https://al-qaim-crm-production.up.railway.app/api/contacts/{contact_id}"

    response = httpx.get(
        url,
        timeout=10.0
    )

    response.raise_for_status()

    return response.json()

@tool
def search_crm_contact_by_email(email: str) -> dict:
    """
    Search for a contact in the external Al Qaim CRM by email address.
    """
    url = (
        "https://al-qaim-crm-production.up.railway.app"
        f"/api/contacts/by-email/{email}"
    )

    response = httpx.get(url, timeout=10.0)
    response.raise_for_status()

    return response.json()

@tool
def get_lead_crm_details(lead_id: int) -> dict:
    """
    Get a lead from Al Qaim and retrieve its corresponding CRM contact.
    """

    lead_url = f"http://localhost:8000/api/leads/{lead_id}"

    lead_response = httpx.get(
        lead_url,
        timeout=10.0
    )

    lead_response.raise_for_status()

    lead = lead_response.json()

    crm_contact_id = lead.get("crm_contact_id")

    if not crm_contact_id:
        return {
            "lead_id": lead_id,
            "crm_contact": None,
            "message": "This lead is not linked to an external CRM contact."
        }

    crm_url = (
        f"https://al-qaim-crm-production.up.railway.app"
        f"/api/contacts/{crm_contact_id}"
    )

    crm_response = httpx.get(
        crm_url,
        timeout=10.0
    )

    crm_response.raise_for_status()

    crm_contact = crm_response.json()

    return {
        "lead_id": lead_id,
        "crm_contact_id": crm_contact_id,
        "lead": lead,
        "crm_contact": crm_contact,
    }

@tool
def get_sales_context(lead_id: int) -> dict:
    """
    Get combined sales context for a lead, including the Al Qaim lead,
    its qualification, and the linked external CRM contact.
    """
    lead_url = f"http://localhost:8000/api/leads/{lead_id}"

    lead_response = httpx.get(lead_url, timeout=10.0)
    lead_response.raise_for_status()

    lead = lead_response.json()

    crm_contact_id = lead.get("crm_contact_id")

    if not crm_contact_id:
        return {
            "lead": lead,
            "crm_contact": None,
            "crm_status": "NOT_LINKED",
            "message": "This lead is not linked to an external CRM contact.",
        }

    crm_url = (
        "https://al-qaim-crm-production.up.railway.app"
        f"/api/contacts/{crm_contact_id}"
    )

    crm_response = httpx.get(crm_url, timeout=10.0)
    crm_response.raise_for_status()

    crm_contact = crm_response.json()

    inconsistencies = []

    if lead.get("email") != crm_contact.get("email"):
        inconsistencies.append({
            "field": "email",
            "lead_value": lead.get("email"),
            "crm_value": crm_contact.get("email"),
        })

    if lead.get("phone") != crm_contact.get("phone"):
        inconsistencies.append({
            "field": "phone",
            "lead_value": lead.get("phone"),
            "crm_value": crm_contact.get("phone"),
        })

    if lead.get("name") != crm_contact.get("name"):
        inconsistencies.append({
            "field": "name",
            "lead_value": lead.get("name"),
            "crm_value": crm_contact.get("name"),
        })

    return {
        "lead": lead,
        "crm_contact": crm_contact,
        "crm_status": "LINKED",
        "inconsistencies": inconsistencies,
    }

@tool
def trigger_n8n_workflow(lead_id: int, scheduled_at: str) -> dict:
    """
    Schedule a lead follow-up through the n8n workflow.
    """
    print(f"AI → n8n: lead_id={lead_id}, scheduled_at={scheduled_at}")
    url = "https://striking-inspiration-production-8d83.up.railway.app/webhook/al-qaim-agent"

    response = httpx.post(
        url,
        json={
            "lead_id": lead_id,
            "scheduled_at": scheduled_at,
        },
        timeout=10.0,
    )

    response.raise_for_status()
    return response.json()

@tool
def draft_followup(lead_id: int) -> dict:
    """
    Draft a follow-up email for a lead without sending it.
    """
    url = f"http://localhost:8000/api/leads/{lead_id}"

    response = httpx.get(url, timeout=10.0)
    response.raise_for_status()

    lead = response.json()
    qualification = lead["qualification"]
    email = generate_followup_email(
        name=lead["name"],
        company=lead["company"],
        business_problem=lead["business_problem"],
        summary=qualification["summary"],
        recommended_action=qualification["recommended_action"],
    )

    return {
        "lead_id": lead_id,
        "recipient_email": lead["email"],
        "subject": email["subject"],
        "body": email["body"],
    }

@tool
def get_property_details(property_id: int) -> dict:
    """
    Get detailed information about a property from the Al Qaim API.
    """

    url = f"http://localhost:8000/api/properties/{property_id}"

    response = httpx.get(url, timeout=10.0)
    response.raise_for_status()

    return response.json()


@tool
def search_properties(
    location: Annotated[
        str | None,
        "City or area where the property should be located, e.g. Lahore or Karachi."
    ] = None,

    property_type: Annotated[
        str | None,
        "Property type. Use one of: APARTMENT, VILLA, PLOT, COMMERCIAL, HOUSE, OTHER."
    ] = None,

    bedrooms: Annotated[
        int | None,
        "Minimum number of bedrooms required."
    ] = None,

    max_price: Annotated[
        float | None,
        "Maximum property price in the property's currency."
    ] = None,
) -> list:
    """
    Search available Al Qaim Estate properties using optional criteria.
    """
    url = "http://127.0.0.1:8000/api/properties/search"

    params = {}

    if location is not None:
        params["location"] = location

    if property_type is not None:
        params["property_type"] = property_type

    if bedrooms is not None:
        params["bedrooms"] = bedrooms

    if max_price is not None:
        params["max_price"] = max_price

    response = httpx.get(
        url,
        params=params,
        timeout=10.0
    )

    response.raise_for_status()

    return response.json()



llm = ChatOpenAI(
    model="gpt-5-mini",
    api_key=os.getenv("OPENAI_API_KEY_S"),
)

llm_with_tools = llm.bind_tools([
    get_lead_details,
    get_crm_contact,
    search_crm_contact_by_email,
    get_lead_crm_details,
    get_sales_context,
    trigger_n8n_workflow,
    draft_followup,
    get_property_details,
    search_properties
])

tool_node = ToolNode([
    get_lead_details,
    get_crm_contact,
    search_crm_contact_by_email,
    get_lead_crm_details,
    get_sales_context,
    trigger_n8n_workflow,
    draft_followup,
    get_property_details,
    search_properties
])
def capture_pending_action(state: AssistantState) -> AssistantState:
    last_message = state["messages"][-1]

    if last_message.name == "draft_followup":
        return {
            **state,
            "pending_action": {
                "type": "FOLLOWUP_DRAFT",
                **json.loads(last_message.content),
            },
        }

    return state

def add_user_message(state: AssistantState) -> AssistantState:
    if not state["messages"]:
        return {
            **state,
            "messages": [
                SystemMessage(
                    content=(
                        "You are the Al Qaim Estate Sales Assistant. "
                        "You help sales staff work with leads and properties. "
                        "When a user provides a scheduling time without explicitly giving a UTC "
                        "time, interpret the time in Pakistan Standard Time (UTC+05:00) unless "
                        "the user specifies another timezone. Convert the scheduled time to UTC "
                        "before calling the scheduling tool. "
                        "You can retrieve lead details and property details using "
                        "the available tools. "
                        "Only state information that is supported by the data "
                        "returned by those tools. "
                        "When a salesperson rejects a proposed action, acknowledge "
                        "the rejection and do not create a new draft or execute another "
                        "action unless the salesperson explicitly asks you to do so."
                    )
                ),
                HumanMessage(content=state["message"]),
            ],
        }

    return {
        **state,
        "messages": state["messages"] + [
            HumanMessage(content=state["message"])
        ],
    }

#llm_node function defination
def llm_node(state: AssistantState) -> AssistantState:
    messages = state["messages"]

    response = llm_with_tools.invoke(messages)

    

    return {
        **state,
        "llm_response": response,
        "messages": [response],
    }
    

def should_continue(state: AssistantState) -> str:

    last_message = state["messages"][-1]

    if last_message.tool_calls:
        return "tools"

    return "end"




# New M6 tool-calling graph
graph = StateGraph(AssistantState)
graph.add_node("add_user_message", add_user_message)
graph.add_node("llm", llm_node)
graph.add_node("tools", tool_node)
graph.add_node("capture_pending_action", capture_pending_action)

graph.add_edge(START, "add_user_message")
graph.add_edge("add_user_message", "llm") #the llm node function decides whether i need to call a tool to answer user question or not

#the following line should be read like this :
#"After the llm node finishes, run should_continue to decide where to go next. If it says tools, go to the "
#"tools node. If it says end, finish the graph."
graph.add_conditional_edges(
    "llm",
    should_continue,
    {
        "tools": "tools",
        "end": END,
    }
)
graph.add_edge("tools", "capture_pending_action")
graph.add_edge("capture_pending_action", "llm")

checkpointer = InMemorySaver()

assistant_graph = graph.compile(
    checkpointer=checkpointer
)