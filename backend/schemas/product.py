from pydantic import BaseModel # pyright: ignore[reportMissingImports]

class Item(BaseModel):
    name: str
    description: str
    price: float
    quantity: int
