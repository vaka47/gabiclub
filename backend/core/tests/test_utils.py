from __future__ import annotations

import urllib.parse
from unittest import TestCase, mock

from backend.core.utils import send_telegram_message


class SendTelegramMessageTests(TestCase):
    def test_handles_cyrillic_text_when_ascii_only_urlencode(self) -> None:
        real_urlencode = urllib.parse.urlencode

        def ascii_only_urlencode(
            query,
            doseq: bool = False,
            safe: str = "",
            encoding: str | None = None,
            errors: str | None = None,
            quote_via=urllib.parse.quote_plus,
        ) -> str:
            def ensure_ascii(value) -> None:
                if isinstance(value, bytes):
                    return
                if isinstance(value, (list, tuple)):
                    for item in value:
                        ensure_ascii(item)
                    return
                if isinstance(value, str):
                    value.encode("ascii")
                else:
                    str(value).encode("ascii")

            iterable = query.items() if hasattr(query, "items") else query
            for key, value in iterable:
                ensure_ascii(key)
                if doseq and isinstance(value, (list, tuple)):
                    for item in value:
                        ensure_ascii(item)
                else:
                    ensure_ascii(value)
            return real_urlencode(query, doseq=doseq, safe=safe, encoding=encoding, errors=errors, quote_via=quote_via)

        mock_response = mock.MagicMock()
        mock_response.__enter__.return_value = mock_response
        mock_response.read.return_value = b"{}"

        with mock.patch("backend.core.utils.urllib.request.urlopen", return_value=mock_response) as mock_urlopen:
            with mock.patch("backend.core.utils.urllib.parse.urlencode", side_effect=ascii_only_urlencode):
                send_telegram_message("123:abc", "-100", "Имя: Тест")

        self.assertTrue(mock_urlopen.called)
