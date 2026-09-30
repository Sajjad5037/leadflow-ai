import httpx


CRM_BASE_URL = "https://al-qaim-crm-production.up.railway.app"


async def get_crm_contacts():
    url = f"{CRM_BASE_URL}/api/contacts"

    async with httpx.AsyncClient() as client:
        response = await client.get(url)

    response.raise_for_status()

    return response.json()


async def create_crm_contact(contact_data: dict):
    url = f"{CRM_BASE_URL}/api/contacts"

    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=contact_data)

    response.raise_for_status()

    return response.json()