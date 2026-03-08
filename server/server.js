import express from "express";
import { WebSocketServer } from "ws";
import cors from "cors";
import { startSensorSimulator } from "./services/sensorSimulator.js";
import { pool } from "./db/db.js";

const app = express();
app.use(cors());

const PORT = 8080;

async function startServer() {

    try {

        // make sure postgres is reachable before doing anything else
        const res = await pool.query("SELECT NOW()");
        console.log("Connected to Postgres:", res.rows[0]);

        // wipe previous runs so we start fresh every time
        await pool.query("TRUNCATE TABLE speed_data");
        console.log("Old speed data cleared");

    } catch (err) {

        console.error("Postgres connection error:", err);
        process.exit(1);

    }

    // spin up express, then attach websocket server on the same port
    const server = app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });

    const wss = new WebSocketServer({ server });

    wss.on("connection", (socket) => {
        console.log("Client connected");

        socket.on("close", () => {
            console.log("Client disconnected");
        });
    });

    // kick off the speed data generation loop
    startSensorSimulator(wss);

}

startServer();