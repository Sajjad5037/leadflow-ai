import json
import os
from datetime import timedelta
from urllib.parse import urlparse

from google.cloud import storage
from google.oauth2 import service_account


BUCKET_NAME = "al-qaim-estate"


def get_storage_client():
    """
    Create a Google Cloud Storage client.

    Railway:
        Uses the service-account JSON stored in the
        google_credentials environment variable.

    Local development:
        Falls back to Google's normal credential discovery,
        which can use GOOGLE_APPLICATION_CREDENTIALS.
    """

    credentials_json = os.getenv("google_credentials")

    if credentials_json:
        credentials_info = json.loads(credentials_json)

        credentials = service_account.Credentials.from_service_account_info(
            credentials_info
        )

        return storage.Client(
            credentials=credentials,
            project=credentials_info["project_id"],
        )

    return storage.Client()


def upload_file(
    file_data: bytes,
    destination_path: str,
    content_type: str,
) -> str:
    client = get_storage_client()
    bucket = client.bucket(BUCKET_NAME)
    blob = bucket.blob(destination_path)

    blob.upload_from_string(
        file_data,
        content_type=content_type,
    )

    return f"gs://{BUCKET_NAME}/{destination_path}"


def delete_file(gcs_url: str) -> None:
    parsed = urlparse(gcs_url)

    if parsed.scheme != "gs" or parsed.netloc != BUCKET_NAME:
        raise ValueError("Invalid Google Cloud Storage URL.")

    object_name = parsed.path.lstrip("/")

    client = get_storage_client()
    bucket = client.bucket(BUCKET_NAME)
    blob = bucket.blob(object_name)

    blob.delete()


def generate_signed_url(
    gcs_url: str,
    expiration_minutes: int = 60,
) -> str:
    parsed = urlparse(gcs_url)

    if parsed.scheme != "gs" or parsed.netloc != BUCKET_NAME:
        raise ValueError("Invalid Google Cloud Storage URL.")

    object_name = parsed.path.lstrip("/")

    client = get_storage_client()
    bucket = client.bucket(BUCKET_NAME)
    blob = bucket.blob(object_name)

    return blob.generate_signed_url(
        version="v4",
        expiration=timedelta(minutes=expiration_minutes),
        method="GET",
    )