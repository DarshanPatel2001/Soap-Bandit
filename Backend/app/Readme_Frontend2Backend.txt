Quick guide in the Next step stuffs
---

##What i used to tesr

```bash
cd Backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

* API runs at: [http://localhost:8000](http://localhost:8000)
* Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

On first run, the server checks if it needs to refresh data.
Good news: the dataset is already included, so startup is basically instant.

---

##Endpoints

---

### `GET /`

**Health check**

Just confirms the server is alive.

```json
{ "message": "Soap Knowledge API currently running" }
```

---

### `POST /recommendations`

**This is the main event.**

Send in a user profile → get back the top 5 soap matches.

#### Example request:

```json
{
  "zip_code": "37201",
  "skin_type": "dry",
  "avoid_ingredients": ["sulfate", "fragrance"],
  "prefer_ingredients": ["glycerin", "aloe"]
}
```

#### Notes:

* `skin_type` must be: `"dry" | "oily" | "sensitive" | "normal"`
* Ingredient matching is fuzzy (substring-based)
  → `"sulfate"` will match things like `"sodium lauryl sulfate"`

#### How scoring works (100 pts total):

* 40 pts → skin type match
* 30 pts → avoids unwanted ingredients
* 20 pts → includes preferred ingredients
* 10 pts → works well with local water

####Example response (trimmed):

```json
{
  "user_location": "Nashville, TN",
  "water_hardness": "Moderately Hard",
  "top_matches": [
    {
      "rank": 1,
      "match_score": 90,
      "soap": {
        "id": "...",
        "name": "...",
        "brand": "..."
      },
      "reasons": [
        "Suitable for dry skin",
        "No avoided ingredients found",
        "Compatible with your water",
        "Includes preferred ingredients"
      ]
    }
  ]
}
```

---

### `GET /recommendations/soap/{id}`

**Get full details for a specific soap**

Use the `id` from the recommendations response.

Example:

```
/recommendations/soap/native-strawberry-matcha-liquid-hand-soap
```

Returns:

* full ingredient list
* safety info
* gooeyness breakdown
* detailed scoring logic

If the ID doesn’t exist:

```json
{ "error": "Soap not found" }
```

---

### `GET /soap/gooeyness?name=`

**Check how “mushy” a soap is**

Works for *any* soap (not just your dataset) using Open Beauty Facts.

Examples:

```
/soap/gooeyness?name=dove+soap
/soap/gooeyness?name=irish+spring
```

#### Gooeyness scale:

* 0–2 → Very Firm
* 2–4 → Firm
* 4–6 → Average
* 6–8 → Gooey
* 8–10 → Very Gooey

Returns 404 if the product isn’t found.

---

### `GET /ingredients/{name}/full`

**Deep dive on an ingredient**

Combines:

* PubChem (molecular data)
* INCIDecoder (cosmetic usage)

Example:

```
/ingredients/glycerin/full
```

You’ll get:

* chemical structure info
* cosmetic function
* description

---

### `GET /ingredients/{name}/safety`

**Safety + regulatory info (EWG)**

Example:

```
/ingredients/fragrance/safety
```

####Safety scale:

* 1–2 → Low hazard
* 3–6 → Moderate
* 7–10 → High

Results are cached for 30 days for speed.

---

### `GET /water/hardness?zip_code=`

**Find water hardness for a location**

Example:

```
/water/hardness?zip_code=37201
```

Returns:

* hardness level
* pH
* ppm values

#### Categories:

* Soft → 0–60 ppm
* Moderately Hard → 61–120 ppm
* Hard → 121–180 ppm
* Very Hard → 180+ ppm

---

### `GET /water/soap-rating?zip_code=&soap_name=`

**How well a soap works in your water**

* `soap_name` optional (defaults to generic soap)

---

##Some Info Breakdown

### Safety Score (1–10)

* 1–2 → Safe
* 3–6 → Moderate concerns
* 7–10 → High concern

---

### `has_concerns`

Only true for *serious* risks like:

* cancer
* endocrine disruption
* developmental toxicity

Basic irritation doesn’t trigger it.

---

### Skin Suitability

* `dry` → humectants (glycerin, aloe, honey)
* `sensitive` → no harsh sulfates
* `oily` → includes charcoal, salicylic acid, etc.
* `normal` → default unless flagged

---

### Water Compatibility

* `soft` → best for soft/moderate water
* `hard` → designed for hard water
* `both` → works anywhere

---

### Gooeyness

* Higher = softer, melts faster
* Lower = firmer, lasts longer

---

### Longevity

* `high` → long-lasting
* `medium` → average
* `low` → dissolves faster

---

##Dataset Overview

liquid hand soaps 31 so far:

* Dial (8)
* Softsoap (9)
* Method (8)
* Native (5)

Each includes:

* full ingredient list
* safety scores
* skin compatibility
* water compatibility
* gooeyness rating
* buy link

---

##Limitations

* Some ingredients may not have safety scores yet
* Gooeyness depends on Open Beauty Facts coverage
* Some ZIP codes (especially rural) may not resolve
* Optional fields like `nova_group` may be missing

---
