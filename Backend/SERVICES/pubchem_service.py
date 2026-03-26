import requests
from dotenv import load_dotenv
import os
load_dotenv()
BASE_URL = os.getenv("PUBCHEM_BASE_URL")
def fetch_ingredient_data(ingredient_name: str):
    try:
        # Step 1: Get CID (compound ID)
        cid_url = f"{BASE_URL}/compound/name/{ingredient_name}/cids/JSON"
        cid_res = requests.get(cid_url)
        cid_res.raise_for_status()

        cid_data = cid_res.json()
        cid = cid_data["IdentifierList"]["CID"][0]

        # Step 2: Fetch properties
        props_url = f"{BASE_URL}/compound/cid/{cid}/property/MolecularFormula,MolecularWeight,IUPACName/JSON"
        props_res = requests.get(props_url)
        props_res.raise_for_status()

        props = props_res.json()["PropertyTable"]["Properties"][0]

        # Step 3: Fetch synonyms
        syn_url = f"{BASE_URL}/compound/cid/{cid}/synonyms/JSON"
        syn_res = requests.get(syn_url)
        syn_res.raise_for_status()

        synonyms = syn_res.json()["InformationList"]["Information"][0]["Synonym"][:10]

        return {
            "ingredient": ingredient_name,
            "cid": cid,
            "molecular_formula": props.get("MolecularFormula"),
            "molecular_weight": props.get("MolecularWeight"),
            "iupac_name": props.get("IUPACName"),
            "synonyms": synonyms
        }

    except Exception as e:
        return {"error": str(e)}