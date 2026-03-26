from SERVICES.soap_rating_service import rate_soap_by_zip
import json

zip_code = input("Enter ZIP code: ").strip()
soap_name = input("Enter soap name (or press Enter for default): ").strip()

if not soap_name:
    soap_name = "Generic Soap Bar"

result = rate_soap_by_zip(zip_code, soap_name)
print(json.dumps(result, indent=2))
