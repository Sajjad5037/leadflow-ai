from datetime import timedelta
from urllib.parse import urlparse

from google.cloud import storage

BUCKET_NAME = 'al-qaim-estate'


def upload_file(
    file_data: bytes,
    destination_path: str,
    content_type: str,
) -> str:
    client = storage.Client()
    bucket = client.bucket(BUCKET_NAME)
    blob = bucket.blob(destination_path)

    blob.upload_from_string(
        file_data,
        content_type=content_type,
    )

    return f'gs://{BUCKET_NAME}/{destination_path}'


def delete_file(gcs_url: str) -> None:
    parsed = urlparse(gcs_url)

    if parsed.scheme != 'gs' or parsed.netloc != BUCKET_NAME:
        raise ValueError('Invalid Google Cloud Storage URL.')

    object_name = parsed.path.lstrip('/')

    client = storage.Client()
    bucket = client.bucket(BUCKET_NAME)
    blob = bucket.blob(object_name)

    blob.delete()


def generate_signed_url(gcs_url: str, expiration_minutes: int = 60) -> str:
    parsed = urlparse(gcs_url)

    if parsed.scheme != 'gs' or parsed.netloc != BUCKET_NAME:
        raise ValueError('Invalid Google Cloud Storage URL.')

    object_name = parsed.path.lstrip('/')

    client = storage.Client()
    bucket = client.bucket(BUCKET_NAME)
    blob = bucket.blob(object_name)

    return blob.generate_signed_url(
        version='v4',
        expiration=timedelta(minutes=expiration_minutes),
        method='GET',
    )