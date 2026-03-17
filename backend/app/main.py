from fastapi import FastAPI
from app.database.connection import Base, engine
from app.auth.router import router as auth_router
from fastapi.middleware.cors import CORSMiddleware
from app.keystroke.router import router as keystroke_router

# Creates all tables in the DB on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Parkinson Keystroke Screening API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server (Vite default)
    allow_credentials=True,                   # Required for cookies
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(keystroke_router)

@app.get("/")
def health_check():
    return {"status": "API is running"}