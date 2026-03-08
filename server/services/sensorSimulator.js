import { pool } from "../db/db.js";

// simulates a vehicle speed sensor by generating realistic-ish speed values
// every second, it tweaks the speed randomly, saves it to postgres,
// then broadcasts the db-stored value to all connected websocket clients
export function startSensorSimulator(wss) {

    let speed = 0;

    setInterval(async () => {

        // random walk: nudge speed by -5 to +5 each tick
        const change = Math.floor(Math.random() * 11) - 5;
        speed += change;

        // clamp to valid range
        if (speed < 0) speed = 0;
        if (speed > 120) speed = 120;

        console.log("Generated speed:", speed);

        try {

            // persist to postgres
            await pool.query(
                "INSERT INTO speed_data(speed) VALUES($1)",
                [speed]
            );

            // pull latest from db (instead of just using the in-memory value)
            // this way the UI is always showing what's actually in the database
            const result = await pool.query(
                "SELECT speed FROM speed_data ORDER BY id DESC LIMIT 1"
            );
            const dbSpeed = result.rows[0].speed;

            // push to every connected client
            wss.clients.forEach((client) => {
                if (client.readyState === 1) {
                    client.send(JSON.stringify({ speed: dbSpeed }));
                }
            });

        } catch (err) {

            console.error("DB error:", err);

        }

    }, 1000);

}