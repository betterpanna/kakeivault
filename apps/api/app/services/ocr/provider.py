"""
OCR Provider interface.

Architecture decision: the provider is swappable without changing any product code.
Phase 0 ships only a stub provider. Phase 2 adds the real provider(s).

Provider selection:
- Mobile: evaluate on-device for Phase 2
- Web/backend: selected via OCR_PROVIDER env var
- Japanese documents require a provider that genuinely supports Japanese (not invoice parsers)
- Receipt OCR and salary-slip extraction are separate pipelines
"""

from __future__ import annotations

import abc
import logging
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class TextBlock:
    text: str
    confidence: float
    bounding_box: dict | None = None  # provider-specific coords


@dataclass
class OcrProviderResult:
    """Raw output from the OCR provider. Immutable after creation."""

    provider_name: str
    raw_text: str
    text_blocks: list[TextBlock]
    overall_confidence: float
    provider_raw_response: dict  # full JSON for audit, NOT logged


class OcrProvider(abc.ABC):
    """
    Abstract OCR provider interface.

    Implementations must NOT store results or call external services in __init__.
    """

    @property
    @abc.abstractmethod
    def name(self) -> str:
        """Unique provider identifier, e.g. 'google_vision'."""
        ...

    @abc.abstractmethod
    async def process_image(self, image_bytes: bytes, mime_type: str) -> OcrProviderResult:
        """Run OCR on an image. Raises OcrProviderError on failure."""
        ...

    @abc.abstractmethod
    async def process_pdf(self, pdf_bytes: bytes) -> OcrProviderResult:
        """Run OCR on a PDF. Raises OcrProviderError on failure."""
        ...

    def get_raw_text(self, result: OcrProviderResult) -> str:
        return result.raw_text

    def get_text_blocks(self, result: OcrProviderResult) -> list[TextBlock]:
        return result.text_blocks

    def get_confidence(self, result: OcrProviderResult) -> float:
        return result.overall_confidence


class OcrProviderError(Exception):
    """Raised by OCR providers on unrecoverable errors."""


class StubOcrProvider(OcrProvider):
    """
    Development stub. Returns empty results.
    MUST NOT be used in production (enforced by config validation).
    """

    @property
    def name(self) -> str:
        return "stub"

    async def process_image(self, image_bytes: bytes, mime_type: str) -> OcrProviderResult:
        logger.warning("StubOcrProvider.process_image called — use a real provider in production")
        return OcrProviderResult(
            provider_name=self.name,
            raw_text="",
            text_blocks=[],
            overall_confidence=0.0,
            provider_raw_response={"stub": True},
        )

    async def process_pdf(self, pdf_bytes: bytes) -> OcrProviderResult:
        logger.warning("StubOcrProvider.process_pdf called — use a real provider in production")
        return OcrProviderResult(
            provider_name=self.name,
            raw_text="",
            text_blocks=[],
            overall_confidence=0.0,
            provider_raw_response={"stub": True},
        )


def get_ocr_provider(provider_name: str) -> OcrProvider:
    """Factory. Add real providers here in Phase 2."""
    if provider_name == "stub":
        return StubOcrProvider()
    raise ValueError(f"Unknown OCR provider: {provider_name!r}")
