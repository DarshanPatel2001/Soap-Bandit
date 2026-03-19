import unicodedata
import re


def clean_string(s: str) -> str:
    if not s:
        return ""
    normalized = unicodedata.normalize("NFKD", s)
    ascii_only = normalized.encode("ascii", "ignore").decode("ascii")
    collapsed = re.sub(r"\s+", " ", ascii_only)
    return collapsed.strip().lower()


def extract_text(soup, selector: str) -> str:
    el = soup.select_one(selector)
    if el is None:
        return ""
    return clean_string(el.get_text())


def extract_table(soup, table_id: str) -> list:
    table = soup.find("table", {"id": table_id})
    if table is None:
        return []

    rows = table.find_all("tr")
    if not rows:
        return []

    headers = [clean_string(th.get_text()) for th in rows[0].find_all(["th", "td"])]

    result = []
    for row in rows[1:]:
        cells = [clean_string(td.get_text()) for td in row.find_all(["th", "td"])]
        if len(cells) == len(headers):
            result.append(dict(zip(headers, cells)))

    return result
