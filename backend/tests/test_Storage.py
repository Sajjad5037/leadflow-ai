
from unittest.mock import Mock, patch

from app.services.storage import upload_file


def test_upload_file():
    mock_client = Mock()
    mock_bucket = Mock()
    mock_blob = Mock()

    mock_client.bucket.return_value = mock_bucket
    mock_bucket.blob.return_value = mock_blob

    with patch(
        "app.services.storage.get_storage_client",
        return_value=mock_client,
    ):
        result = upload_file(
            file_data=b"Al Qaim Estate storage test",
            destination_path="test/storage-service-test.txt",
            content_type="text/plain",
        )

    mock_client.bucket.assert_called_once_with("al-qaim-estate")
    mock_bucket.blob.assert_called_once_with(
        "test/storage-service-test.txt"
    )
    mock_blob.upload_from_string.assert_called_once_with(
        b"Al Qaim Estate storage test",
        content_type="text/plain",
    )

    assert result == (
        "gs://al-qaim-estate/test/storage-service-test.txt"
    )
