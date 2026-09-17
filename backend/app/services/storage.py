import json
import logging
import os
from datetime import timedelta
from urllib.parse import urlparse

from google.cloud import storage
from google.oauth2 import service_account


logger = logging.getLogger(__name__)

BUCKET_NAME = "al-qaim-estate"


def get_storage_client():
    """
    Create a Google Cloud Storage client.

    Railway:
        Uses the service-account JSON stored in the
        GCP_SERVICE_ACCOUNT_JSON environment variable.

    Local development:
        Falls back to Google's normal credential discovery,
        which can use GOOGLE_APPLICATION_CREDENTIALS.
    """

    logger.info("GCS: get_storage_client() called")

    credentials_json = os.getenv("GCP_SERVICE_ACCOUNT_JSON")
    logger.info(
        "GCS: GCP_SERVICE_ACCOUNT_JSON present=%s length=%d",
        credentials_json is not None,
        len(credentials_json) if credentials_json is not None else 0,
    )

    if credentials_json:
        logger.info("GCS: entering explicit service-account JSON branch")

        try:
            credentials_info = json.loads(credentials_json)
        except json.JSONDecodeError as exc:
            logger.error(
                "GCS: explicit service-account JSON branch failed: %s: invalid JSON",
                type(exc).__name__,
            )
            raise RuntimeError(
                "GCP_SERVICE_ACCOUNT_JSON must contain valid JSON."
            ) from None

        logger.info(
            "GCS: parsed credential JSON is dictionary=%s",
            isinstance(credentials_info, dict),
        )

        if not isinstance(credentials_info, dict):
            logger.error(
                "GCS: explicit service-account JSON branch failed: RuntimeError: "
                "parsed JSON is not an object"
            )
            raise RuntimeError(
                "GCP_SERVICE_ACCOUNT_JSON must contain a JSON object."
            )

        required_fields = ("project_id", "client_email", "private_key", "token_uri")
        missing_fields = [
            field for field in required_fields if not credentials_info.get(field)
        ]
        if missing_fields:
            logger.error(
                "GCS: missing required service-account fields: %s",
                ", ".join(missing_fields),
            )
            raise RuntimeError(
                "GCP_SERVICE_ACCOUNT_JSON is missing required fields: "
                + ", ".join(missing_fields)
            )

        logger.info("GCS: creating service-account credentials from JSON")
        try:
            credentials = service_account.Credentials.from_service_account_info(
                credentials_info
            )
        except (KeyError, TypeError, ValueError) as exc:
            logger.error(
                "GCS: explicit service-account JSON branch failed: %s: "
                "invalid service-account credentials",
                type(exc).__name__,
            )
            raise RuntimeError(
                "GCP_SERVICE_ACCOUNT_JSON contains invalid service-account credentials."
            ) from None

        logger.info("GCS: service-account credentials created successfully")
        logger.info("GCS: creating Storage client with explicit credentials")
        try:
            client = storage.Client(
                credentials=credentials,
                project=credentials_info["project_id"],
            )
        except Exception as exc:
            logger.error(
                "GCS: explicit service-account JSON branch failed: %s: "
                "Storage client creation failed",
                type(exc).__name__,
            )
            raise

        logger.info("GCS: Storage client created successfully")
        return client

    logger.info(
        "GCS: GCP_SERVICE_ACCOUNT_JSON not found; falling back to "
        "Application Default Credentials"
    )
    logger.info("GCS: creating Storage client using ADC")
    client = storage.Client()
    logger.info("GCS: Storage client created using ADC")
    return client


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

    logger.info("GCS: generate_signed_url() requesting storage client")
    client = get_storage_client()
    bucket = client.bucket(BUCKET_NAME)
    blob = bucket.blob(object_name)

    return blob.generate_signed_url(
        version="v4",
        expiration=timedelta(minutes=expiration_minutes),
        method="GET",
    )