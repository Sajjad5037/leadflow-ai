from __future__ import annotations

import os

import resend


def send_email(
    *,
    to_email: str,
    subject: str,
    body: str,
) -> None:
    api_key = os.getenv('RESEND_API_KEY')

    if not api_key:
        raise RuntimeError('RESEND_API_KEY environment variable is required.')

    resend.api_key = api_key

    resend.Emails.send({
        'from': 'onboarding@resend.dev',
        'to': [to_email],
        'subject': subject,
        'text': body,
    })