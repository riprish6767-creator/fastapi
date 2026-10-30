from pydantic import BaseModel, ConfigDict, Field


class StudentCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100, examples=["Asha Rao"])
    age: int = Field(gt=0, le=150, examples=[20])
    course: str = Field(min_length=1, max_length=100, examples=["Computer Science"])


class StudentRead(StudentCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)
