import http.server
import ssl
import socketserver

# Define the handler to serve the current directory (with index.html)
Handler = http.server.SimpleHTTPRequestHandler

# Create an HTTP server instance
httpd = socketserver.TCPServer(('0.0.0.0', 443), Handler)

# Wrap the socket with SSL for HTTPS
httpd.socket = ssl.wrap_socket(httpd.socket,
                               keyfile="server.key",
                               certfile="server.crt",
                               server_side=True)

print("Serving on port 443 with HTTPS...")
httpd.serve_forever()
