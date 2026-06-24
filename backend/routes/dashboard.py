from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, date

from database import get_db
from models import User, Task, Reminder
from schemas import DashboardStats
from dependencies import get_current_user
from typing import Dict, Any

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats", response_model=Dict[str, Any])
def get_dashboard_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    now = datetime.utcnow()
    today = date.today()

    # Reminders query
    user_reminders = db.query(Reminder).join(Task).filter(Task.user_id == current_user.id)
    
    total_reminders = user_reminders.count()
    
    todays_reminders = 0
    pending_reminders = 0
    completed_reminders = 0
    overdue_reminders = 0

    for rem in user_reminders.all():
        if rem.reminder_time.date() == today:
            todays_reminders += 1
        
        if rem.status == "Completed":
            completed_reminders += 1
        elif rem.status == "Pending":
            if rem.reminder_time < now:
                overdue_reminders += 1
            else:
                pending_reminders += 1

    return {
        "total_reminders": total_reminders,
        "todays_reminders": todays_reminders,
        "pending_reminders": pending_reminders,
        "completed_reminders": completed_reminders,
        "overdue_reminders": overdue_reminders
    }
