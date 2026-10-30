from app.schemas.student import StudentCreate, StudentRead


class StudentStore:
    """In-memory storage for students; data is cleared when the app restarts."""

    def __init__(self) -> None:
        self._students: dict[int, StudentRead] = {}
        self._next_id = 1

    def add(self, student: StudentCreate) -> StudentRead:
        saved_student = StudentRead(id=self._next_id, **student.model_dump())
        self._students[self._next_id] = saved_student
        self._next_id += 1
        return saved_student

    def all(self) -> list[StudentRead]:
        return list(self._students.values())

    def get(self, student_id: int) -> StudentRead | None:
        return self._students.get(student_id)

    def delete(self, student_id: int) -> bool:
        return self._students.pop(student_id, None) is not None
