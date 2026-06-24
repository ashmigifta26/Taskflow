from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
from config import CORS_ORIGINS
from routes import auth, notifications, tasks, dashboard, reminders, analytics

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database ready.")
    yield
    print("Shutdown complete.")

app = FastAPI(
    title="TaskFlow API",
    description="Backend API for TaskFlow task and reminder application.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow Expo web (localhost + 127.0.0.1) on all common ports
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(reminders.router)
app.include_router(dashboard.router)
app.include_router(notifications.router)
app.include_router(analytics.router)

@app.get("/")
def read_root():
    return {
        "message": "TaskFlow API",
        "docs": "/docs",
        "health": "/health",
    }

@app.get("/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)