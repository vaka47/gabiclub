# Telegram delivery

The Django lead endpoint saves a lead and one delivery row per recipient before
calling Telegram. Failed deliveries remain pending and the systemd timer retries
them with backoff. Telegram must acknowledge a message before it is marked sent.
An ambiguous network timeout after Telegram accepts a message can still result
in a duplicate; each message includes the lead ID for identification.

REG.RU could not connect to Telegram on 2026-11-04. The Vercel project
`gabiclub-telegram-relay` in `vaka47s-projects` runs only `api/sendMessage.mjs`.
It requires a shared bearer secret and forwards JSON to the official Telegram
HTTPS API. Credentials and applicant details are not logged. Git-based deployment
is disconnected; deploy this directory explicitly with `vercel deploy --prod`.

The REG.RU host also cannot complete TLS to Vercel's DNS-selected addresses
`64.29.17.131` and `216.198.79.131`. Its `/etc/hosts` maps only
`gabiclub-telegram-relay.vercel.app` to Vercel's reachable `76.76.21.21` edge.
HTTPS still uses and verifies the real relay hostname. If reachability changes,
check this mapping as well as the retry queue.

Backend environment keys (keep values outside Git):

- `TELEGRAM_BOT_TOKEN`: existing Telegram bot token.
- `TELEGRAM_CHAT_IDS` or `TELEGRAM_CHAT_ID`: existing recipients.
- `TELEGRAM_RELAY_URL`: Vercel origin followed by `/api`.
- `TELEGRAM_RELAY_TOKEN`: shared random secret, also configured as a sensitive
  production environment variable in Vercel.

Install both systemd units from this directory into `/etc/systemd/system`, run
`systemctl daemon-reload`, then `systemctl enable --now gabiclub-telegram-retry.timer`.
Run migrations before restarting Gunicorn. Never reset the production checkout:
it contains existing local training changes. Use a fast-forward merge.

Checks:

```sh
python manage.py test core.tests
python manage.py retry_telegram_notifications
systemctl list-timers gabiclub-telegram-retry.timer
journalctl -u gabiclub-telegram-retry.service --since today
```

The earlier private Sites relay is not used because REG.RU receives a Cloudflare
access denial. It contains no bot token, applicant records, or configured secrets.
