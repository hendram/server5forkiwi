from mitmproxy import http

def response(flow: http.HTTPFlow) -> None:
    # Check if the response is from the target domain
    if "kiwi.com" in flow.request.host:
        # Modify the headers
        flow.response.headers["Access-Control-Allow-Origin"] = "*"

