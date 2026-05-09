# Smart Warehouse Management System (WMS)
A modern, enterprise-grade warehouse solution built with **Django** and **React**. Designed for high-efficiency inventory tracking with real-time analytics and QR-based automation.

## 🚀 Key Features
- **Real-time Dashboard:** Visual stock level monitoring using Recharts.
- **QR Code Integration:** Instant "Stock-In" via webcam scanning.
- **AI Command Assistant:** Chat-based inventory management (e.g., "add 10 LAP-001").
- **Full CRUD:** Register new item types, update stock, or delete obsolete records.
- **Security:** Secure Employee Login system using **JWT (JSON Web Tokens)**.
- **Search & Filter:** Instantly locate items by Name or SKU.

## 🛠️ Tech Stack
- **Backend:** Python, Django, Django REST Framework
- **Frontend:** React.js, Axios, Recharts, HTML5-QRCode
- **Database:** SQLite (Development) / Oracle SQL (Enterprise Ready)
- **Security:** JWT Authentication


## 🗄️ Database Configuration (Oracle SQL)
This system is designed to be database-agnostic. While it ships with SQLite for rapid development, it is fully optimized for **Oracle Database 19c/21c**.

### Switching to Oracle SQL
To transition the system to an enterprise Oracle environment, update `backend/warehouse_root/settings.py`:

```python
# settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.oracle',
        'NAME': 'localhost:1521/xe',  # Your Oracle SID/Service Name
        'USER': 'warehouse_admin',
        'PASSWORD': 'your_secure_password',
        'HOST': 'localhost',
        'PORT': '1521',
        'OPTIONS': {
            'threaded': True,
        },
    }
}

## 📦 Installation & Setup

### Backend
1. `cd backend`
2. `python -m venv venv`
3. `source venv/bin/activate` (or `venv\Scripts\activate` on Windows)
4. `pip install -r requirements.txt`
5. `python manage.py migrate`
6. `python manage.py runserver`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm start`

## 💡 Industry Relevance
This project addresses real-world logistics challenges by automating manual data entry via QR codes and providing an audit-ready interface for warehouse staff.