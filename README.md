# TaskFlow 📋

TaskFlow is a mobile task and reminder management application built using React Native, Expo, FastAPI, and SQLite. It helps users organize tasks, set reminders, receive notifications, and manage daily activities efficiently.

## 🚀 Features

- User Registration & Login
- Create, Edit, and Delete Tasks
- Reminder Notifications
- Task Status Management
- Daily Task Tracking
- Mobile-Friendly Interface
- Cloud Backend Deployment using Render

## 🛠️ Tech Stack

### Frontend
- React Native
- Expo
- Zustand
- Axios

### Backend
- FastAPI
- SQLite
- SQLAlchemy
- Uvicorn

### Deployment
- GitHub
- Render

## 📂 Project Structure

```text
Taskflow/
├── backend/
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── dependencies.py
│   └── requirements.txt
│
├── frontend/
│   ├── App.js
│   ├── screens/
│   ├── components/
│   ├── services/
│   ├── store/
│   └── android/
```

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/ashmigifta26/Taskflow.git
cd Taskflow
```

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs on:

```text
http://localhost:8000
```

### Frontend Setup

```bash
cd frontend
npm install
npx expo start
```

## 🌐 Deployment

Backend is deployed on Render and connected to the mobile application for online access.

## 🎯 Future Enhancements

- PostgreSQL Migration
- Push Notification Improvements
- Task Categories
- Dark Mode
- Analytics Dashboard
- Multi-User Collaboration

## 👩‍💻 Developer

**Ashmi Gifta**

GitHub: https://github.com/ashmigifta26

## 📄 License

This project is developed for educational and learning purposes.
