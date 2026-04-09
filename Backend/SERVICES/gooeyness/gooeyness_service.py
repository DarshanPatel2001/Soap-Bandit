
#gooey mapped from research, humectent which is water content -- will use a score baed on type of 'wet'
GOOEYNESS_MAP = {
    "glycerin":               ("humectant", 3.0,  "absorbs water, softens bar"),
    "sorbitol":               ("humectant", 2.5,  "absorbs water, softens bar"),
    "propylene glycol":       ("humectant", 2.0,  "attracts moisture, increases mushiness"),
    "honey":                  ("humectant", 2.0,  "natural humectant, softens bar"),
    "sodium olivate":         ("soft_oil",  2.0,  "olive oil derivative, produces softer bar"),
    "ricinus communis":       ("soft_oil",  2.5,  "castor oil, high moisture retention"),
    "castor oil":             ("soft_oil",  2.5,  "high moisture retention"),
    "sodium lauryl sulfate":  ("lathering", 1.0,  "surfactant, mild softening effect"),
    "sodium laureth sulfate": ("lathering", 1.0,  "surfactant, mild softening effect"),
    "cocamidopropyl betaine": ("lathering", 0.8,  "mild surfactant"),
    "sodium palmate":         ("hardener", -2.5,  "palm oil salt, firms up bar"),
    "sodium tallowate":       ("hardener", -2.5,  "tallow salt, strong hardening agent"),
    "sodium stearate":        ("hardener", -2.0,  "stearic acid salt, hardens bar"),
    "stearic acid":           ("hardener", -2.0,  "fatty acid, hardens bar"),
    "palmitic acid":          ("hardener", -1.5,  "fatty acid, moderate hardening"),
}

#sort map keys by length descending so longest match wins
_SORTED_KEYS = sorted(GOOEYNESS_MAP.keys(), key=len, reverse=True)

LABELS = [
    (2.0,  "Very Firm"),
    (4.0,  "Firm"),
    (6.0,  "Average"),
    (8.0,  "Gooey"),
    (10.0, "Very Gooey"),
]


def _get_label(score: float) -> str:
    for threshold, label in LABELS:
        if score <= threshold:
            return label
    return "Very Gooey"


def calculate_gooeyness(ingredients: list[str]) -> dict:
    breakdown = []
    unscored = []
    total = len(ingredients)

    for ingredient in ingredients:
        lower = ingredient.lower().strip()
        matched = False
        for key in _SORTED_KEYS:
            if key in lower:
                category, weight, effect_desc = GOOEYNESS_MAP[key]
                breakdown.append({
                    "ingredient": ingredient,
                    "category": category,
                    "contribution": weight,
                    "effect": effect_desc,
                })
                matched = True
                break
        if not matched:
            unscored.append(ingredient)

    raw_sum = sum(item["contribution"] for item in breakdown)
    #clamp at -
    score = max(0.0, min(10.0, raw_sum + 5.0))

    label = _get_label(score)
    scored_count = len(breakdown)

    #break down of abs contribut
    breakdown.sort(key=lambda x: abs(x["contribution"]), reverse=True)

    #Confidence score
    if total == 0:
        confidence = "low"
    else:
        pct = scored_count / total
        if pct >= 0.5:
            confidence = "high"
        elif pct >= 0.25:
            confidence = "medium"
        else:
            confidence = "low"

    #summary for FE
    positives = [b for b in breakdown if b["contribution"] > 0]
    negatives = [b for b in breakdown if b["contribution"] < 0]

    if positives and negatives:
        top_pos = positives[0]["ingredient"]
        top_neg = negatives[0]["ingredient"]
        summary = (
            f"This bar scores {label} primarily due to {top_pos} "
            f"and is partially offset by {top_neg}."
        )
    elif positives:
        summary = f"This bar scores {label} driven by moisturizing/softening ingredients."
    elif negatives:
        summary = f"This bar scores {label} due to strong hardening agents."
    else:
        summary = f"This bar scores {label} with no recognized gooeyness contributors."

    return {
        "gooeyness_score": round(score, 1),
        "label": label,
        "summary": summary,
        "breakdown": breakdown,
        "unscored_ingredients": unscored,
        "confidence": confidence,
        "total_ingredients": total,
        "scored_count": scored_count,
    }
