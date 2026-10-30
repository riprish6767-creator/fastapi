from fastapi import APIRouter, HTTPException, Request, Response, status

from app.schemas.student import StudentCreate, StudentRead
from app.services.student_store import StudentStore

router = APIRouter(prefix="/students", tags=["students"])


def get_student_store(request: Request) -> StudentStore:
    return request.app.state.student_store


@router.post(
    "",
    response_model=StudentRead,
    status_code=status.HTTP_201_CREATED,
    summary="Add a student",
)
def add_student(
    student: StudentCreate,
    request: Request,
) -> StudentRead:
    return get_student_store(request).add(student)


@router.get(
    "",
    response_model=list[StudentRead],
    summary="View all students",
)
def get_students(request: Request) -> list[StudentRead]:
    return get_student_store(request).all()


@router.get(
    "/{student_id}",
    response_model=StudentRead,
    summary="View a student by ID",
)
def get_student(student_id: int, request: Request) -> StudentRead:
    student = get_student_store(request).get(student_id)
    if student is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found",
        )
    return student


@router.delete(
    "/{student_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a student",
)
def delete_student(student_id: int, request: Request) -> Response:
    deleted = get_student_store(request).delete(student_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found",
        )
    return Response(status_code=status.HTTP_204_NO_CONTENT)
