#!/usr/bin/env python3
"""
Simple development server for Floor Composer web viewer.
Serves static files with proper CORS headers for JSON loading.
"""

import http.server
import socketserver
import os
import sys
import webbrowser
from pathlib import Path


class CORSHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """HTTP handler with CORS headers for development."""
    
    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        
        # Cache control for JSON files
        if self.path.endswith('.json'):
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
        
        super().end_headers()
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests."""
        self.send_response(200)
        self.end_headers()
    
    def log_message(self, format, *args):
        """Custom log format."""
        timestamp = self.log_date_time_string()
        print(f"[{timestamp}] {format % args}")


def serve(port=8000, directory=None, open_browser=True):
    """Start the development server."""
    
    # Set working directory
    if directory:
        os.chdir(directory)
        print(f"📁 Serving from: {os.getcwd()}")
    else:
        web_dir = Path(__file__).parent
        if web_dir.exists():
            os.chdir(web_dir)
            print(f"📁 Serving from: {web_dir.absolute()}")
    
    # Check if index.html exists
    if not os.path.exists('index.html'):
        print("❌ index.html not found in current directory")
        print("   Make sure you're running from the web/ directory")
        sys.exit(1)
    
    # Start server
    try:
        with socketserver.TCPServer(("", port), CORSHTTPRequestHandler) as httpd:
            server_url = f"http://localhost:{port}"
            
            print("\n" + "="*50)
            print("🚀 Floor Composer Development Server")
            print("="*50)
            print(f"🌐 Server running at: {server_url}")
            print(f"📂 Directory: {os.getcwd()}")
            print("\n📋 Available endpoints:")
            print(f"   • Main viewer: {server_url}/")
            print(f"   • Data files:  {server_url}/data/")
            print("\n⌨️  Press Ctrl+C to stop the server")
            print("="*50)
            
            # Open browser
            if open_browser:
                print(f"🌐 Opening browser...")
                webbrowser.open(server_url)
            
            # Serve forever
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n\n👋 Server stopped by user")
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ Port {port} is already in use")
            print(f"   Try a different port: python serve.py --port {port + 1}")
        else:
            print(f"❌ Server error: {e}")
        sys.exit(1)


def main():
    """Command line interface."""
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Floor Composer Development Server',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python serve.py                    # Start on port 8000
  python serve.py --port 3000        # Start on port 3000
  python serve.py --no-browser       # Don't open browser
  python serve.py --dir ../web       # Serve from different directory
        """
    )
    
    parser.add_argument(
        '--port', '-p',
        type=int,
        default=8000,
        help='Port to serve on (default: 8000)'
    )
    
    parser.add_argument(
        '--dir', '-d',
        type=str,
        help='Directory to serve from (default: current/web directory)'
    )
    
    parser.add_argument(
        '--no-browser',
        action='store_true',
        help="Don't automatically open browser"
    )
    
    args = parser.parse_args()
    
    serve(
        port=args.port,
        directory=args.dir,
        open_browser=not args.no_browser
    )


if __name__ == '__main__':
    main()