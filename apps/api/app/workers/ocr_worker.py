"""
ARQ background worker for OCR processing.

Design:
- Jobs are idempotent (safe to retry)
- Status transitions are logged at job level, not content level
- Worker never logs salary amounts or OCR text content
- Temporary OCR files are cleaned up after retention period
"""

from __future__ import annotations

import logging
import uuid
from typing import Any

from sqlalchemy import select

from app.core.config import get_settings
from app.db.session import async_session_factory
from app.models.ocr import OcrJob, OcrResult
from app.services.ocr.extraction import extract_receipt
from app.services.ocr.provider import OcrProviderError, get_ocr_provider
from app.services.storage_service import StorageService

logger = logging.getLogger(__name__)
settings = get_settings()


async def process_ocr_job(ctx: dict[str, Any], job_id: str) -> None:
    """
    ARQ task: download image, run OCR, extract structured data, update job status.
    Never logs document content.
    """
    logger.info("OCR worker starting job: %s", job_id)
    storage = StorageService()
    provider = get_ocr_provider(settings.ocr_provider)

    async with async_session_factory() as db:
        result = await db.execute(
            select(OcrJob).where(OcrJob.id == uuid.UUID(job_id))
        )
        job = result.scalar_one_or_none()
        if job is None:
            logger.error("OCR job not found: %s", job_id)
            return

        if job.status in ("confirmed", "deleted"):
            logger.warning("Skipping already-terminal OCR job: %s", job_id)
            return

        try:
            # Mark as processing
            job.status = "processing"
            await db.commit()

            # Download file from private storage
            s3 = storage._s3
            response = s3.get_object(Bucket=storage._bucket, Key=job.storage_key)
            file_bytes = response["Body"].read()

            # Run OCR
            if job.mime_type == "application/pdf":
                ocr_result = await provider.process_pdf(file_bytes)
            else:
                ocr_result = await provider.process_image(file_bytes, job.mime_type)

            # Extract structured data
            if job.document_type == "receipt":
                extracted = extract_receipt(ocr_result)
            else:
                # Salary slip extraction — Phase 3
                extracted = {"documentType": "salary_slip", "rawText": None}

            # Store immutable raw result (raw_text NOT in extracted_data)
            ocr_db_result = OcrResult(
                job_id=job.id,
                provider=provider.name,
                raw_text=ocr_result.raw_text,  # stored here, NOT in job
                confidence_overall=ocr_result.overall_confidence,
                provider_response=ocr_result.provider_raw_response,
            )
            db.add(ocr_db_result)

            # Store extracted data in job (without raw text)
            job.extracted_data = extracted
            job.status = "review_required"

            await db.commit()
            logger.info("OCR job completed: %s status=review_required", job_id)

        except OcrProviderError as e:
            logger.error("OCR provider error for job %s: %s", job_id, type(e).__name__)
            job.status = "failed"
            job.error_message = str(e)[:500]
            await db.commit()

        except Exception:
            logger.exception("Unexpected error in OCR worker for job %s", job_id)
            job.status = "failed"
            job.error_message = "Unexpected processing error"
            await db.commit()


class WorkerSettings:
    """ARQ worker configuration."""

    functions = [process_ocr_job]
    redis_settings = None  # Set dynamically from settings in startup


def get_worker_settings() -> type:
    import arq.connections

    class _WorkerSettings:
        functions = [process_ocr_job]
        redis_settings = arq.connections.RedisSettings.from_dsn(settings.redis_url)
        max_jobs = 5
        job_timeout = 300  # 5 minutes max per OCR job

    return _WorkerSettings
