"""GymTrack — FastAPI backend with user auth and SQLite."""

import sys
import asyncio
import aiosqlite
import os
import hashlib
import secrets
import jwt
from pathlib import Path
from fastapi import FastAPI, HTTPException, Depends, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import HTMLResponse
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timedelta, timezone

app = FastAPI(title="GymTrack API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

JWT_SECRET = os.environ.get("JWT_SECRET", secrets.token_hex(32))
JWT_ALGO = "HS256"
JWT_EXPIRE_HOURS = 72

DB_PATH = Path(__file__).parent.parent / "data" / "gymtrack.db"
DB_PATH.parent.mkdir(parents=True, exist_ok=True)

security = HTTPBearer(auto_error=False)

EXERCISES = [
    "Bench Press",
    "Squat",
    "Deadlift",
    "Overhead Press",
    "Pull-up",
    "Barbell Row",
    "Leg Press",
    "Lat Pulldown",
    "Dumbbell Curl",
    "Tricep Extension",
    "Leg Curl",
    "Calf Raise",
]

_db: Optional[aiosqlite.Connection] = None


async def get_db() -> aiosqlite.Connection:
    global _db
    if _db is None:
        print("INFO: Opening SQLite database...", flush=True, file=sys.stderr)
        _db = await aiosqlite.connect(str(DB_PATH))
        _db.row_factory = aiosqlite.Row
        # Enable WAL mode for better concurrency
        await _db.execute("PRAGMA journal_mode=WAL")
        # Create tables
        await _db.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                salt TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        await _db.execute("""
            CREATE TABLE IF NOT EXISTS sets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL REFERENCES users(id),
                exercise TEXT NOT NULL,
                weight_kg REAL NOT NULL,
                reps INTEGER NOT NULL,
                logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        await _db.commit()
        print("INFO: SQLite database initialized", flush=True, file=sys.stderr)
    return _db


def hash_password(password: str, salt: str) -> str:
    return hashlib.sha256(f"{salt}{password}".encode()).hexdigest()


def create_token(user_id: int, username: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRE_HOURS)
    return jwt.encode(
        {"sub": str(user_id), "username": username, "exp": expire},
        JWT_SECRET,
        algorithm=JWT_ALGO,
    )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGO])
        return {"id": int(payload["sub"]), "username": payload["username"]}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError as e:
        print(f"JWT decode error: {type(e).__name__}: {e}", flush=True, file=sys.stderr)
        print(f"JWT_SECRET: {JWT_SECRET[:8]}...", flush=True, file=sys.stderr)
        raise HTTPException(status_code=401, detail=f"Invalid token: {e}")


# --- Models ---
class RegisterIn(BaseModel):
    username: str = Field(..., min_length=3, max_length=32)
    password: str = Field(..., min_length=4)


class LoginIn(BaseModel):
    username: str
    password: str


class TokenOut(BaseModel):
    access_token: str


class SetIn(BaseModel):
    exercise: str
    weight_kg: float = Field(..., gt=0)
    reps: int = Field(..., ge=1)


# --- API Router with /api prefix ---
api = APIRouter(prefix="/api")


@api.post("/auth/register", response_model=TokenOut)
async def register(reg: RegisterIn, db: aiosqlite.Connection = Depends(get_db)):
    cursor = await db.execute(
        "SELECT id FROM users WHERE username = ?", (reg.username,)
    )
    existing = await cursor.fetchone()
    if existing:
        raise HTTPException(status_code=400, detail="Username already taken")
    salt = secrets.token_hex(16)
    pw_hash = hash_password(reg.password, salt)
    cursor = await db.execute(
        "INSERT INTO users (username, password_hash, salt) VALUES (?, ?, ?)",
        (reg.username, pw_hash, salt),
    )
    await db.commit()
    user_id = cursor.lastrowid
    token = create_token(user_id, reg.username)
    return TokenOut(access_token=token)


@api.post("/auth/login", response_model=TokenOut)
async def login_endpoint(log: LoginIn, db: aiosqlite.Connection = Depends(get_db)):
    cursor = await db.execute(
        "SELECT id, username, password_hash, salt FROM users WHERE username = ?",
        (log.username,),
    )
    row = await cursor.fetchone()
    if not row:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if hash_password(log.password, row["salt"]) != row["password_hash"]:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token(row["id"], row["username"])
    return TokenOut(access_token=token)


@api.get("/health")
async def health():
    return {"status": "ok", "version": "2.0.0"}


@api.get("/exercises")
async def list_exercises():
    return EXERCISES


@api.post("/sets", status_code=201)
async def log_set(
    s: SetIn,
    user: dict = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db),
):
    cursor = await db.execute(
        "INSERT INTO sets (user_id, exercise, weight_kg, reps) VALUES (?, ?, ?, ?)",
        (user["id"], s.exercise, s.weight_kg, s.reps),
    )
    await db.commit()
    row_id = cursor.lastrowid
    return {
        "id": row_id,
        "user_id": user["id"],
        "exercise": s.exercise,
        "weight_kg": s.weight_kg,
        "reps": s.reps,
    }


@api.get("/sets")
async def get_sets(
    user: dict = Depends(get_current_user),
    exercise: Optional[str] = None,
    limit: Optional[int] = 20,
    db: aiosqlite.Connection = Depends(get_db),
):
    if exercise:
        cursor = await db.execute(
            "SELECT * FROM sets WHERE user_id=? AND exercise=? ORDER BY logged_at ASC",
            (user["id"], exercise),
        )
    else:
        cursor = await db.execute(
            "SELECT * FROM sets WHERE user_id=? ORDER BY logged_at DESC LIMIT ?",
            (user["id"], limit),
        )
    rows = await cursor.fetchall()
    return [
        {
            "id": r["id"],
            "user_id": r["user_id"],
            "exercise": r["exercise"],
            "weight_kg": r["weight_kg"],
            "reps": r["reps"],
            "logged_at": r["logged_at"],
        }
        for r in rows
    ]


@api.delete("/sets/{set_id}", status_code=204)
async def delete_set(
    set_id: int,
    user: dict = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db),
):
    """Delete a set."""
    cursor = await db.execute(
        "DELETE FROM sets WHERE id=? AND user_id=?", (set_id, user["id"])
    )
    await db.commit()
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Set not found")
    return None


@api.get("/sets/today")
async def get_today_sets(
    user: dict = Depends(get_current_user), db: aiosqlite.Connection = Depends(get_db)
):
    """Return sets logged today."""
    cursor = await db.execute(
        "SELECT * FROM sets WHERE user_id=? AND date(logged_at) = date('now') ORDER BY logged_at DESC",
        (user["id"],),
    )
    rows = await cursor.fetchall()
    return [
        {
            "id": r["id"],
            "user_id": r["user_id"],
            "exercise": r["exercise"],
            "weight_kg": r["weight_kg"],
            "reps": r["reps"],
            "logged_at": r["logged_at"],
        }
        for r in rows
    ]


@api.get("/user/exercises")
async def get_user_exercises(
    user: dict = Depends(get_current_user), db: aiosqlite.Connection = Depends(get_db)
):
    """Return distinct exercises this user has logged."""
    cursor = await db.execute(
        "SELECT DISTINCT exercise FROM sets WHERE user_id=? ORDER BY exercise",
        (user["id"],),
    )
    rows = await cursor.fetchall()
    return [r["exercise"] for r in rows]


# --- Serve frontend ---
@app.get("/")
async def serve_frontend():
    static_file = Path(__file__).parent.parent / "static" / "index.html"
    if static_file.exists():
        return HTMLResponse(content=static_file.read_text())
    raise HTTPException(status_code=404, detail="Frontend not found")


app.include_router(api)
