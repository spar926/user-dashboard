import { useState, useEffect } from "react";
import { io, Socket } from 'socket.io-client'

interface SocketHookResult {
  socket: Socket | null;
  connected: boolean;
  connectionStatus: string;
}

export const useSocket = (serverUrl: string): SocketHookResult => {
  // Stubbed values so components can render without a live socket
  const [connected, setConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socketInstance = io(serverUrl, {
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
    });

    setSocket(socketInstance);

    socketInstance.on('connect', () => {
        setConnected(true);
        setConnectionStatus('Connected');
    });

    socketInstance.on('disconnect', (reason) => {
        setConnected(false);
        setConnectionStatus(`Disconnected: ${reason}`);
    });

    // clean up
    return () => {
        socketInstance.disconnect();
        socketInstance.off('connect');
        socketInstance.off('disconnect');
    };
  }, [serverUrl]);
  return { socket, connected, connectionStatus };
};
