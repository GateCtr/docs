import http.server
import socketserver
import os
import re
import urllib.parse
import markdown
from markdown.extensions.fenced_code import FencedCodeExtension
from markdown.extensions.codehilite import CodeHiliteExtension
from markdown.extensions.toc import TocExtension

PORT = 5000
HOST = "0.0.0.0"

NAV = [
    ("Introduction", "README.md"),
    ("Quickstart", "getting-started/quickstart.md"),
    ("Authentication", "getting-started/authentication.md"),
    ("Your first request", "getting-started/first-request.md"),
    ("Node.js SDK", "sdks/node.md"),
    ("Python SDK", "sdks/python.md"),
    ("Budget Firewall", "features/budget-firewall.md"),
    ("Context Optimizer", "features/context-optimizer.md"),
    ("Model Router", "features/model-router.md"),
    ("Analytics", "features/analytics.md"),
    ("Webhooks", "features/webhooks.md"),
    ("POST /v1/complete", "api-reference/complete.md"),
    ("POST /v1/chat", "api-reference/chat.md"),
    ("GET /v1/usage", "api-reference/usage.md"),
]

NAV_SECTIONS = [
    ("Getting Started", ["README.md", "getting-started/quickstart.md", "getting-started/authentication.md", "getting-started/first-request.md"]),
    ("SDKs", ["sdks/node.md", "sdks/python.md"]),
    ("Features", ["features/budget-firewall.md", "features/context-optimizer.md", "features/model-router.md", "features/analytics.md", "features/webhooks.md"]),
    ("API Reference", ["api-reference/complete.md", "api-reference/chat.md", "api-reference/usage.md"]),
]

NAV_LABELS = {item[1]: item[0] for item in NAV}


def preprocess_markdown(text):
    text = re.sub(r'\{%\s*tabs\s*%\}', '<div class="tabs-wrapper"><div class="tabs">', text)
    text = re.sub(r'\{%\s*endtabs\s*%\}', '</div></div>', text)
    tab_counter = [0]

    def replace_tab(m):
        title = m.group(1)
        tab_id = f"tab-{tab_counter[0]}"
        tab_counter[0] += 1
        return f'<input type="radio" name="tabs-group-{tab_counter[0]//10}" id="{tab_id}" class="tab-radio"><label for="{tab_id}" class="tab-label">{title}</label><div class="tab-content">\n'

    text = re.sub(r'\{%\s*tab\s+title="([^"]+)"\s*%\}', replace_tab, text)
    text = re.sub(r'\{%\s*endtab\s*%\}', '</div>', text)
    return text


