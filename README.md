# Real-Time Speedometer

A full-stack application that simulates vehicle speed sensor data in real-time. Speed data is generated on the server, persisted to PostgreSQL, and streamed to the frontend via WebSockets – all displayed on a live speedometer gauge.

**Tech:** Node.js • Express • PostgreSQL • React • TypeScript • Docker

## How It Actually Works

This isn't just an in-memory simulation. The whole system is built around one core principle: **the UI always shows what's actually in the database**.

Here's the flow:

1. **The Sensor Simulator** generates a speed value every second (using a realistic random walk between 0–120 km/h) and inserts it into PostgreSQL
2. **The Server** reads that latest speed back from the database (not from memory)
3. **WebSockets** broadcast the data to all connected clients instantly
4. **The React App** receives the update and animates the speedometer gauge

Why read from the database instead of just using the in-memory value? Because if the app crashes or restarts, the UI always reflects what's actually persisted. It's more robust that way.

## System Architecture

```
┌─────────────────────┐
│ Sensor Simulator    │─┐
│ (generates speed)   │ │ INSERT every 1s
└─────────────────────┘ │
                        ▼
              ┌──────────────────┐
              │   PostgreSQL     │
              │  (speed_data)    │
              └────────┬─────────┘
                       │ SELECT latest
                       ▼
    ┌────────────────────────────────┐
    │    Node.js Server              │
    │  (Express + WebSocket)          │
    │                                │
    │  • Listens for DB updates      │
    │  • Broadcasts to all clients   │
    └────────────┬───────────────────┘
                 │ WebSocket
                 │ { speed: 42 }
                 ▼
         ┌──────────────────┐
         │  React Client    │
         │  • Connects      │
         │  • Receives      │
         │  • Animates      │
         └──────────────────┘
```

Everything flows in one direction: **generate → store → read → broadcast → display**. No shortcuts, no in-memory hacks.

## What's in the Code

```
unbox-assignment/
├── server/
│   ├── server.js                    # Express + WebSocket server setup
│   ├── services/
│   │   └── sensorSimulator.js       # Generates speed, inserts to DB, broadcasts via WS
│   ├── db/
│   │   ├── db.js                    # PostgreSQL connection pool
│   │   └── init.sql                 # Table schema (auto-runs in Docker)
│   ├── Dockerfile
│   └── package.json
├── client/
│   ├── src/
│   │   ├── App.tsx                  # Main component, manages WebSocket connection
│   │   ├── components/
│   │   │   └── Speedometer.tsx      # Speedometer gauge component
│   │   └── services/
│   │       └── websocket.ts         # WebSocket client logic
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.ts
└── docker-compose.yml               # Orchestrates all containers
```

**Key files to understand the flow:**
- `server/services/sensorSimulator.js` – Where speed gets generated and broadcast
- `server/server.js` – Where the WebSocket server lives
- `client/src/services/websocket.ts` – Where the client connects and listens
- `client/src/App.tsx` – The main React component that uses the WebSocket

## Getting Started with Docker

This is the easiest way to run everything.

**Prerequisites:** Docker Desktop installed and running.

```bash
git clone https://github.com/howdikshant/unbox-assignment.git
cd unbox-assignment
docker-compose up --build
```

That's it. Docker Compose will spin up three containers:

- **db** – PostgreSQL 16 with the `speed_data` table auto-created
- **server** – Node.js backend (waits for DB to be healthy before starting)
- **client** – Vite dev server with hot reload

Open your browser to **http://localhost:5173** and watch the speedometer update every second.

To stop:
```bash
docker-compose down
```

## Running Locally (No Docker)

If you prefer to run this without containers, you'll need Node.js and PostgreSQL installed locally.

### Setup the Database

```bash
createdb speed_db
psql speed_db
```

Then paste this into the psql prompt:

```sql
CREATE TABLE speed_data (
  id SERIAL PRIMARY KEY,
  speed INTEGER NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Start the Server

```bash
cd server
npm install
node server.js
```

The server will connect to `localhost:5432` by default. Make sure PostgreSQL is running.

### Start the Client

In a new terminal:

```bash
cd client
npm install
npm run dev
```

Head to **http://localhost:5173**.

## The Tech Stack

| Part | Technology |
|------|-----------|
| Frontend | React 18, TypeScript, Vite, react-d3-speedometer |
| Backend | Node.js, Express, ws (WebSocket library) |
| Database | PostgreSQL 16 |
| Deployment | Docker, Docker Compose |

Nothing fancy – just solid, proven tools that work well together.

## How the Speed Simulation Works

The speed doesn't jump around randomly – it changes gradually using a **random walk** algorithm. This makes the speedometer animation smooth and realistic.

**The algorithm (runs every second):**
```
change = random integer from -5 to +5
speed = speed + change
if speed < 0: speed = 0
if speed > 120: speed = 120
```

So if the current speed is 40 km/h, it might become 38, 39, 40, 41, 42, etc. – always believable, never erratic.

## Ports and Endpoints

- **Frontend:** http://localhost:5173
- **Backend WebSocket:** ws://localhost:8080
- **Database:** localhost:5432 (PostgreSQL)

**PostgreSQL**  
Uses a healthcheck with `pg_isready` so the server does not try to connect before the database is ready.

**Server**  
Connects to Postgres using the Docker service name `db` as the hostname instead of localhost.

**Client**  
Runs the Vite dev server with the `--host` flag so it can be accessed outside the container.

The `init.sql` file is mounted into Postgres's initialization directory so the table is created automatically on first boot.

Database credentials are provided through environment variables. When the project runs locally without Docker, the code falls back to default values.
