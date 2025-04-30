# 📘 BatchBuddy – Smart Timetable & Scheduling System for University Students

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-in%20development-yellow)]()
[![Built with Students](https://img.shields.io/badge/built%20by-SLIIT%20Undergraduates-blueviolet)]()

> BatchBuddy is a personalized academic assistant that helps university students manage their schedules, track attendance, and improve productivity using smart analytics and voice-powered interactions.

---


## 📌 Table of Contents

- [About](#about)
- [Objectives](#objectives)
- [Core Modules](#core-modules)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)

---

## 🧠 About

Many university students struggle with fragmented scheduling, forgotten events, and poor productivity. BatchBuddy solves this by offering a unified platform to view daily schedules, receive voice-assisted reminders, track attendance, and generate personalized analytics—all tailored for each student.

---

## 🎯 Objectives
- Simplify academic timetable access.
- Enable students to track attendance and productivity.
- Support voice commands for accessibility.
- Deliver real-time notifications and reminders.
- Provide admins with control over timetable management.
- Offer smart analytics for informed scheduling.

---

## 🧩 Core Modules

### 1. 👥 User Management System
- SLIIT-only secure registration/login
- Personalized dashboard with daily timetable
- Event details view (type, location, time)

### 2. 📈 Attendance & Productivity Tracker
- Manual and voice-based attendance marking
- Visual monthly reports and productivity insights

### 3. 🔔 Notification System with Voice Support
- Manual & voice-based reminder creation
- Text-to-speech timetable reading
- Automated alerts for exams, lectures, tasks

### 4. 🛠️ Admin Management & Smart Analytics
- Admin dashboard for schedule control
- PDF timetable upload with data extraction
- Event addition (reschedules, holidays)
- Analytics: attendance trends, study suggestions, reports

---

## 🛠️ Tech Stack

**Frontend**	 **Backend**	  **Database**	  **Other Tools**
React.js	      Node.js	       MongoDB	        Web Speech API 
HTML/CSS/JS     Express.js	   pgAdmin	        Axios, Cors
Tailwind CSS

---


## 🚀 Getting Started

### 📂 Backend Setup

**1. Install Prerequisites**
- Node.js
- PostgreSQL (Create a database and update example.env file)
- Maven

**2. Clone the Repository**
 ```bash
  git clone https://github.com/Pratheesha100/Aspira-Skill-Sharing-and-Learning-Platform-.git
  ```
  
**3. Configure the Database**
- MONGO_URI=`mongodb+srv://<username>:<password>@<cluster>/<database>?<options>`
- PORT=`Any port number`
  
**4. Run the Backend**

```bash
cd backend
npm install
npm start
```

---

### 🌐 Frontend Setup

**1. Navigate to the Frontend Directory**

```bash
 cd frontend
```
  
**2.Install Dependencies**

```bash
 npm install
```
  
**3.Start the React App**

```bash
 npm start
  
```



