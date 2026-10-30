from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.routers.students import router as students_router
from app.services.student_store import StudentStore

STATIC_DIRECTORY = Path(__file__).parent / "static"


def create_app() -> FastAPI:
    """Create the API application with a fresh in-memory student store."""
    app = FastAPI(
        title="Student API",
        description="A simple API for managing students.",
        version="1.0.0",
    )
    app.state.student_store = StudentStore()
    app.include_router(students_router)
    app.mount("/", StaticFiles(directory=STATIC_DIRECTORY, html=True), name="dashboard")
    return app


app = create_app()
