
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException
from app.ai_sales_assistant import assistant_graph
from app.services.email import send_email


router = APIRouter(
    prefix="/api/ai-assistant",
    tags=["AI Assistant"],
)


class AIAssistantChatRequest(BaseModel):
    message: str
    thread_id: str

class AIAssistantApproveRequest(BaseModel):
    thread_id: str




class AIAssistantChatResponse(BaseModel):
    response: str
    action: dict | None = None


@router.post("/chat", response_model=AIAssistantChatResponse)
def chat_with_ai_assistant(
    request: AIAssistantChatRequest,
):
    result = assistant_graph.invoke(
        {
            "lead_id": 0,
            "message": request.message,
            "lead_details": None,
            "lead_analysis": None,
            "llm_response": None,
            "pending_action": None,
            "messages": [],
            "error": None,
        },
        config={
            "configurable": {
                "thread_id": request.thread_id
            }
        },
    )

    final_message = result["messages"][-1]

    return {
        "response": final_message.content,
        "action": result.get("pending_action"),
    }


@router.post("/approve")
def approve_ai_action(request: AIAssistantApproveRequest):
    config = {
        "configurable": {
            "thread_id": request.thread_id
        }
    }

    state = assistant_graph.get_state(config)

    pending_action = state.values.get("pending_action")

    if not pending_action:
        raise HTTPException(
            status_code=404,
            detail="No pending action found for this conversation."
        )

    if pending_action.get("type") != "FOLLOWUP_DRAFT":
        raise HTTPException(
            status_code=400,
            detail="Unsupported pending action type."
        )

    send_email(
        to_email=pending_action["recipient_email"],
        subject=pending_action["subject"],
        body=pending_action["body"],
    )
    assistant_graph.update_state(
        config,
        {"pending_action": None},
    )

    return {
        "message": "Follow-up email sent successfully.",
        "pending_action": pending_action,
    }