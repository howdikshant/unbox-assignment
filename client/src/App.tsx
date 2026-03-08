import { useEffect, useState } from "react";
import Speedometer from "./components/Speedometer";
import { connectWebSocket } from "./services/websocket";

function App() {
  const [speed, setSpeed] = useState<number>(0);

  useEffect(() => {
    // open ws connection on mount, close it on unmount
    const socket = connectWebSocket(setSpeed);

    return () => {
      socket.close();
    };
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "40px" }}>
      <h1>Real-Time Speed Monitor</h1>

      <Speedometer speed={speed} />

      <h2>{speed} km/h</h2>
    </div>
  );
}

export default App;