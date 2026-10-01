from typing import TypedDict, Optional, Annotated
from langgraph.graph.message import add_messages
from openai import OpenAI
import os
from langchain_core.tools import tool
import httpx
from langgraph.graph import StateGraph, START, END
from langchain_openai import ChatOpenAI
from langgraph.prebuilt import ToolNode

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY_S")
)
# ============================================================
# 1. STATE
# ============================================================
class AssistantState(TypedDict):
    lead_id: int
    message: str
    lead_details: Optional[dict]
    lead_analysis: Optional[str]
    llm_response: Optional[object]
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

llm = ChatOpenAI(
    model="gpt-5-mini",
    api_key=os.getenv("OPENAI_API_KEY_S"),
)

llm_with_tools = llm.bind_tools([get_lead_details])
tool_node = ToolNode([get_lead_details])


#llm_node function defination
def llm_node(state: AssistantState) -> AssistantState:
    messages = state["messages"]

    if not messages:
        from langchain_core.messages import HumanMessage
        messages = [HumanMessage(content=state["message"])]

    response = llm_with_tools.invoke(messages)

    return {
        **state,
        "llm_response": response,
        "messages": messages + [response],
    }

    

def should_continue(state: AssistantState) -> str:

    last_message = state["messages"][-1]

    if last_message.tool_calls:
        return "tools"

    return "end"

# ============================================================
# 2. NODE — GET LEAD DETAILS
# ============================================================

def get_lead_node(state: AssistantState) -> AssistantState:

    lead_id = state["lead_id"]

    try:
        lead_data = get_lead_details.invoke({
            "lead_id": lead_id
        })

        return {
            **state,
            "lead_details": lead_data,
            "error": None,
        }

    except Exception as e:
        return {
            **state,
            "lead_details": None,
            "error": str(e),
        }
def check_lead_result(state: AssistantState) -> str:

    if state["error"]:
        return "error"

    return "success"
# ============================================================
# 3. NODE — ANALYZE LEAD
# ============================================================

def analyze_lead_node(state: AssistantState) -> AssistantState:

    lead = state["lead_details"]

    if not lead:
        return {
            **state,
            "lead_analysis": None,
        }

    response = client.responses.create(
        model="gpt-5-mini",
        input=f"""
You are an AI sales assistant for Al Qaim Estate.

The salesperson has asked:

{state["message"]}

Use the following lead information to answer their question:

{lead}

Answer the salesperson's question clearly and concisely.

Do not invent information that is not present in the lead data.
"""
    )

    analysis = response.output_text

    return {
        **state,
        "lead_analysis": analysis,
    }

# ============================================================
# 4. CREATE THE GRAPH
# ============================================================

graph = StateGraph(AssistantState)


# Add both nodes to the graph
graph.add_node("get_lead", get_lead_node)
graph.add_node("analyze_lead", analyze_lead_node)


# ============================================================
# 5. CONNECT THE GRAPH
# ============================================================
graph = StateGraph(AssistantState)

# Old graph — temporarily disabled
# graph.add_node("get_lead", get_lead_node)
# graph.add_node("analyze_lead", analyze_lead_node)

# graph.add_edge(START, "get_lead")

# graph.add_conditional_edges(
#     "get_lead",
#     check_lead_result,
#     {
#         "success": "analyze_lead",
#         "error": END,
#     }
# )

# graph.add_edge("analyze_lead", END)


# New M6 tool-calling graph
graph.add_node("llm", llm_node)
graph.add_node("tools", tool_node)

graph.add_edge(START, "llm") #the llm node function decides whether i need to call a tool to answer user question or not

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
graph.add_edge("tools", "llm")

assistant_graph = graph.compile()