from django.conf import settings
from django.core.exceptions import DisallowedHost


class XRobotsTagMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        try:
            host = request.get_host() or ""
        except DisallowedHost:
            host = request.META.get("HTTP_HOST") or request.META.get("SERVER_NAME") or ""
        host = host.split(":", 1)[0].lower()
        should_noindex = settings.GABI_NO_INDEX or host.startswith("test.")
        if should_noindex:
            response["X-Robots-Tag"] = "noindex, nofollow, noarchive"

        return response
