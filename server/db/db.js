import pkg from "pg";
const { Pool } = pkg;

// postgres connection pool — shared across the app
// uses env variables when running in docker, falls back to local defaults
export const pool = new Pool({
    user: process.env.DB_USER || "postgres",
    host: process.env.DB_HOST || "localhost",
    database: process.env.DB_NAME || "speed_db",
    password: process.env.DB_PASSWORD || "howdikshant",
    port: parseInt(process.env.DB_PORT || "5432"),
});