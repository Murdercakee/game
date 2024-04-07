const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

let players = {};

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        const data = JSON.parse(message);
        if (data.type === 'join') {
            players[data.id] = { x: 50, y: 50 }; // Initialize player position
            broadcastPlayers();
        } else if (data.type === 'move') {
            players[data.id] = data.position; // Update player position
            broadcastPlayers();
        }
    });

    ws.on('close', function close() {
        // Remove player on disconnect
        delete players[ws.id];
        broadcastPlayers();
    });

    // Broadcast current player positions to all clients
    function broadcastPlayers() {
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'players', players: players }));
            }
        });
    }
});
