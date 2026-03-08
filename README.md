# Real-Time Speedometer

A full-stack app that simulates vehicle speed sensor data, stores it in PostgreSQL, and displays it on a live speedometer UI using WebSockets.

Built with Node.js, Express, PostgreSQL, React, and Docker.

---

## How It Works

The system has three main parts:

1. **Sensor simulator** — runs on the server, generates a random speed value every second (using a random walk between 0–120 km/h), and inserts it into the database
2. **WebSocket server** — after each insert, reads the latest speed back from PostgreSQL and pushes it to all connected clients
3. **React frontend** — connects to the WebSocket, receives speed updates, and renders them on a speedometer gauge in real-time

The key thing here is that the UI always reflects what's stored in the database, not just an in-memory value. The server writes to Postgres first, reads back the latest row, and only then broadcasts it.

---

## Architecture

```
┌────────────────────┐
│  Sensor Simulator  │
│  (generates speed) │
└────────┬───────────┘
         │ INSERT
         ▼
┌────────────────────┐
│    PostgreSQL      │
│   (speed_data)     │
└────────┬───────────┘
         │ SELECT latest
         ▼
┌────────────────────┐        WebSocket         ┌──────────────────┐
│  Node.js Server    │ ──────────────────────▶  │  React Client    │
│  (Express + WS)    │     { speed: 42 }        │  (Speedometer)   │
└────────────────────┘                          └──────────────────┘
```

Data flows one way: **generate → store → read → broadcast → display**.

---

## Project Structure

```
unbox-assignment/
├── server/
│   ├── server.js                 # express + websocket setup
│   ├── services/
│   │   └── sensorSimulator.js    # speed generation + db insert + ws broadcast
│   ├── db/
│   │   ├── db.js                 # postgres connection pool
│   │   └── init.sql              # table creation (used by docker)
│   ├── Dockerfile
│   └── .dockerignore
├── client/
│   ├── src/
│   │   ├── App.tsx               # main component, manages ws connection
│   │   ├── components/
│   │   │   └── Speedometer.tsx   # gauge component (react-d3-speedometer)
│   │   └── services/
│   │       └── websocket.ts      # websocket client logic
│   ├── Dockerfile
│   └── .dockerignore
└── docker-compose.yml            # runs everything together
```

---

## Running with Docker

Make sure Docker Desktop is installed and running.

```bash
git clone https://github.com/howdikshant/unbox-assignment.git
cd unbox-assignment
docker-compose up --build
```

This starts three containers:
- **db** — PostgreSQL 16, creates the `speed_data` table automatically via `init.sql`
- **server** — Node.js backend on port 8080, waits for Postgres to be healthy before starting
- **client** — Vite dev server on port 5173

Once everything is up, open **http://localhost:5173** in your browser.

To stop:
```bash
docker-compose down
```

---

## Running Locally (without Docker)

You'll need Node.js and PostgreSQL installed.

**1. Set up the database:**
```sql
CREATE DATABASE speed_db;

\c speed_db

CREATE TABLE speed_data (
  id SERIAL PRIMARY KEY,
  speed INTEGER NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**2. Start the server:**
```bash
cd server
npm install
node server.js
```

**3. Start the client:**
```bash
cd client
npm install
npm run dev
```

Open **http://localhost:5173**.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React, TypeScript, Vite, react-d3-speedometer |
| Backend | Node.js, Express, ws (WebSocket) |
| Database | PostgreSQL |
| Containerization | Docker, Docker Compose |

---

## How the Sensor Simulator Works

The speed value doesn't jump randomly — it uses a random walk to feel more realistic:

```
each second:
  change = random integer between -5 and +5
  speed = speed + change
  clamp speed to [0, 120]
```

This means the speed gradually increases and decreases rather than teleporting between values, which makes the speedometer animation look smoother.

---

## Docker Setup Details

The project uses three containers orchestrated by `docker-compose.yml`:

- **PostgreSQL** uses a healthcheck (`pg_isready`) so the server doesn't try to connect before the database is ready
- **Server** connects to Postgres using the Docker service name (`db`) as the hostname instead of `localhost`
- **Client** runs Vite with `--host` flag so it's accessible from outside the container
- The `init.sql` file is mounted into Postgres's init directory so the table is created on first boot
- Database credentials are passed as environment variables, with the code falling back to local defaults when not running in Docker
