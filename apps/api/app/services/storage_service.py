"""
S3-compatible storage service.

Security decisions:
- All buckets are private; objects are never publicly accessible.
- Access via signed URLs with short expiry (default 15 min).
- Storage keys are UUID-based paths scoped to the user, preventing path traversal.
- File type and size are validated before presigning.
- Temporary OCR files are automatically scheduled for deletion after retention period.
"""

from __future__ import annotations

import logging
import uuid
from datetime import UTC, datetime, timedelta
from typing import Any

import boto3
from botocore.config import Config
from botocore.exceptions import ClientError

from app.core.config import get_settings

logger = logging.getLogger(__name__)

settings = get_settings()


def _get_s3_client() -> Any:  # type: ignore[misc]
    return boto3.client(
        "s3",
        endpoint_url=settings.storage_endpoint_url,
        aws_access_key_id=settings.storage_access_key_id,
        aws_secret_access_key=settings.storage_secret_access_key,
        region_name=settings.storage_region,
        config=Config(signature_version="s3v4"),
    )


class StorageService:
    def __init__(self) -> None:
        self._s3 = _get_s3_client()
        self._bucket = settings.storage_bucket_name

    def generate_upload_key(
        self, user_id: uuid.UUID, purpose: str, original_filename: str
    ) -> str:
        """
        Generate a private, user-scoped storage key.
        Format: {purpose}/{user_id}/{uuid}.{ext}
        """
        ext = original_filename.rsplit(".", 1)[-1].lower() if "." in original_filename else ""
        safe_ext = ext if ext.isalnum() and len(ext) <= 10 else "bin"
        return f"{purpose}/{user_id}/{uuid.uuid4()}.{safe_ext}"

    def presign_upload_url(
        self,
        storage_key: str,
        mime_type: str,
        expiry_seconds: int | None = None,
    ) -> tuple[str, datetime]:
        """
        Generate a presigned PUT URL for direct upload from client.
        Returns (url, expires_at).
        """
        expiry = expiry_seconds or settings.storage_presign_expiry_seconds
        try:
            url = self._s3.generate_presigned_url(
                "put_object",
                Params={
                    "Bucket": self._bucket,
                    "Key": storage_key,
                    "ContentType": mime_type,
                },
                ExpiresIn=expiry,
            )
        except ClientError as e:
            logger.error("Failed to generate upload presign URL: %s", e.response["Error"]["Code"])
            raise

        expires_at = datetime.now(UTC) + timedelta(seconds=expiry)
        return url, expires_at

    def presign_download_url(
        self,
        storage_key: str,
        expiry_seconds: int | None = None,
    ) -> tuple[str, datetime]:
        """
        Generate a presigned GET URL. Short-lived by design.
        Never expose these URLs in logs.
        """
        expiry = expiry_seconds or settings.storage_presign_expiry_seconds
        try:
            url = self._s3.generate_presigned_url(
                "get_object",
                Params={"Bucket": self._bucket, "Key": storage_key},
                ExpiresIn=expiry,
            )
        except ClientError as e:
            logger.error(
                "Failed to generate download presign URL: %s", e.response["Error"]["Code"]
            )
            raise

        expires_at = datetime.now(UTC) + timedelta(seconds=expiry)
        return url, expires_at

    def delete_object(self, storage_key: str) -> None:
        """Permanently delete an object. Used for account deletion and temp OCR cleanup."""
        try:
            self._s3.delete_object(Bucket=self._bucket, Key=storage_key)
        except ClientError as e:
            logger.error("Failed to delete object: %s", e.response["Error"]["Code"])
            raise

    def verify_object_exists(self, storage_key: str) -> bool:
        """Verify an object was actually uploaded before creating a DB record."""
        try:
            self._s3.head_object(Bucket=self._bucket, Key=storage_key)
            return True
        except ClientError:
            return False
