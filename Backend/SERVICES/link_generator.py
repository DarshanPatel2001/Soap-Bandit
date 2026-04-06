import urllib.parse

def generate_store_links(product_name):
    # Encode the product name for a URL (e.g., "dove soap" becomes "dove%20soap")
    query = urllib.parse.quote(product_name)
    
    # Base URLs for searching
    amazon_base = "https://www.amazon.com/s?k="
    walmart_base = "https://www.walmart.com/search?q="
    
    # Construct the full links
    amazon_link = f"{amazon_base}{query}"
    walmart_link = f"{walmart_base}{query}"
    
    return {
        "Amazon": amazon_link,
        "Walmart": walmart_link
    }

# --- Main Program ---
if __name__ == "__main__":
    product = input("Enter the product you want to find: ")
    links = generate_store_links(product)
    
    print("\n--- Generated Links ---")
    for store, link in links.items():
        print(f"{store}: {link}")