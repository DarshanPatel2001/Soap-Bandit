# Soap Banditt – Backend

This backend powers the API for the Soap bandit via FASTAPI.

The backend is built using:

- Python
- FastAPI
- Uvicorn
- Requests

---

# Project Structure

```
Backend/
│
├── app/
│   ├── main.py
│   │
│   ├── routes/
│   │   └── ingredients.py
│   │
│   ├── services/
│   │   └── pubchem_service.py
│   │
│   ├── models/
│   │
│   └── config/
│
├── requirements.txt
├── .env
└── README.md
```

Folder roles:

- **services** – external API integrations (PubChem, etc.)
- **main.py** – backend entry point

---

# Backend Setup (First Time Only)

### 1. Navigate to Backend

```
cd Backend
```

---

### 2. Create Virtual Environment

```
py -m venv venv
```

---

### 3. Activate Environment

Windows:

```
venv\Scripts\activate
```

Terminal should now show:

```
(venv)
```

---

### 4. Install Dependencies

```
pip install -r requirements.txt
```

---

# Running the Backend Server

Start the development server:

```
py -m uvicorn app.main:app --reload
```

The API server will run at:

```
http://127.0.0.1:8000
```

# Adding New API Integrations

External datasets recommended to be added inside the **services** folder.

# Development Notes

- Always activate the virtual environment before running the backend.
- Do not commit the `venv` folder to Git.
- Install new packages using:

```
pip install <package>
```

Then update dependencies:

```
pip freeze > requirements.txt
```

---

# Tech Stack

Backend framework: **FastAPI**

Server: **Uvicorn**

HTTP requests: **Requests**

Environment management: **python-dotenv**

---

# Contribution Workflow

1. Pull latest changes
2. Activate virtual environment
3. Install requirements
4. Run server
5. Develop features in separate modules

---

# Maintainers

Christabel Obi-Nwosu
Thang Hua
Darshan Patel
MMeet
