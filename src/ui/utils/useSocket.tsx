import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Socket, io } from 'socket.io-client';

interface SocketState {
  data: string | null;
  error: Event | null;
  ready: boolean;
  messageTs: number;
  id?: string;
}


export interface GlobalSocketState {
  reconnect(): void;
  socket: Socket | null;
}


const GlobalSocketContext = createContext<GlobalSocketState>(null as any);
export const useGlobalSocket = () => useContext(GlobalSocketContext);

export const GlobalSocketProvider = ({ children, url = '/' }: GlobalSocketProvider) => {
  const initialGlobalSocket = useMemo(() => io(url, { transports: ['websocket'] }), [url]);
  const [globalSocket, setGlobalSocket] = useState<Socket|null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!globalSocket) {
      const onConnect = () => {
        // console.log(`Socket connected`, initialGlobalSocket);
        setGlobalSocket(initialGlobalSocket);
      };
      const onDisconnect = () => {
        // console.log(`Socket disconnected`, initialGlobalSocket);
        setGlobalSocket(null);
      };

      initialGlobalSocket.on('connect', onConnect);
      initialGlobalSocket.on('disconnect', onDisconnect);

      initialGlobalSocket.connect();

      return () => {
        console.log('clean up')

        initialGlobalSocket.disconnect();
      };
    }
  }, [url]);

  const reconnect = useCallback(() => {
    console.log('clean up')

    globalSocket?.once('disconnect', () => {
      globalSocket?.connect();
    });
    globalSocket?.disconnect();
  }, [globalSocket]);

  if (!globalSocket) return <></>;

  return <GlobalSocketContext.Provider value={{
    socket: globalSocket,
    reconnect
  }}>
    {children}
  </GlobalSocketContext.Provider>
};

export const useSocket = (channel: string): [SocketState, (message: string, channel?: string) => void] => {
  const { socket } = useGlobalSocket();
  const socketRef = useRef(socket);

  const [state, setState] = useState<SocketState>({
    data: null,
    error: null,
    ready: socket?.connected ?? false,
    messageTs: 0,
    id: socket?.id
  });

  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (socket !== socketRef.current) {
      socketRef.current = socket;
      setState((prevState) => ({
        ...prevState,
        ready: true,
        id: socket!.id,
      }));
    }
  }, [socket]);


  useEffect(() => {
    const onMessage = (data: string) => {
      const messageTs = Date.now();
      console.log('new message', data, messageTs);

      if (messageTs === stateRef.current.messageTs) {
        console.log('delayying!!!');
        setTimeout(() => {
          setState((prevState) => ({
            ...prevState,
            data,
            messageTs
          }));
        });
      } else {
        setState((prevState) => ({
          ...prevState,
          data,
          messageTs
        }));
      }
    };
    if (socket) {
      socket.on('error', (error: any) => {
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

export interface GlobalSocketProvider extends React.PropsWithChildren {
  url?: string;
}
