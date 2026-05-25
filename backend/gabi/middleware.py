from django.conf import settings


class XRobotsTagMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        host = (request.get_host() or "").split(":", 1)[0].lower()
        should_noindex = settings.GABI_NO_INDEX or host.startswith("test.")
        if should_noindex:
            response["X-Robots-Tag"] = "noindex, nofollow, noarchive"

        return response
