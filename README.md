# Campus — Student Dashboard

A FastAPI student-management app with a responsive dashboard and a JSON API.
The dashboard supports adding students, searching and filtering the directory,
viewing student details, and deleting students. Student data is held in memory
and is cleared when the application restarts.

## Project structure

```text
app/
  main.py
  static/
    index.html
    styles.css
    dashboard.js
  routers/
    students.py
  schemas/
    student.py
  services/
    student_store.py
tests/
  test_students.py
requirements.txt
```

## Requirements

- Python 3.10 or newer

Install the packages listed in `requirements.txt`:

```bash
python -m venv .venv
```

Activate the virtual environment:

```powershell
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
```

```bash
# macOS/Linux
source .venv/bin/activate
```

Then install dependencies:

```bash
python -m pip install -r requirements.txt
```

## Run the application

From the project root:

```bash
uvicorn app.main:app --reload
```

Open the dashboard in your browser at `http://127.0.0.1:8000`.

The dashboard is served by FastAPI and calls the API on the same origin. It
includes a locally animated canvas illustration, responsive layout, live
student and course summaries, directory search/filtering, student details,
and add/delete actions. No separate frontend server or JavaScript package
installation is needed.

Interactive API documentation:

- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

## API endpoints and Postman

| Method | URL | Description |
|---|---|---|
| `POST` | `http://127.0.0.1:8000/students` | Add a student |
| `GET` | `http://127.0.0.1:8000/students` | View all students |
| `GET` | `http://127.0.0.1:8000/students/{student_id}` | View a student by ID |
| `DELETE` | `http://127.0.0.1:8000/students/{student_id}` | Delete a student |

Use the dashboard or Swagger UI in a browser, or enter the endpoint URLs in
Postman. For the `POST` request, select **Body > raw > JSON** and send:

```json
{
  "name": "Asha Rao",
  "age": 20,
  "course": "Computer Science"
}
```

The `name` and `course` fields must contain 1–100 characters. `age` must be
between 1 and 150. Invalid request data returns `422`; looking up or deleting
a student that does not exist returns `404`.

## Run tests

From the project root:

```bash
pytest
```

The test suite covers the student APIs and verifies the dashboard and its
JavaScript asset are served.
