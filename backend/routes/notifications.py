from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime

from database import get_db
from models import User, Task, Reminder
from schemas import ReminderExtendedResponse
from dependencies import get_current_user
from typing import List, Dict

router = APIRouter(prefix="/notifications", tags=["notifications"])

def map_reminders(reminders):
    res = []
    for r in reminders:
        r_dict = {
            "id": r.id,
            "task_id": r.task_id,
            "reminder_time": r.reminder_time,
            "status": r.status,
            "task_title": r.task.title,
            "task_priority": r.task.priority
        }
        res.append(r_dict)
    return res

@router.get("/", response_model=Dict[str, List[ReminderExtendedResponse]])
def get_notifications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    now = datetime.utcnow()
    
    upcoming = db.query(Reminder).join(Task).filter(
        Task.user_id == current_user.id,
        Reminder.reminder_time >= now,
        Reminder.status == "Pending"
    ).order_by(Reminder.reminder_time.asc()).all()
    
    missed = db.query(Reminder).join(Task).filter(
        Task.user_id == current_user.id,
        Reminder.reminder_time < now,
        Reminder.status == "Pending"
    ).order_by(Reminder.reminder_time.desc()).all()
    
    history = db.query(Reminder).join(Task).filter(
        Task.user_id == current_user.id,
        Reminder.status != "Pending"
    ).order_by(Reminder.reminder_time.desc()).limit(50).all()

    return {
        "upcoming": map_reminders(upcoming),
        "missed": map_reminders(missed),
        "history": map_reminders(history)
    }
