from app.services.storage import upload_file


def test_upload_file():
    result = upload_file(
        file_data=b'Al Qaim Estate storage test',
        destination_path='test/storage-service-test.txt',
        content_type='text/plain',
    )

    assert result == 'gs://al-qaim-estate/test/storage-service-test.txt'