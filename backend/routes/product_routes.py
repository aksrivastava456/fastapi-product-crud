from fastapi import APIRouter # pyright: ignore[reportMissingImports]
from schemas.product import Item # pyright: ignore[reportMissingImports]

from services.product_services import (
    get_all_products,
    create_product as create_product_service,
    get_product_by_id,
    update_product as update_product_service,
    delete_product as delete_product_service,
    search_products_service
)

router = APIRouter(prefix="/products", tags=["products"])

@router.get("/")
def get_products(page: int = 1, limit: int = 10):
    products = get_all_products()
    return {"products": products}

@router.post("/")
def create_product(item: Item):
    created_product = create_product_service(item)
    return {"product": created_product}

@router.get("/{product_id}")
def get_product(product_id: str):
    product = get_product_by_id(product_id)
    return {"product": product}

@router.put("/{product_id}")
def update_product(product_id: str, item: Item):
    updated_product = update_product_service(product_id, item)
    return {"product": updated_product}

@router.delete("/{product_id}")
def delete_product(product_id: str):
    deleted_product = delete_product_service(product_id)
    return {"product": deleted_product}

@router.get("/search/")
def search_products(name: str):
    products = search_products_service(name)
    return {"products": products}
