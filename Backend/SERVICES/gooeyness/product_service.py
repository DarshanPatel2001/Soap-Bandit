import re
import requests

#url may need change but researched best opensrouce currently
SEARCH_URL = "https://world.openbeautyfacts.org/cgi/search.pl"


def _clean_ingredients(raw_text: str) -> list[str]:
    """Parse raw ingredients text into a clean list of INCI name strings."""
    text = raw_text.lower()
    #strip bracketed content
    text = re.sub(r"\[.*?\]", "", text)
    text = re.sub(r"\(.*?\)", "", text)
    #parse by ","
    tokens = text.split(",")
    cleaned = []
    for token in tokens:
        # strip asterisks and numbers
        token = re.sub(r"[*]", "", token)
        # strip percentages like "2%" or "0.5%"
        token = re.sub(r"\d+\.?\d*\s*%", "", token)
        # strip standalone numbers
        token = re.sub(r"\b\d+\.?\d*\b", "", token)
        token = token.strip()
        if token:
            cleaned.append(token)
    return cleaned


def get_product_ingredients(product_name: str) -> dict:
    """Look up a product on Open Beauty Facts and return its ingredient list."""
    try:
        resp = requests.get(
            SEARCH_URL,
            params={
                "search_terms": product_name,
                "search_tag": "product_name",
                "json": "1",
                "action": "process",
            },
            timeout=15,
        )
        resp.raise_for_status()
        data = resp.json()

        products = data.get("products", [])
        if not products:
            return {"error": "Product not found", "query": product_name}

        #use first case
        ingredients_text = None
        for product in products:
            ingredients_text = product.get("ingredients_text") or product.get("ingredients_text_en")
            if ingredients_text:
                break

        if not ingredients_text:
            return {"error": "Product not found", "query": product_name}

        ingredients = _clean_ingredients(ingredients_text)
        return {
            "product": product_name,
            "ingredients": ingredients,
            "source": "open_beauty_facts",
        }
    #fallback errors JIC
    except requests.exceptions.Timeout:
        return {"error": "Request timed out", "query": product_name}
    except requests.exceptions.RequestException as e:
        return {"error": f"Network error: {str(e)}", "query": product_name}
    except Exception as e:
        return {"error": f"Unexpected error: {str(e)}", "query": product_name}
