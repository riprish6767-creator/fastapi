import pytest
from fastapi.testclient import TestClient

from app.main import create_app


@pytest.fixture
def client() -> TestClient:
    return TestClient(create_app())


def test_dashboard_is_served_at_root(client: TestClient) -> None:
    response = client.get("/")

    assert response.status_code == 200
    assert "Campus — Student dashboard" in response.text


def test_dashboard_assets_are_served(client: TestClient) -> None:
    response = client.get("/dashboard.js")

    assert response.status_code == 200
    assert "refreshStudents" in response.text


def test_list_students_starts_empty(client: TestClient) -> None:
    response = client.get("/students")

    assert response.status_code == 200
    assert response.json() == []


def test_add_and_get_student(client: TestClient) -> None:
    student_data = {"name": "Asha Rao", "age": 20, "course": "Computer Science"}

    create_response = client.post("/students", json=student_data)

    assert create_response.status_code == 201
    student = create_response.json()
    assert student == {"id": 1, **student_data}

    get_response = client.get("/students/1")

    assert get_response.status_code == 200
    assert get_response.json() == student


def test_list_students_returns_added_students(client: TestClient) -> None:
    student_data = {"name": "Asha Rao", "age": 20, "course": "Computer Science"}
    client.post("/students", json=student_data)

    response = client.get("/students")

    assert response.status_code == 200
    assert response.json() == [{"id": 1, **student_data}]


def test_add_student_rejects_invalid_data(client: TestClient) -> None:
    response = client.post(
        "/students",
        json={"name": "Asha Rao", "age": 0, "course": "Computer Science"},
    )

    assert response.status_code == 422


def test_get_missing_student_returns_404(client: TestClient) -> None:
    response = client.get("/students/99")

    assert response.status_code == 404
    assert response.json() == {"detail": "Student not found"}


def test_delete_student(client: TestClient) -> None:
    client.post(
        "/students",
        json={"name": "Asha Rao", "age": 20, "course": "Computer Science"},
    )

    response = client.delete("/students/1")

    assert response.status_code == 204
    assert response.content == b""
    assert client.get("/students/1").status_code == 404


def test_delete_missing_student_returns_404(client: TestClient) -> None:
    response = client.delete("/students/99")

    assert response.status_code == 404
    assert response.json() == {"detail": "Student not found"}
