# GabiClub staging runbook

Goal: run an isolated staging copy of production for both frontend and backend/admin.

Public domains:
- `test.gabiclub.ru`
- `test.api.gabiclub.ru`

Requirements:
- Separate git checkout on the server, separate systemd units, separate ports, separate env files.
- Separate database cloned from production.
- Separate media directory cloned from production.
- `noindex` and `nofollow` enabled for both staging hosts.

Safe topology:
1. Keep production repo and services untouched.
2. Create a second checkout, for example:
   - `/srv/gabiclub/staging/backend`
   - `/srv/gabiclub/staging/frontend`
3. Create separate services, for example:
   - `gunicorn-gabiclub-staging`
   - `gabiclub-frontend-staging`
4. Reverse proxy:
   - `test.gabiclub.ru` -> frontend staging port
   - `test.api.gabiclub.ru` -> backend staging port

Backend staging env:
- `DJANGO_DEBUG=0`
- `GABI_DB_PATH=/srv/gabiclub/staging-data/db.sqlite3`
- `GABI_ALLOWED_HOSTS=test.api.gabiclub.ru`
- `GABI_CORS_ALLOWED_ORIGINS=https://test.gabiclub.ru`
- `GABI_CSRF_TRUSTED_ORIGINS=https://test.gabiclub.ru,https://test.api.gabiclub.ru`
- `GABI_ADMIN_SITE_URL=https://test.gabiclub.ru`
- `GABI_NO_INDEX=1`
- `GABI_MEDIA_ROOT=/srv/gabiclub/staging/media`
- `GABI_STATIC_ROOT=/srv/gabiclub/staging-data/static`

Frontend staging env:
- `NEXT_PUBLIC_API_URL=https://test.api.gabiclub.ru/api`
- `API_BASE_URL=http://127.0.0.1:8001/api`
- `NEXT_PUBLIC_MEDIA_ORIGIN=https://test.api.gabiclub.ru`
- `NEXT_PUBLIC_DISABLE_PROD_API_FALLBACK=1`
- `NEXT_PUBLIC_SITE_NOINDEX=1`

Data copy:
1. Clone production database into a new staging database.
2. Clone production media into the staging media directory.
3. Run backend migrations only against the staging database.

DNS note:
- Public staging cannot be completed until `test.gabiclub.ru` and `test.api.gabiclub.ru` resolve in DNS.
- If DNS is managed only in REG.RU and there is no wildcard record, new A or CNAME records must be added there or through another DNS provider/API.
