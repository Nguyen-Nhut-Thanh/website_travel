import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
let currentToken: string | null = null;

export const getSocket = (token: string) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';
  
  if (!socket || currentToken !== token) {
    if (socket) {
      socket.disconnect();
    }
    
    currentToken = token;
    socket = io(`${apiUrl}/chat`, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
    });
    
    socket.on('connect', () => {
      console.log('Socket connected to:', apiUrl);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
