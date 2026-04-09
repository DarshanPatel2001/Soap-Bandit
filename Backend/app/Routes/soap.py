from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
from SERVICES.gooeyness.product_service import get_product_ingredients
from SERVICES.gooeyness.gooeyness_service import calculate_gooeyness

router = APIRouter()


@router.get("/gooeyness")
def gooeyness(name: str = Query(..., description="Product name to look up")):
    result = get_product_ingredients(name)

    if "error" in result:
        return JSONResponse(status_code=404, content=result)

    gooey = calculate_gooeyness(result["ingredients"])

    return {
        "product": result["product"],
        "source": result["source"],
        **gooey,
    }
