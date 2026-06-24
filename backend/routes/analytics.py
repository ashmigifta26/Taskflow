from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from database import get_db
from models import User, Task, Reminder
from dependencies import get_current_user
from typing import Dict, Any

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/productivity", response_model=Dict[str, Any])
def get_productivity(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user_reminders = db.query(Reminder).join(Task).filter(Task.user_id == current_user.id)
    
    total = user_reminders.count()
    completed = user_reminders.filter(Reminder.status == "Completed").count()
    pending = user_reminders.filter(Reminder.status == "Pending").count()
    overdue = user_reminders.filter(Reminder.status == "Pending", Reminder.reminder_time < datetime.utcnow()).count()
    
    completion_percentage = (completed / total * 100) if total > 0 else 0
    productivity_score = min(100, int((completed * 10) + (completion_percentage / 2)))

    # Weekly/Monthly activity placeholders (could be expanded)
    weekly_activity = [0] * 7 # placeholder for chart
    
    return {
        "total": total,
        "completed": completed,
        "pending": pending,
        "overdue": overdue,
        "completion_percentage": round(completion_percentage, 1),
        "productivity_score": productivity_score,
        "weekly_activity": weekly_activity,
        "monthly_activity": [],
        "most_productive_day": "Wednesday"
    }

@router.get("/suggestions", response_model=Dict[str, Any])
def get_suggestions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Basic logic: find when tasks were completed
    completed_reminders = db.query(Reminder).join(Task).filter(
        Task.user_id == current_user.id, 
        Reminder.status == "Completed",
        Reminder.completed_at != None
    ).all()

    hour_counts = {}
    for r in completed_reminders:
        hour = r.completed_at.hour
        hour_counts[hour] = hour_counts.get(hour, 0) + 1

    best_hours = sorted(hour_counts.items(), key=lambda x: x[1], reverse=True)[:3]
    suggestions = [f"{h:02d}:00 - {h+1:02d}:00" for h, count in best_hours]
    if not suggestions:
        suggestions = ["09:00 - 10:00", "13:00 - 14:00", "18:00 - 19:00"] # Defaults

    return {
        "optimal_times": suggestions,
        "insight": "You tend to complete most tasks during these hours."
    }

@router.get("/trends", response_model=Dict[str, Any])
def get_trends(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Return placeholder data structured for the charts
    return {
        "completion_trends": [10, 25, 40, 30, 50, 45],
        "most_active_category": "Work",
        "overdue_analysis": {"missed_mornings": 5, "missed_evenings": 2}
    }
