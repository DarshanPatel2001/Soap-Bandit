import time
import requests
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}


def _find_first_ingredient_link(search_soup):
    """Find the first ingredient link from INCIDecoder search results."""
    # Ingredient results live inside div#ingredients with class "klavika simpletextlistitem"
    ingredients_div = search_soup.find("div", id="ingredients")
    if ingredients_div:
        link = ingredients_div.select_one('a.simpletextlistitem[href*="/ingredients/"]')
        if link:
            return link

    # Fallback: any anchor matching the pattern anywhere on the page
    link = search_soup.select_one('a.simpletextlistitem[href*="/ingredients/"]')
    return link


def _extract_functions(soup):
    """Extract what-it-does functions from ingredient page."""
    # Find the div.itemprop that contains a span.label with "What-it-does:"
    for itemprop in soup.select("div.itemprop"):
        label = itemprop.select_one("span.label")
        if label and "what-it-does" in label.text.lower():
            value_span = itemprop.select_one("span.value")
            if value_span:
                return [a.text.strip() for a in value_span.find_all("a")]
    print(f"[ingredient_extra] Selector 'div.itemprop > span.label(What-it-does)' not found. "
          f"Available itemprop labels: {[d.select_one('span.label').text.strip() for d in soup.select('div.itemprop') if d.select_one('span.label')]}")
    return []


def _extract_description(soup):
    """Extract description from the Geeky Details section."""
    details = soup.select_one("#details .content")
    if details:
        paragraphs = details.find_all("p")
        if paragraphs:
            text = " ".join(p.get_text(strip=True) for p in paragraphs)
            return text[:300]
    # Fallback: try Quick Facts
    quickfacts = soup.select_one("#quickfacts")
    if quickfacts:
        items = quickfacts.select("li")
        text = " ".join(li.get_text(strip=True) for li in items)
        return text[:300]
    print(f"[ingredient_extra] Selector '#details .content' not found. "
          f"Page sections found: {[h2.text.strip() for h2 in soup.find_all('h2')][:5]}")
    return ""


def fetch_ingredient_extra(ingredient_name: str):
    try:
        search_url = f"https://incidecoder.com/search?query={ingredient_name}"
        search_res = requests.get(search_url, headers=HEADERS)
        search_res.raise_for_status()

        search_soup = BeautifulSoup(search_res.text, "html.parser")

        # Step 1: Get first ingredient result link
        first_result = _find_first_ingredient_link(search_soup)

        # Fallback: retry with uppercase name if no results found
        if not first_result:
            upper_name = ingredient_name.upper()
            print(f"[ingredient_extra] No results for '{ingredient_name}', retrying with '{upper_name}'")
            search_url = f"https://incidecoder.com/search?query={upper_name}"
            search_res = requests.get(search_url, headers=HEADERS)
            search_res.raise_for_status()
            search_soup = BeautifulSoup(search_res.text, "html.parser")
            first_result = _find_first_ingredient_link(search_soup)

        if not first_result:
            avail = search_soup.select("a.simpletextlistitem")
            print(f"[ingredient_extra] Selector 'a.simpletextlistitem[href*=/ingredients/]' matched 0 links. "
                  f"Total simpletextlistitem links found: {len(avail)}. "
                  f"First 3 hrefs: {[a.get('href', '') for a in avail[:3]]}")
            return {"error": f"Ingredient not found in INCIDecoder search for '{ingredient_name}'"}

        ingredient_url = "https://incidecoder.com" + first_result.get("href")

        # Rate-limit delay between requests
        time.sleep(2)

        # Step 2: Visit ingredient page
        ing_res = requests.get(ingredient_url, headers=HEADERS)
        ing_res.raise_for_status()

        soup = BeautifulSoup(ing_res.text, "html.parser")

        # Step 3: Extract INCI Name
        inci_name_tag = soup.select_one("h1")
        inci_name = inci_name_tag.text.strip() if inci_name_tag else None

        # Step 4: Extract functions
        functions = _extract_functions(soup)

        # Step 5: Extract description
        description = _extract_description(soup)

        # Step 6: Source classification from description text
        source = "Unknown"
        desc_lower = description.lower()
        if "plant" in desc_lower or "natural" in desc_lower:
            source = "Plant-based"
        elif "synthetic" in desc_lower or "lab" in desc_lower:
            source = "Synthetic"
        elif "mineral" in desc_lower:
            source = "Mineral"

        return {
            "ingredient": ingredient_name,
            "inci_name": inci_name,
            "functions": functions,
            "source": source,
            "description": description
        }

    except Exception as e:
        return {"error": str(e)}
