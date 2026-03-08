# Real-Time Speedometer

A full stack app that simulates vehicle speed sensor data, stores it in PostgreSQL, and displays it on a live speedometer UI using WebSockets.

Built with Node.js, Express, PostgreSQL, React, and Docker.

## How It Works

The system has three main parts:

1. **Sensor simulator**  
Runs on the server and generates a random speed value every second using a random walk between 0–120 km/h. The value is then inserted into the database.

2. **WebSocket server**  
After each insert, the server reads the latest speed from PostgreSQL and pushes it to all connected clients.

3. **React frontend**  
Connects to the WebSocket server, receives speed updates, and renders them on a speedometer gauge in real time.

The key thing here is that the UI always reflects what is stored in the database rather than an in memory value. The server writes to Postgres first, reads back the latest row, and only then broadcasts it.

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

## Running with Docker

Make sure Docker Desktop is installed and running.

```bash
git clone https://github.com/howdikshant/unbox-assignment.git
cd unbox-assignment
docker-compose up --build
```

This starts three containers:

**db**  
PostgreSQL 16. It creates the `speed_data` table automatically using `init.sql`.

**server**  
Node.js backend running on port 8080. It waits for Postgres to become healthy before starting.

**client**  
Vite dev server running on port 5173.

Once everything is running, open:

```
http://localhost:5173
```

To stop the containers:

```bash
docker-compose down
```

## Running Locally (without Docker)

You will need Node.js and PostgreSQL installed.

### 1. Set up the database

```sql
CREATE DATABASE speed_db;

\c speed_db

CREATE TABLE speed_data (
  id SERIAL PRIMARY KEY,
  speed INTEGER NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Start the server

```bash
cd server
npm install
node server.js
```

### 3. Start the client

```bash
cd client
npm install
npm run dev
```

Then open:

```
http://localhost:5173
```

## Tech Stack

| Layer | Tech |
|------|------|
| Frontend | React, TypeScript, Vite, react-d3-speedometer |
| Backend | Node.js, Express, ws (WebSocket) |
| Database | PostgreSQL |
| Containerization | Docker, Docker Compose |

## How the Sensor Simulator Works

The speed value does not jump randomly. It uses a random walk so that changes feel more realistic.

```
each second:
  change = random integer between -5 and +5
  speed = speed + change
  clamp speed to [0, 120]
```

Because of this, the speed gradually increases or decreases instead of jumping between unrelated values. This makes the speedometer animation smoother.

## Docker Setup Details

The project runs using three containers managed by `docker-compose.yml`.

**PostgreSQL**  
Uses a healthcheck with `pg_isready` so the server does not try to connect before the database is ready.

**Server**  
Connects to Postgres using the Docker service name `db` as the hostname instead of localhost.

**Client**  
Runs the Vite dev server with the `--host` flag so it can be accessed outside the container.

The `init.sql` file is mounted into Postgres's initialization directory so the table is created automatically on first boot.

Database credentials are provided through environment variables. When the project runs locally without Docker, the code falls back to default values.
