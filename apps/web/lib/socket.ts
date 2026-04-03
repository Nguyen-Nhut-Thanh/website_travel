import { io, Socket } from "socket.io-client";
import { API_BASE_URL } from "@/lib/chat";

let socket: Socket | null = null;
let currentToken: string | null = null;

export const getSocket = (token: string) => {
  if (!socket || currentToken !== token) {
    if (socket) {
      socket.disconnect();
    }

    currentToken = token;
    socket = io(`${API_BASE_URL}/chat`, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
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
