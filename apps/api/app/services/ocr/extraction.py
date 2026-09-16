"""
Structured extraction service.

Takes raw OCR output and produces typed, validated JSON.
Keeps receipt and salary-slip extraction as separate pipelines.

Never produces unvalidated free-form data — always returns typed results.
"""

from __future__ import annotations

import logging
import re
from datetime import UTC, datetime

from app.services.ocr.provider import OcrProviderResult

logger = logging.getLogger(__name__)
# Never log raw_text or provider_raw_response — privacy-sensitive


def extract_receipt(ocr_result: OcrProviderResult) -> dict:
    """
    Extract structured receipt data from OCR output.

    Returns a dict matching the ExtractedReceipt contract shape.
    All amounts are in minor units (JPY × 100).
    """
    text = ocr_result.raw_text

    total = _extract_jpy_amount(text, patterns=[
        r"合計[^\d]*([\d,]+)",
        r"TOTAL[^\d]*([\d,]+)",
        r"お買上げ合計[^\d]*([\d,]+)",
    ])
    subtotal = _extract_jpy_amount(text, patterns=[
        r"小計[^\d]*([\d,]+)",
        r"SUBTOTAL[^\d]*([\d,]+)",
    ])
    tax = _extract_jpy_amount(text, patterns=[
        r"消費税[^\d]*([\d,]+)",
        r"TAX[^\d]*([\d,]+)",
        r"税[^\d]*([\d,]+)",
    ])

    date_str = _extract_date(text)
    merchant = _extract_merchant(ocr_result)

    warnings: list[str] = []
    if subtotal is not None and tax is not None and total is not None:
        if abs((subtotal + tax) - total) > 100:  # > ¥1 tolerance
            warnings.append("receipt.validation.subtotalPlusTaxMismatch")
    if total is not None and total < 0:
        warnings.append("receipt.validation.negativeTotal")
    if date_str and not _is_reasonable_date(date_str):
        warnings.append("receipt.validation.unreasonableDate")

    confidence = {
        "overall": ocr_result.overall_confidence,
        "merchantName": 0.5 if merchant else None,
        "transactionDate": 0.7 if date_str else None,
        "total": 0.8 if total is not None else None,
        "subtotal": 0.7 if subtotal is not None else None,
        "tax": 0.7 if tax is not None else None,
    }

    return {
        "documentType": "receipt",
        "merchantName": merchant,
        "transactionDate": date_str,
        "currency": "JPY",
        "subtotalMinorUnits": subtotal,
        "taxMinorUnits": tax,
        "totalMinorUnits": total,
        "paymentMethod": None,
        "suggestedCategory": _suggest_category(merchant),
        "lineItems": [],
        "confidence": confidence,
        "rawText": None,  # NOT stored in extracted_data — stays in ocr_results only
        "validationWarnings": warnings,
    }


def _extract_jpy_amount(text: str, patterns: list[str]) -> int | None:
    for pattern in patterns:
        m = re.search(pattern, text, re.IGNORECASE)
        if m:
            raw = m.group(1).replace(",", "")
            try:
                yen = int(raw)
                return yen * 100  # convert to minor units
            except ValueError:
                continue
    return None


def _extract_date(text: str) -> str | None:
    patterns = [
        r"(\d{4})[年/\-](\d{1,2})[月/\-](\d{1,2})",
        r"(\d{2})[/\-](\d{2})[/\-](\d{4})",
        r"R(\d+)[年/](\d{1,2})[月/](\d{1,2})",  # Japanese Reiwa era
    ]
    for pattern in patterns:
        m = re.search(pattern, text)
        if m:
            groups = m.groups()
            if len(groups) == 3:
                year, month, day = groups
                # Handle Reiwa era (R3 = 2021)
                if int(year) < 100:
                    year = str(2018 + int(year))
                try:
                    return f"{year}-{int(month):02d}-{int(day):02d}"
                except ValueError:
                    continue
    return None


def _extract_merchant(ocr_result: OcrProviderResult) -> str | None:
    if not ocr_result.text_blocks:
        return None
    # Heuristic: first text block with confidence > 0.7 and len > 2
    for block in ocr_result.text_blocks[:5]:
        if block.confidence > 0.7 and len(block.text.strip()) > 2:
            return block.text.strip()[:200]
    return None


def _suggest_category(merchant: str | None) -> str | None:
    if merchant is None:
        return None
    lower = merchant.lower()
    if any(k in lower for k in ["スーパー", "コンビニ", "food", "supermarket", "mart"]):
        return "food"
    if any(k in lower for k in ["薬", "drug", "pharmacy"]):
        return "medical"
    if any(k in lower for k in ["電車", "jr", "バス", "taxi", "transport"]):
        return "transportation"
    return "other"


def _is_reasonable_date(date_str: str) -> bool:
    try:
        date = datetime.strptime(date_str, "%Y-%m-%d").replace(tzinfo=UTC)
        now = datetime.now(UTC)
        five_years_ago = now.replace(year=now.year - 5)
        tomorrow = now.replace(day=now.day + 1) if now.day < 28 else now
        return five_years_ago <= date <= tomorrow
    except ValueError:
        return False
