import http.server
import socketserver
import subprocess

class WebhookHandler(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        print("\n🚨 Alert Received from Alertmanager! Triggering Self-Healing...")
        # تنفيذ أمر تشغيل الكونتينر مباشرة
        subprocess.Popen(["docker", "restart", "self-healing-app"])
        
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"Healing action triggered successfully")
        print("✅ Container 'self-healing-app' has been started.\n")

# تشغيل السيرفر على بورت 5000
with socketserver.TCPServer(("0.0.0.0", 5000), WebhookHandler) as httpd:
    print("🎧 Webhook Receiver is listening on port 5000...")
    httpd.serve_forever()
