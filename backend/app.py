from fastapi import FastAPI # pyright: ignore[reportMissingImports]
from routes import product_routes # pyright: ignore[reportMissingImports]
from fastapi.middleware.cors import CORSMiddleware

origins = ["http://localhost:5173", "http://loacalhost:3000", "https://fastapi-product-control-center.vercel.app"]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to the FastAPI application!"}
app.include_router(product_routes.router)  # Include the product routes from product_routes.py