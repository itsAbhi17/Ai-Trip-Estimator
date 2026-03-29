import re

js_code = open("app.js", "r", encoding="utf-8").read()

# We want to find variables that are used but not defined.
# Or variables that are defined using $("id") but the id is not in index.html.

html_code = open("index.html", "r", encoding="utf-8").read()

ids_in_html = re.findall(r'id=["\']([^"\']+)["\']', html_code)

queries_in_js = re.findall(r'\$\(["\']([^"\']+)["\']\)', js_code)

for q in queries_in_js:
    if q not in ids_in_html:
        print(f"ERROR: ID '{q}' used in app.js but not found in index.html!")
