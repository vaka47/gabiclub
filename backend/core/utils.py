from __future__ import annotations

import html
import json
import os
import urllib.error
import urllib.parse
import urllib.request


def tg_escape(text: str) -> str:
    return html.escape(text or "", quote=False)


def send_telegram_message(token: str, chat_id: str, text: str, parse_mode: str = "HTML", timeout: int = 5) -> int:
    """Send once and require Telegram's acknowledgement; callers own retries.

    A private HTTPS relay supports hosts without a route to Telegram. Never put
    lead contents in query strings or include credentials in error messages.
    """
    relay_url = os.getenv("TELEGRAM_RELAY_URL", "").strip()
    relay_token = os.getenv("TELEGRAM_RELAY_TOKEN", "").strip()
    token = token.strip()
    token_path = urllib.parse.quote(token, safe=":")
    url = f"https://api.telegram.org/bot{token_path}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": parse_mode,
        # To avoid formatting surprises
        "disable_web_page_preview": True,
    }
    headers = {"Content-Type": "application/json; charset=utf-8"}
    if relay_url:
        parsed = urllib.parse.urlsplit(relay_url)
        if parsed.scheme != "https" or not parsed.netloc or parsed.username or parsed.password or not relay_token:
            raise RuntimeError("Telegram relay configuration is invalid")
        url = relay_url.rstrip("/") + "/sendMessage"
        headers["Authorization"] = f"Bearer {relay_token}"
        payload["token"] = token
    req = urllib.request.Request(
        url, data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        headers=headers, method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:  # nosec - configured private relay or Telegram
            result = json.load(resp)
    except urllib.error.HTTPError as exc:
        raise RuntimeError(f"Telegram delivery HTTP {exc.code}") from None
    except Exception as exc:
        raise RuntimeError(f"Telegram delivery connection failed ({type(exc).__name__})") from None
    if result.get("ok") is not True or not isinstance(result.get("result", {}).get("message_id"), int):
        raise RuntimeError("Telegram did not acknowledge delivery")
    return result["result"]["message_id"]
