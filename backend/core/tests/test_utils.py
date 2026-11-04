import io
import json
import os
import urllib.error
from unittest import TestCase, mock

from core.utils import send_telegram_message


@mock.patch.dict(os.environ, {"TELEGRAM_RELAY_URL": "", "TELEGRAM_RELAY_TOKEN": ""})
class SendTelegramMessageTests(TestCase):
    def response(self, payload):
        response = mock.MagicMock()
        response.__enter__.return_value = io.BytesIO(json.dumps(payload).encode())
        return response

    def test_cyrillic_is_posted_as_json_and_acknowledged(self):
        with mock.patch("core.utils.urllib.request.urlopen", return_value=self.response({"ok": True, "result": {"message_id": 123}})) as request:
            self.assertEqual(send_telegram_message("123:secret", "-100", "Имя: Тест & <текст>"), 123)
        req = request.call_args[0][0]
        self.assertEqual(req.method, "POST")
        self.assertNotIn("?", req.full_url)
        self.assertEqual(json.loads(req.data)["text"], "Имя: Тест & <текст>")

    def test_network_failure_is_reported_without_leaking_token(self):
        with mock.patch("core.utils.urllib.request.urlopen", side_effect=urllib.error.URLError("https://api.telegram.org/bot123:secret")) as request:
            with self.assertRaises(RuntimeError) as error:
                send_telegram_message("123:secret", "-100", "Тест")
        self.assertNotIn("secret", str(error.exception))
        self.assertEqual(request.call_count, 1)

    def test_http_failure_is_not_acknowledged(self):
        error = urllib.error.HTTPError("https://api.telegram.org/bot123:secret", 403, "Forbidden", {}, None)
        with mock.patch("core.utils.urllib.request.urlopen", side_effect=error):
            with self.assertRaisesRegex(RuntimeError, "HTTP 403"):
                send_telegram_message("123:secret", "-100", "Тест")

    def test_false_success_is_rejected(self):
        for payload in [{"ok": False}, {}, {"ok": True, "result": {}}]:
            with self.subTest(payload=payload), mock.patch("core.utils.urllib.request.urlopen", return_value=self.response(payload)):
                with self.assertRaises(RuntimeError):
                    send_telegram_message("123:secret", "-100", "Тест")

    @mock.patch.dict(os.environ, {"TELEGRAM_RELAY_URL": "https://relay.example/api", "TELEGRAM_RELAY_TOKEN": "relay-secret"})
    def test_private_relay_uses_bearer_and_token_in_body(self):
        with mock.patch("core.utils.urllib.request.urlopen", return_value=self.response({"ok": True, "result": {"message_id": 42}})) as request:
            send_telegram_message("123:secret", "-100", "Тест")
        req = request.call_args[0][0]
        self.assertEqual(req.full_url, "https://relay.example/api/sendMessage")
        self.assertEqual(req.get_header("Authorization"), "Bearer relay-secret")
        self.assertEqual(json.loads(req.data)["token"], "123:secret")