def render_page(file_path, active_path):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            raw = f.read()
    except FileNotFoundError:
        raw = "# Not Found\n\nThis page does not exist."

    processed = preprocess_markdown(raw)

    md = markdown.Markdown(extensions=[
        FencedCodeExtension(),
        CodeHiliteExtension(css_class="highlight", guess_lang=False),
        TocExtension(title=""),
        "tables",
        "nl2br",
    ])
    content_html = md.convert(processed)

    nav_html = ""
    for section, paths in NAV_SECTIONS:
        nav_html += f'<div class="nav-section">{section}</div>\n'
        for p in paths:
            label = NAV_LABELS.get(p, p)
            active_class = ' class="active"' if p == active_path else ""
            nav_html += f'<a href="/?page={urllib.parse.quote(p)}"{active_class}>{label}</a>\n'

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>GateCtr Docs</title>
<style>
  *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, sans-serif; background: #0d0d0d; color: #e8e8e8; display: flex; min-height: 100vh; }}
  a {{ color: #a78bfa; text-decoration: none; }}
  a:hover {{ text-decoration: underline; }}

  .sidebar {{
    width: 260px; min-width: 260px; background: #111; border-right: 1px solid #222;
    padding: 24px 0; position: sticky; top: 0; height: 100vh; overflow-y: auto;
  }}
  .logo {{
    display: flex; align-items: center; gap: 10px;
    padding: 0 20px 24px; border-bottom: 1px solid #222; margin-bottom: 16px;
  }}
  .logo-icon {{
    width: 32px; height: 32px; background: linear-gradient(135deg, #7c3aed, #a78bfa);
    border-radius: 8px; display: flex; align-items: center; justify-content: center;
    font-size: 16px; font-weight: bold; color: white;
  }}
  .logo-text {{ font-size: 16px; font-weight: 600; color: #fff; }}
  .nav-section {{
    font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;
    color: #555; padding: 12px 20px 6px;
  }}
  .sidebar a {{
    display: block; padding: 7px 20px; font-size: 14px; color: #aaa;
    border-radius: 0; transition: background 0.15s, color 0.15s;
  }}
  .sidebar a:hover {{ background: #1a1a1a; color: #e8e8e8; text-decoration: none; }}
  .sidebar a.active {{ background: #1e1433; color: #a78bfa; font-weight: 500; border-right: 2px solid #7c3aed; }}

  .main {{ flex: 1; padding: 48px 64px; max-width: 860px; }}

  h1 {{ font-size: 2rem; font-weight: 700; color: #fff; margin-bottom: 16px; line-height: 1.2; }}
  h2 {{ font-size: 1.4rem; font-weight: 600; color: #e0e0e0; margin: 36px 0 12px; border-bottom: 1px solid #222; padding-bottom: 8px; }}
  h3 {{ font-size: 1.1rem; font-weight: 600; color: #d0d0d0; margin: 24px 0 8px; }}
  p {{ line-height: 1.7; color: #bbb; margin-bottom: 16px; }}
  ul, ol {{ padding-left: 24px; margin-bottom: 16px; color: #bbb; line-height: 1.8; }}
  li {{ margin-bottom: 4px; }}

  code {{ background: #1e1e1e; border: 1px solid #333; border-radius: 4px; padding: 2px 6px; font-size: 13px; font-family: 'JetBrains Mono', 'Fira Code', monospace; color: #e0c4ff; }}
  pre {{ background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px; padding: 20px; overflow-x: auto; margin-bottom: 20px; }}
  pre code {{ background: none; border: none; padding: 0; font-size: 13px; color: #e8e8e8; }}

  .highlight {{ background: #1a1a1a; border-radius: 8px; margin-bottom: 20px; overflow: hidden; }}
  .highlight pre {{ margin: 0; border: 1px solid #2a2a2a; border-radius: 8px; padding: 20px; }}
  .highlight .hll {{ background-color: #2a2a2a; }}
  .highlight .c {{ color: #6a9955; }}
  .highlight .k {{ color: #569cd6; }}
  .highlight .n {{ color: #9cdcfe; }}
  .highlight .o {{ color: #d4d4d4; }}
  .highlight .s {{ color: #ce9178; }}
  .highlight .s1 {{ color: #ce9178; }}
  .highlight .s2 {{ color: #ce9178; }}
  .highlight .nb {{ color: #4ec9b0; }}
  .highlight .mi {{ color: #b5cea8; }}
  .highlight .kn {{ color: #c586c0; }}
  .highlight .nn {{ color: #9cdcfe; }}
  .highlight .nt {{ color: #4ec9b0; }}
  .highlight .na {{ color: #9cdcfe; }}
  .highlight .cm {{ color: #6a9955; }}
  .highlight .cp {{ color: #6a9955; }}
  .highlight .cs {{ color: #6a9955; }}
  .highlight .sd {{ color: #ce9178; }}
  .highlight .p {{ color: #d4d4d4; }}
  .highlight .kr {{ color: #569cd6; }}
  .highlight .kd {{ color: #569cd6; }}
  .highlight .kt {{ color: #4ec9b0; }}
  .highlight .bp {{ color: #9cdcfe; }}
  .highlight .err {{ color: #f44747; }}

  table {{ width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px; }}
  th {{ background: #1a1a1a; color: #e0e0e0; font-weight: 600; padding: 10px 14px; text-align: left; border: 1px solid #2a2a2a; }}
  td {{ padding: 10px 14px; border: 1px solid #222; color: #bbb; }}
  tr:nth-child(even) td {{ background: #131313; }}

  blockquote {{ border-left: 3px solid #7c3aed; padding: 12px 20px; background: #1a1433; border-radius: 0 6px 6px 0; margin-bottom: 16px; color: #bbb; }}

  .tabs-wrapper {{ margin-bottom: 20px; }}
  .tabs {{ display: flex; flex-wrap: wrap; background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px; overflow: hidden; }}
  .tab-radio {{ display: none; }}
  .tab-label {{
    padding: 10px 18px; cursor: pointer; font-size: 13px; font-weight: 500;
    color: #888; border-bottom: 2px solid transparent; transition: all 0.15s;
    user-select: none;
  }}
  .tab-label:hover {{ color: #ccc; }}
  .tab-radio:checked + .tab-label {{ color: #a78bfa; border-bottom-color: #7c3aed; background: #1e1433; }}
  .tab-content {{ display: none; width: 100%; order: 99; padding: 16px; border-top: 1px solid #2a2a2a; }}
  .tab-radio:checked ~ .tab-content {{ display: block; }}

  @media (max-width: 768px) {{
    .sidebar {{ display: none; }}
    .main {{ padding: 24px 20px; }}
  }}
</style>
</head>
<body>
<nav class="sidebar">
  <div class="logo">
    <div class="logo-icon">G</div>
    <span class="logo-text">GateCtr</span>
  </div>
  {nav_html}
</nav>
<main class="main">
  {content_html}
</main>
<script>
  // Auto-select first tab in each group
  document.querySelectorAll('.tabs-wrapper').forEach(function(wrapper) {{
    var radios = wrapper.querySelectorAll('.tab-radio');
    if (radios.length > 0) radios[0].checked = true;
  }});
</script>
</body>
</html>"""
    return html


class DocsHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        params = urllib.parse.parse_qs(parsed.query)

        if parsed.path == "/" or parsed.path == "":
            page = params.get("page", ["README.md"])[0]
            page = page.lstrip("/")
            file_path = os.path.join(os.path.dirname(__file__), page)
            html = render_page(file_path, page)
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Cache-Control", "no-cache")
            self.end_headers()
            self.wfile.write(html.encode("utf-8"))
        else:
            self.send_response(302)
            self.send_header("Location", "/")
            self.end_headers()

    def log_message(self, format, *args):
        pass


if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer((HOST, PORT), DocsHandler) as httpd:
        print(f"GateCtr Docs running at http://{HOST}:{PORT}")
        httpd.serve_forever()
