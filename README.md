# Real-Time Speedometer

A full stack app that simulates vehicle speed sensor data, stores it in PostgreSQL, and displays it on a live speedometer UI using WebSockets.

Built with Node.js, Express, PostgreSQL, React, and Docker.

---

## How It Works

The system has three main parts:

1. **Sensor simulator**  
Runs on the server and generates a random speed value every second using a random walk between 0–120 km/h. The value is then inserted into the database.

2. **WebSocket server**  
After each insert, the server reads the latest speed from PostgreSQL and pushes it to all connected clients.

3. **React frontend**  
Connects to the WebSocket server, receives speed updates, and renders them on a speedometer gauge in real time.

The key thing here is that the UI always reflects what is stored in the database rather than an in memory value. The server writes to Postgres first, reads back the latest row, and only then broadcasts it.

---

## Architecture
