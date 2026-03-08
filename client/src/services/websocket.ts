// connects to the backend websocket server and calls onSpeedUpdate
// whenever a new speed value comes in from the database
export function connectWebSocket(onSpeedUpdate: (speed: number) => void) {
    const socket = new WebSocket("ws://localhost:8080");

    socket.onopen = () => {
        console.log("Connected to WebSocket server");
    };

    socket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data.speed !== undefined) {
                onSpeedUpdate(data.speed);
            }
        } catch (err) {
            console.error("Invalid WebSocket message", err);
        }
    };

    socket.onclose = () => {
        console.log("WebSocket disconnected");
    };

    socket.onerror = (err) => {
        console.error("WebSocket error:", err);
    };

    return socket;
}