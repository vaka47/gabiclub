from __future__ import annotations

import html
import json
import logging
import urllib.request

logger = logging.getLogger(__name__)


def tg_escape(text: str) -> str:
    return html.escape(text or "", quote=False)


def send_telegram_message(token: str, chat_id: str, text: str, parse_mode: str = "HTML", timeout: int = 4) -> None:
    """Send a message via Telegram Bot API.

    Silent failure on network errors; logs warning.
    """
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": parse_mode,
        # To avoid formatting surprises
        "disable_web_page_preview": True,
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"}, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:  # nosec - calling known Telegram API
            # Best-effort: read to ensure request completed
            resp.read()
    except Exception as exc:  # pragma: no cover - network
        logger.warning("Telegram notification failed: %s", exc)

