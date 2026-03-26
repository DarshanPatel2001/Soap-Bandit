import requests
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": "Mozilla/5.0"
}

def fetch_ingredient_extra(ingredient_name: str):
    try:
        # INCIDecoder (clean + structured enough)
        search_url = f"https://incidecoder.com/search?query={ingredient_name}"
        search_res = requests.get(search_url, headers=HEADERS)
        search_res.raise_for_status()

        search_soup = BeautifulSoup(search_res.text, "html.parser")

        # Step 1: Get first result link
        first_result = search_soup.select_one("a.ingredient-name")
        if not first_result:
            return {"error": "Ingredient not found in external source"}

        ingredient_url = "https://incidecoder.com" + first_result.get("href")

        # Step 2: Visit ingredient page
        ing_res = requests.get(ingredient_url, headers=HEADERS)
        ing_res.raise_for_status()

        soup = BeautifulSoup(ing_res.text, "html.parser")

        # Step 3: Extract INCI Name
        inci_name_tag = soup.select_one("h1")
        inci_name = inci_name_tag.text.strip() if inci_name_tag else None

        # Step 4: Extract function (usually labeled "What-it-does")
        function_tags = soup.select(".what-it-does a")
        functions = [tag.text.strip() for tag in function_tags]

        # Step 5: Extract description (we'll infer source from text)
        description_tag = soup.select_one(".ingredient-description")
        description = description_tag.text.strip() if description_tag else ""

        # Step 6: Basic source classification (simple heuristic)
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
            "description": description[:300]  # trimmed
        }

    except Exception as e:
        return {"error": str(e)}