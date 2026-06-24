from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from database import get_db
from models import User, Task, Reminder
from schemas import ReminderCreate, ReminderResponse
from dependencies import get_current_user

router = APIRouter(prefix="/reminders", tags=["reminders"])

@router.get("/", response_model=List[ReminderResponse])
def get_reminders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Join with tasks to make sure reminders belong to the user
    reminders = db.query(Reminder).join(Task).filter(Task.user_id == current_user.id).offset(skip).limit(limit).all()
    return reminders

@router.post("/", response_model=ReminderResponse)
def create_reminder(reminder: ReminderCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == reminder.task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    new_reminder = Reminder(
        task_id=reminder.task_id, 
        reminder_time=reminder.reminder_time,
        recurrence_rule=reminder.recurrence_rule
    )
    db.add(new_reminder)
    db.commit()
    db.refresh(new_reminder)
    return new_reminder

@router.delete("/{reminder_id}")
def delete_reminder(reminder_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    reminder = db.query(Reminder).join(Task).filter(Reminder.id == reminder_id, Task.user_id == current_user.id).first()
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    
    db.delete(reminder)
    db.commit()
    return {"detail": "Reminder deleted successfully"}
