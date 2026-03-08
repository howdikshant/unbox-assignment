-- auto-creates the speed_data table when the postgres container starts up
CREATE TABLE IF NOT EXISTS speed_data (
  id SERIAL PRIMARY KEY,
  speed INTEGER NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
