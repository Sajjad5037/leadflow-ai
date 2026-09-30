from fastapi import APIRouter
from pydantic import BaseModel

from app.services.crm_service import create_crm_contact, get_crm_contacts


class CRMContactCreate(BaseModel):
    name: str
    email: str
    phone: str
    source: str


router = APIRouter(
    prefix="/api/crm",
    tags=["CRM"],
)


@router.get("/contacts")
async def get_contacts_from_crm():
    return await get_crm_contacts()


@router.post("/contacts")
async def create_contact_in_crm(contact_data: CRMContactCreate):
    return await create_crm_contact(contact_data.model_dump())