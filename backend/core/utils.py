from __future__ import annotations

import html
import json
import logging
import urllib.request
import urllib.parse

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
    # Attempt 1: GET with UTF-8 percent-encoded query string
    try:
        qs = urllib.parse.urlencode(payload, encoding="utf-8", safe="")
        get_url = f"{url}?{qs}"
        with urllib.request.urlopen(get_url, timeout=timeout) as resp:  # nosec - calling known Telegram API
            resp.read()
            return
    except Exception:
        pass

    # Attempt 2: JSON body (UTF-8)
    try:
        data_json = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        req_json = urllib.request.Request(
            url, data=data_json, headers={"Content-Type": "application/json; charset=utf-8"}, method="POST"
        )
        with urllib.request.urlopen(req_json, timeout=timeout) as resp:  # nosec - calling known Telegram API
            resp.read()
            return
    except Exception:
        pass

    # Attempt 3: form-urlencoded body (UTF-8)
    try:
        form = urllib.parse.urlencode(payload, encoding="utf-8").encode("utf-8")
        req_form = urllib.request.Request(
            url, data=form, headers={"Content-Type": "application/x-www-form-urlencoded; charset=utf-8"}, method="POST"
        )
        with urllib.request.urlopen(req_form, timeout=timeout) as resp:  # nosec
            resp.read()
            return
    except Exception as exc_final:  # pragma: no cover - network
        logger.warning("Telegram notification failed: %s", exc_final)
