from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime

VALID_CATEGORIES = {"General", "Work", "Personal", "Health", "Study", "Shopping"}
VALID_PRIORITIES = {"Low", "Medium", "High"}

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Name cannot be empty")
        if len(v) > 100:
            raise ValueError("Name must be 100 characters or fewer")
        return v

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        return v

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[str] = None
    due_time: Optional[str] = None
    priority: str = "Medium"
    category: str = "General"
    recurring_pattern: Optional[str] = None
    parent_id: Optional[int] = None
    order_index: Optional[int] = 0

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v: str) -> str:
        if v not in VALID_PRIORITIES:
            raise ValueError(f"Priority must be one of: {', '.join(VALID_PRIORITIES)}")
        return v

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: str) -> str:
        if v not in VALID_CATEGORIES:
            # Default to General if invalid category passed
            return "General"
        return v

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[str] = None
    due_time: Optional[str] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    recurring_pattern: Optional[str] = None
    order_index: Optional[int] = None

class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    due_date: Optional[str]
    due_time: Optional[str]
    priority: str
    status: str
    category: str
    created_at: datetime
    user_id: int
    recurring_pattern: Optional[str] = None
    parent_id: Optional[int] = None
    order_index: Optional[int] = 0

    class Config:
        from_attributes = True

class ReminderBase(BaseModel):
    reminder_time: datetime
    recurrence_rule: Optional[str] = None

class ReminderCreate(ReminderBase):
    task_id: int

class ReminderResponse(ReminderBase):
    id: int
    task_id: int
    status: str
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class NotificationBase(BaseModel):
    message: str
    type: str
    is_cleared: bool = False

class NotificationResponse(NotificationBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class ReminderExtendedResponse(ReminderResponse):
    task_title: str
    task_priority: str


class DashboardStats(BaseModel):
    total_tasks: int
    completed_tasks: int
    pending_tasks: int
    upcoming_reminders: int
