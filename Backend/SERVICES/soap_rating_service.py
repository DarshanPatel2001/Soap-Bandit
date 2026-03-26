import pandas as pd
import numpy as np
import pgeocode
from scipy.spatial import cKDTree
from pathlib import Path

INPUT_FILE = Path(__file__).resolve().parent.parent / "water_hardness_ph" / "water_quality_by_zip.csv"


def load_data():
    df = pd.read_csv(INPUT_FILE, dtype={"zip_code": str})
    df["zip_code"] = df["zip_code"].str.zfill(5)
    return df


def get_hardness_profile(zip_code: str):
    df = load_data()

    search_pool = df.dropna(subset=["ph_avg", "hardness_ppm_avg"], how="any").copy()

    nomi = pgeocode.Nominatim("us")
    zip_info = nomi._data[["postal_code", "latitude", "longitude"]].dropna()
    zip_info["postal_code"] = zip_info["postal_code"].astype(str).str.zfill(5)

    search_df = search_pool.merge(zip_info, left_on="zip_code", right_on="postal_code")
    tree = cKDTree(np.radians(search_df[["latitude", "longitude"]].values))

    exact_match = search_df[search_df["zip_code"] == zip_code]

    if not exact_match.empty:
        row = exact_match.iloc[0]
    else:
        target_geo = nomi.query_postal_code(zip_code)
        if pd.isna(target_geo.latitude):
            return {"error": "ZIP code not found"}

        dist, idx = tree.query(np.radians([target_geo.latitude, target_geo.longitude]), k=1)
        row = search_df.iloc[idx]

    ppm = row["hardness_ppm_avg"]
    gpg = ppm / 17.1

    if gpg < 3.5:
        category = "Soft"
    elif gpg < 7.0:
        category = "Moderately Hard"
    elif gpg < 10.5:
        category = "Hard"
    else:
        category = "Very Hard"

    return {
        "zip_code": zip_code,
        "city": row["city"],
        "state": row["state"],
        "hardness_category": category
    }


def rate_soap_by_zip(zip_code: str, soap_name: str = "Generic Soap Bar"):
    profile = get_hardness_profile(zip_code)

    if "error" in profile:
        return profile

    category = profile["hardness_category"]

    if category == "Soft":
        rating = "Excellent"
        reason = "Soft water helps soap lather well."
    elif category == "Moderately Hard":
        rating = "Good"
        reason = "Soap works well with minor residue."
    elif category == "Hard":
        rating = "Fair"
        reason = "Hard water reduces lather."
    else:
        rating = "Poor"
        reason = "Very hard water significantly reduces performance."

    return {
        "soap_name": soap_name,
        "zip_code": zip_code,
        "hardness_category": category,
        "soap_rating": rating,
        "reason": reason
    }