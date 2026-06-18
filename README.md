# AgriFuture - Smart Agriculture Advisory System

A modern, responsive full-stack web application designed for farmers in India to identify state-wise crops, matching soil types, common diseases, recommended chemicals, safety precautions, and best agricultural practices. It includes a complete Admin CRUD Panel and an AI Leaf Disease Detection simulation.

## Project Structure

```
smart-agriculture-system/
│
├── backend/
│   ├── app.py                # Flask application entry point with REST APIs
│   ├── models.py             # SQLAlchemy models (States, Crops, Soils, Diseases, Chemicals)
│   ├── seed.py               # Database seeder with realistic Indian agricultural data
│   ├── requirements.txt      # Python dependencies
│   └── agriculture.db        # SQLite database (auto-created on startup)
│
├── frontend/
│   ├── index.html            # Entry HTML document with Outfit & Inter fonts
│   ├── tailwind.config.js    # Tailwind configuration for custom agriculture color palette
│   ├── postcss.config.js     # PostCSS settings
│   ├── package.json          # Node packages and scripts
│   └── src/
│       ├── main.jsx          # React app mount
│       ├── App.jsx           # Single-page application containing all 10 modules
│       └── index.css         # Styling system, custom scrollbars, and animations
│
└── README.md                 # Setup and documentation guide
```

---

## Getting Started

### 1. Setup the Python Flask Backend

1. Navigate to the `backend/` directory.
2. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the Flask application:
   ```bash
   python app.py
   ```
   *Note:* On startup, the Flask backend will automatically check if the database is empty. If it is, it will auto-create the schema and seed the database with all 28 states, 50 crops, 20 soils, 100 diseases, and 100 chemicals!

### 2. Setup the React Frontend

1. Open a new terminal and navigate to the `frontend/` directory.
2. Install the Node packages:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open the URL shown in your terminal (usually `http://localhost:5173`) in your web browser.

---

## Database Configuration

The application is built using **SQLAlchemy** to offer seamless support for both local development (using SQLite) and production deployment (using MySQL).

### Option A: SQLite (Default - Recommended for instant test)
By default, the application runs on **SQLite**. A database file named `agriculture.db` will be created inside the `backend/` folder on startup and seeded automatically. No database setup or server is required.

### Option B: MySQL (Production Ready)
To switch to a MySQL database:
1. Create a `.env` file inside the `backend/` directory.
2. Add your MySQL connection string under the `DATABASE_URL` variable:
   ```env
   DATABASE_URL=mysql+pymysql://username:password@localhost:3306/your_database_name
   ```
3. Re-run `python app.py`. SQLAlchemy will automatically connect to your MySQL database, create the tables, and seed the data!
