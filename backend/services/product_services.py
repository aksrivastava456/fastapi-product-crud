from bson import ObjectId # pyright: ignore[reportMissingImports]
from database import db # pyright: ignore[reportMissingImports]
from fastapi import HTTPException # pyright: ignore[reportMissingImports]

products = db["products"]

def get_all_products(page = 1, limit = 10):
    skip = (page - 1) * limit
    product_list = []
    for product in products.find().skip(skip).limit(limit):  # Pagination using skip and limit
        product["_id"] = str(product["_id"])  # Convert ObjectId to string for JSON serialization
        product_list.append(product)
    return product_list

def create_product(item):
    product_data = item.dict()  # Convert the Pydantic model to a dictionary
    result = products.insert_one(product_data)  # Insert the product data into the collection
    product_data["_id"] = str(result.inserted_id)  # Convert ObjectId to string for JSON serialization
    return product_data

def get_product_by_id(product_id: str):
    product = products.find_one({"_id": ObjectId(product_id)})  # Find the product by its ID
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product["_id"] = str(product["_id"])  # Convert ObjectId to string for JSON serialization
    return product

def update_product(product_id: str, item):
    product_data = item.dict()  # Convert the Pydantic model to a dictionary
    result = products.update_one({"_id": ObjectId(product_id)}, {"$set": product_data})  # Update the product data in the collection
    if result.modified_count > 0:
        return {"message": "Product updated successfully"}
    raise HTTPException(status_code=404, detail="Product not found")

def delete_product(product_id: str):
    result = products.delete_one({"_id": ObjectId(product_id)})  # Delete the product from the collection
    if result.deleted_count > 0:
        return {"message": "Product deleted successfully"}
    raise HTTPException(status_code=404, detail="Product not found")

def search_products_service(name: str):
    product_list = []
    for product in products.find({"name": {"$regex": name, "$options": "i"}}):  # Case-insensitive search by name
        if not product:
            raise HTTPException(status_code=404, detail="No products found")
        product["_id"] = str(product["_id"])  # Convert ObjectId to string for JSON serialization
        product_list.append(product)
    return product_list
