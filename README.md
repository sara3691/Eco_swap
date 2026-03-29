# ECOSWAP – AI Sustainable Shopping Assistant

## 🚀 Overview
ECOSWAP is a production-ready full-stack application designed to help users make more sustainable shopping choices using AI. It evaluates products for their environmental impact using AI, detects greenwashing, and suggests authenticated eco-friendly alternatives.

## ✨ Key Features & Current Functionality
- **AI Sustainability Analysis**: Uses Google Gemini API to analyze physical products, compute "eco-scores", and break down environmental impacts.
- **Greenwashing Detection**: Identifies and flags false eco-friendly claims.
- **Intelligent Alternatives & Image Fetching**: Fetches viable eco-friendly product alternatives across the web using SerpAPI, and dynamically pulls relevant high-quality images via the Unsplash API.
- **Interactive Eco-Assistant Chat**: A built-in chat interface to answer user questions about sustainability, green practices, and product impacts.
- **Authentication System**: A simple user login/registration flow allowing individuals to track their progress and participate in the community without complex OAuth setups.
- **Search History Tracking**: Users can view their previous product searches and analyses in a dedicated History view.
- **Gamification & Impact Tracking**: Users earn an Impact Score (fixed at 20 points per valid new search) and progress through various eco-badges. Points are protected by anti-exploit mechanisms to ensure fair growth. Progress is visualized in the 'Eco Growth Journey' and 'Eco Impact Community' leaderboards.
- **Premium, Modern UI**: A fully functional, dark-themed frontend built with React, Tailwind CSS, Lucide Icons, and Framer Motion for premium user interactions and micro-animations.

## 🛠 Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Axios, Lucide React.
- **Backend**: Python (Flask framework).
- **Database**: SQLite (`ecoswap.db`), maintaining tables for users, search history logs, and points/badges tracking.
- **AI & External APIs**: 
  - Google Generative AI (Gemini)
  - SerpAPI (Google Shopping Search engine)
  - Unsplash API (Image Provider)

## 📦 Setup & Installation

### 1. Prerequisites
- Python 3.10+
- Node.js 18+

### 2. Environment Variables
Create a `.env` file in the `backend/` directory based on `.env.example`:
```env
GEMINI_API_KEY=your_key
SERP_API_KEY=your_key
UNSPLASH_ACCESS_KEY=your_key
```

### 3. Run the Application
Start Backend:
```bash
cd backend
python app.py
```

Start Frontend:
```bash
cd frontend
npm run dev
```

*(Alternatively, if running from root using npm concurrently:)*
```bash
npm run install:all  # Install all deps
npm start            # Run frontend & backend concurrently
```

## 🏗 Architecture & Active Modules

### Backend (`/backend`)
- **`app.py`**: The main Flask entry point handling REST API routes, user sessions (login/logout state), chat requests, history endpoints, and frontend communication.
- **`ai_engine.py`**: Interacts with the Google Gemini API to parse product data and generate structured sustainability reports and scores.
- **`database.py`**: Handles SQLite/PostgreSQL schema initialization. Manages account creation, secure login, score updates, badge assignment, and history logging.
- **`product_fetcher.py`**: Queries SerpAPI to find eco-friendly alternatives for a given product search.
- **`image_fetch.py`**: Communicates with the Unsplash API to attach relevant background images to product alternatives.
- **`test_modules.py` & `check_db.py`**: Utility scripts for testing individual module functionality and verifying database state.

### Frontend (`/frontend/src`)
- **Core Setup**: `App.jsx`, `main.jsx`, `index.css` (Handles the global dark theme, specific custom CSS styling, and routing/state).
- **Component Modules (`/src/components`)**:
  - `Header.jsx`, `Hero.jsx`: Main navigation bar (featuring Login/Logout/History toggles) and landing section.
  - `LoginModal.jsx`: Interface for simple user registration and login.
  - `AnalysisResult.jsx`, `AISuggestions.jsx`, `Alternatives.jsx`: Core components reponsible for rendering the AI's sustainability breakdown, scores, and alternative product recommendations dynamically.
  - `History.jsx`: Replaced the legacy dashboard; allows users to review their previous product queries.
  - `EcoGrowthJourney.jsx`: Visualizes a user's current badge and points progress towards their next environmental impact rank.
  - `EcoImpactCommunity.jsx`: A leaderboard view allowing users to see community impact points and rankings.
  - `EcoAssistantChat.jsx`: The direct window for interacting directly with the AI assistant.
