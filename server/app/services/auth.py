"""
Authentication & Role-Based Access Control (RBAC) Service.
Issues and validates tamper-proof HMAC-SHA256 JWT tokens for hospital staff.
Zero binary dependencies — uses Python standard library hmac, hashlib, and base64.
"""

import base64
import hashlib
import hmac
import json
import os
import time
from typing import Any, Dict, Optional
from fastapi import Header, HTTPException, status

JWT_SECRET = os.getenv("JWT_SECRET", "ayush-aiia-emr-auth-production-key-2026-dpdp")
TOKEN_EXPIRY_SECONDS = int(os.getenv("JWT_EXPIRY_SECONDS", "28800"))  # 8 hours shift

# Verified Doctor Accounts (Hashed PINs using SHA-256 with static hospital salt)
SALT = "aiia_opd_salt_"
PHYSICIAN_REGISTRY: Dict[str, Dict[str, Any]] = {
    "DOC-AIIA-104": {
        "doctor_id": "DOC-AIIA-104",
        "doctor_name": "डॉ. अनन्या शर्मा (Dr. Ananya Sharma)",
        "department": "कायचिकित्सा विभाग (Internal Medicine)",
        "room_number": "Room #104 (Block A)",
        "role": "physician",
        # SHA-256 of "aiia_opd_salt_1234"
        "pin_hash": hashlib.sha256((SALT + "1234").encode("utf-8")).hexdigest(),
    },
    "DOC-AIIA-205": {
        "doctor_id": "DOC-AIIA-205",
        "doctor_name": "डॉ. राजेश वर्मा (Dr. Rajesh Verma)",
        "department": "सामान्य चिकित्सा विभाग (General Medicine)",
        "room_number": "Room #205 (Block B)",
        "role": "physician",
        # SHA-256 of "aiia_opd_salt_1234"
        "pin_hash": hashlib.sha256((SALT + "1234").encode("utf-8")).hexdigest(),
    },
}


def _base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("utf-8").rstrip("=")


def _base64url_decode(data: str) -> bytes:
    padding = "=" * (4 - (len(data) % 4)) if (len(data) % 4) != 0 else ""
    return base64.urlsafe_b64decode(data + padding)


def create_access_token(payload: Dict[str, Any], expires_in: int = TOKEN_EXPIRY_SECONDS) -> str:
    """Generates an HMAC-SHA256 signed JSON Web Token."""
    header = {"alg": "HS256", "typ": "JWT"}
    claims = payload.copy()
    claims["exp"] = int(time.time()) + expires_in
    claims["iat"] = int(time.time())

    header_bytes = json.dumps(header, separators=(",", ":")).encode("utf-8")
    claims_bytes = json.dumps(claims, separators=(",", ":")).encode("utf-8")

    unsigned_token = f"{_base64url_encode(header_bytes)}.{_base64url_encode(claims_bytes)}"
    signature = hmac.new(
        JWT_SECRET.encode("utf-8"),
        unsigned_token.encode("utf-8"),
        hashlib.sha256,
    ).digest()

    return f"{unsigned_token}.{_base64url_encode(signature)}"


def verify_token(token: str) -> Dict[str, Any]:
    """Validates signature and expiration of JWT token."""
    parts = token.strip().split(".")
    if len(parts) != 3:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token format.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    unsigned_token = f"{parts[0]}.{parts[1]}"
    expected_sig = hmac.new(
        JWT_SECRET.encode("utf-8"),
        unsigned_token.encode("utf-8"),
        hashlib.sha256,
    ).digest()

    provided_sig = _base64url_decode(parts[2])

    if not hmac.compare_digest(expected_sig, provided_sig):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token signature. Access denied.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    claims = json.loads(_base64url_decode(parts[1]).decode("utf-8"))

    if claims.get("exp", 0) < time.time():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token has expired. Please re-login.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return claims


def authenticate_physician(doctor_id: str, pin: str) -> Optional[Dict[str, Any]]:
    """Verifies doctor PIN against hashed registry."""
    doctor = PHYSICIAN_REGISTRY.get(doctor_id)
    if not doctor:
        return None

    calculated_hash = hashlib.sha256((SALT + pin).encode("utf-8")).hexdigest()
    if hmac.compare_digest(doctor["pin_hash"], calculated_hash):
        return doctor
    return None


async def require_physician_auth(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """
    FastAPI dependency: protects EMR workstation routes.
    Guarantees caller holds valid, non-expired physician token.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Physician authentication required. Provide Bearer token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = authorization.replace("Bearer ", "").strip()
    claims = verify_token(token)

    if claims.get("role") != "physician":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted: user lacks physician role privileges.",
        )

    return claims
