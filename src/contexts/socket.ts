import React from "react";
import { io } from "socket.io-client";
// const socketUrl = 'http://' + window.location.hostname + ':8001';
const socketUrl = 'http://34.122.28.32:8001';

export const socket = io(socketUrl);
export const SocketContext = React.createContext(socket);
