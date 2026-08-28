from __future__ import annotations

import json
import os

from openai import OpenAI


def get_lead_temperature(score: int) -> str:
    if score >= 80:
        return "HOT"
    if score >= 50:
        return "WARM"
    return "COLD"

def qualify_lead(
    *,
    name: str,
    company: str,
    email: str,
    phone: str,
    source: str,
    business_problem: str,
) -> dict:
    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key:
        raise RuntimeError("OPENAI_API_KEY environment variable is required.")

    client = OpenAI(api_key=api_key)

    prompt = f"""
You are an AI lead qualification assistant for HarbourStone Developments,
a residential property development company.

HarbourStone receives enquiries from prospective buyers interested in
new residential properties.

Analyze the following prospective property buyer using ONLY the
information provided.

Lead:
Name: {name}
Company: {company}
Email: {email}
Phone: {phone}
Source: {source}

Enquiry:
{business_problem}

Return ONLY valid JSON with exactly these fields:

{{
  "score": 0,
  "temperature": "COLD",
  "summary": "Concise description of the buyer opportunity.",
  "reasoning": "Concise explanation of why this score was given.",
  "recommended_action": "Suggested next sales action."
}}

Rules:
- score must be an integer from 0 to 100.
- temperature must be exactly one of: HOT, WARM, COLD.
- HOT = score 80-100.
- WARM = score 50-79.
- COLD = score 0-49.
- Do not invent information.
- Base the score only on the information provided.
- Consider signals such as stated purchase timeline, property
  requirements, level of buying intent, and specific enquiry details
  when those signals are explicitly provided.
- Do not assume a budget, financial position, property availability,
  or purchase timeline unless the lead provides it.
- Keep summary concise.
- Keep reasoning concise.
- Keep recommended_action concise.
"""
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        temperature=0,
        response_format={"type": "json_object"},
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a lead qualification system. "
                    "Return only valid JSON."
                ),
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
    )

    content = response.choices[0].message.content

    if not content:
        raise RuntimeError("OpenAI returned an empty qualification response.")

    try:
        result = json.loads(content)
    except json.JSONDecodeError as exc:
        raise RuntimeError("OpenAI returned invalid qualification JSON.") from exc

    score = result.get("score")
    temperature = result.get("temperature")
    summary = result.get("summary")
    reasoning = result.get("reasoning")
    recommended_action = result.get("recommended_action")

    if not isinstance(score, int) or not 0 <= score <= 100:
        raise ValueError("AI qualification score must be an integer from 0 to 100.")

    if temperature not in {"HOT", "WARM", "COLD"}:
        raise ValueError("AI qualification temperature must be HOT, WARM, or COLD.")

    if not isinstance(summary, str) or not summary.strip():
        raise ValueError("AI qualification summary is required.")

    if not isinstance(reasoning, str) or not reasoning.strip():
        raise ValueError("AI qualification reasoning is required.")

    if not isinstance(recommended_action, str) or not recommended_action.strip():
        raise ValueError("AI recommended action is required.")

    expected_temperature = get_lead_temperature(score)

    if temperature != expected_temperature:
        raise ValueError(
            "AI qualification temperature does not match the score."
        )

    return {
        "score": score,
        "temperature": temperature,
        "summary": summary.strip(),
        "reasoning": reasoning.strip(),
        "recommended_action": recommended_action.strip(),
    }
def generate_followup_email(
    *,
    name: str,
    company: str,
    business_problem: str,
    summary: str,
    recommended_action: str,
) -> dict:
    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key:
        raise RuntimeError("OPENAI_API_KEY environment variable is required.")

    client = OpenAI(api_key=api_key)

    prompt = f"""
You are an AI sales follow-up assistant for LeadFlow AI.

Write a concise, professional follow-up email for this lead using ONLY the information provided.

Lead:
Name: {name}
Company: {company}

Business Problem:
{business_problem}

AI Summary:
{summary}

Recommended Action:
{recommended_action}

Return ONLY valid JSON with exactly these fields:

{{
  "subject": "Concise email subject",
  "body": "Professional email body"
}}

Rules:
- Address the lead by name.
- Mention their business problem naturally.
- Keep the email concise.
- Make the email helpful and professional.
- Align the email with the recommended action.
- Do not invent facts, products, prices, meetings, commitments, or information.
- Do not mention that AI generated the email.
- Sign the email as "LeadFlow AI".
- Never use placeholders such as "[Your Name]", "[Name]", "[Company]", or similar.
- Do not include a sender name that was not provided.
- End the email with "Best regards," followed by "LeadFlow AI".
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        temperature=0.3,
        response_format={"type": "json_object"},
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a professional sales follow-up assistant. "
                    "Return only valid JSON."
                ),
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
    )

    content = response.choices[0].message.content

    if not content:
        raise RuntimeError("OpenAI returned an empty follow-up email response.")

    try:
        result = json.loads(content)
    except json.JSONDecodeError as exc:
        raise RuntimeError(
            "OpenAI returned invalid follow-up email JSON."
        ) from exc

    subject = result.get("subject")
    body = result.get("body")

    if not isinstance(subject, str) or not subject.strip():
        raise ValueError("AI follow-up email subject is required.")

    if not isinstance(body, str) or not body.strip():
        raise ValueError("AI follow-up email body is required.")

    return {
        "subject": subject.strip(),
        "body": body.strip(),
    }