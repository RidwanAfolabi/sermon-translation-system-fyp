import asyncio
from fastapi import WebSocket
import logging
logger = logging.getLogger(__name__)

class BroadcastManager:
    def __init__(self):
        self.active_connections: set[WebSocket] = set()
        self.lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)
        logger.info(f"WS connected. Clients={len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WS disconnected. Clients={len(self.active_connections)}")

    async def broadcast_json(self, message: dict):
        dead = []
        async with self.lock:
            for ws in self.active_connections:
                try:
                    await ws.send_json(message)
                except Exception as e:
                    logger.error(f"WS send failed: {e}")
                    dead.append(ws)
        for ws in dead:
            self.disconnect(ws)