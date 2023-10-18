import { useCallback, useEffect, useState } from 'react';
import { Socket, io } from 'socket.io-client';

interface SocketState {
  data: string | null;
  error: Event | null;
  ready: boolean;
  messageTs: number;
}

const newSocket = io('/', {
  transports: ['websocket'],
});

export const useSocket = (channel: string, url = ''): [SocketState, (message: string, channel?: string) => void] => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    setSocket(newSocket);

    const onConnect = () => {
      console.log(`Socket connected`, newSocket);
      setState((prevState) => ({
        ...prevState,
        ready: true,
      }));
    };
    const onDisconnect = () => {
      console.log(`Socket disconnected`, newSocket);
      setState((prevState) => ({
        ...prevState,
        ready: false,
      }));
    };
    newSocket.on('connect', onConnect);
    newSocket.on('disconnect', onDisconnect);

    newSocket.connect();

    return () => {
      newSocket.off('connect', onConnect);
      newSocket.off('disconnect', onDisconnect);
      if (newSocket.connected) {
        newSocket.disconnect();
      }
    };
  }, [url]);

  const [state, setState] = useState<SocketState>({
    data: null,
    error: null,
    ready: socket?.connected ?? false,
    messageTs: 0,
  });

  useEffect(() => {
    const onMessage = (message: string) => {
      console.log('woo new message');
      setState((prevState) => ({
        ...prevState,
        data: message,
        messageTs: Date.now(),
      }));
    };
    if (socket) {
      socket.on('error', (error: any) => {
        console.log('error', error);
        setState((prevState) => ({
          ...prevState,
          error,
        }));
      });
      socket.on(channel, onMessage);
    }

    return () => {
      socket?.off(channel, onMessage);
    };
  }, [channel, socket]);

  const sendMessage = useCallback((message: string, toChannel = channel) => {
    if (!socket) throw new ReferenceError('Socket has not been created');

    socket.emit(toChannel, message);
  }, [channel, socket]);

  return [state, sendMessage];
};
