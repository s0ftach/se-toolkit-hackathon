# GymTrack

A web application where gym-goers log their workouts via a simple form, stored in a database and visualized as personal progress charts on a dashboard.

## Demo

> *Replace with actual screenshots once the app is running.*
> 
> Screenshot 1 — Log Workout form: Shows the exercise selector, weight/reps inputs, and today's workout table.
> 
> Screenshot 2 — Progress Chart: Shows a line chart of weight-over-time for a selected exercise.

## Product Context

**End users:** Students and young people who go to the gym regularly.

**Problem:** People track their workouts in notes or in their head and lose progress history — they can't see if they're actually improving.

**Solution:** A web application where users log exercises by selecting from a dropdown, entering weight and reps, and then view their personal progress with interactive charts showing improvement over time.

## Features

### Implemented
- **User registration & login** — create an account with username + password, authenticated via JWT tokens
- **Log a workout** — select an exercise from a dropdown, enter weight and reps, data is saved to the database
- **Today's workout** — see all sets you've logged today at a glance
- **Progress chart** — view a weight-over-time line chart for any exercise you've logged
- **Workout history** — browse your last 30 logged sets in a table
- **Responsive design** — works on desktop and mobile browsers

### Not yet implemented
- Personal records (PR) detection and notifications
- Custom exercise names (users can only pick from a predefined list)
- Multiple sets per workout session grouping (sets are logged individually)
- Volume tracking (total sets × reps × weight per session)

## Usage

1. Open the web app in your browser at `http://<vm-ip>/`
2. Create an account by entering a username and password, then click **Create Account**
3. Go to **Log Workout** tab, pick an exercise, enter weight and reps, click **Save**
4. Switch to the **Progress** tab to see your improvement over time as a line chart
5. Check the **History** tab for your full workout log

## Deployment

**OS:** Ubuntu 24.04

### Quick Deploy (recommended)

```bash
cd ~
git clone https://github.com/s0ftach/se-toolkit-hackathon.git
cd se-toolkit-hackathon

chmod +x deploy.sh
./deploy.sh
```

The script will:
1. Install Docker if not present
2. Generate a secure `.env` file with a random JWT secret
3. Open firewall ports (if UFW is active)
4. Build and start all containers

### Manual Deploy

```bash
cd ~
git clone https://github.com/s0ftach/se-toolkit-hackathon.git
cd se-toolkit-hackathon

cp .env.production .env
# Edit .env: JWT_SECRET will be auto-generated or set manually
# To change ports, edit HOST_PORT (default: 80)

docker compose up -d --build
```

The web app will be available at `http://<your-vm-ip>/`.

**Services:**
- **Frontend** — Caddy reverse proxy + static HTML/JS (port 80)
- **Backend** — FastAPI + Uvicorn + aiosqlite (internal port 8000)
- **Database** — SQLite (stored in Docker volume, persistent)

> SQLite is a serverless, zero-configuration, transactional SQL database engine.
> It fulfills the "database" requirement and simplifies deployment — only one service to run.

### Firewall Setup

If UFW is enabled on your VM:
```bash
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS (optional)
```

### Port Configuration

By default the app runs on port 80. To change it, edit `.env`:
```
HOST_PORT=8080    # App will be available at http://<vm-ip>:8080
BACKEND_PORT=8000 # API will be available at http://<vm-ip>:8000/api
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.12, FastAPI, Uvicorn, aiosqlite, Pydantic, PyJWT |
| Database | SQLite 3 |
| Frontend | Vanilla HTML/CSS/JS, Chart.js 4 |
| Orchestration | Docker Compose v2 |
