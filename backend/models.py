from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False) # hashed password

    tasks = relationship("Task", back_populates="owner", cascade="all, delete-orphan")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    due_date = Column(String, nullable=True)  # Store as YYYY-MM-DD
    due_time = Column(String, nullable=True)  # Store as HH:MM
    priority = Column(String, nullable=False, default="Medium")  # Low, Medium, High
    status = Column(String, nullable=False, default="Pending") # Pending, Completed
    category = Column(String, nullable=True, default="General")
    created_at = Column(DateTime, default=datetime.utcnow)
    recurring_pattern = Column(String, nullable=True) # e.g. "daily", "weekly"
    parent_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)
    order_index = Column(Integer, default=0)

    owner = relationship("User", back_populates="tasks")
    reminders = relationship("Reminder", back_populates="task", cascade="all, delete-orphan")

class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    reminder_time = Column(DateTime, nullable=False)
    status = Column(String, nullable=False, default="Pending") # Pending, Sent, Missed, Completed
    recurrence_rule = Column(String, nullable=True) # None, DAILY, WEEKLY, MONTHLY, CUSTOM
    completed_at = Column(DateTime, nullable=True)
    
    task = relationship("Task", back_populates="reminders")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message = Column(String, nullable=False)
    type = Column(String, nullable=False) # Upcoming, Overdue, Completed
    is_cleared = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
