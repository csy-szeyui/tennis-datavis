# tennis-datavis

React.js Frontend (Vite buildtool, Redux state management, React Router routing)

Python Backend (Flask framework)

PostgreSQL database

# Citations

- Icon used in frontend web application: Flaticon.com

- Datasets:

1. ATP Tennis Rankings, Results, and Stats dataset from Jeff Sackmann / Tennis Abstract (https://github.com/JeffSackmann/tennis_atp)

   The data used in the database is excerpted from the original dataset.
   
2. One-handed Backhand Player Rankings from Tennis Abstract (https://tennisabstract.com/reports/oneHandBackhandRankings.html)
3. ATP Surface Speed Ratings from Tennis Abstract (https://tennisabstract.com/reports/atp_surface_speed.html)

# Database Setup

1. With psql, run

     `psql -U username -d database_name -f /path/to/tennis.sql`

2. Modify dbname, user, password of psycopg2.connect in pages\api.py file according to your own setup

# How to Run Web Application

1. Run pages\api.py file to run backend code
2. Run npm run dev in terminal for frontend application

- Backend can be accessed at http://localhost:5000/
- Frontend can be accessed at http://localhost:5173/
- Database SQL file: tennis.sql

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

Chan Sze Yui_57140032_24CS118_Web Application for Visualizing Tennis Data
