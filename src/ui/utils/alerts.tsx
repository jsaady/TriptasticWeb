import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

let alertId = 0;

export enum AlertType {
  Success,
  Error,
  Info,
  Warning
}

interface Alert {
  id: number;
  message: string;
  type: AlertType;
  fadingOut: boolean;
}

const fadeTime = 300;

export const Alert = ({ message, type, fadeOut }: { message: string; type: AlertType; fadeOut: boolean; }) => {
  const [visible, setVisible] = useState(false);

  setTimeout(() => {
    setVisible(true);
  }, fadeTime);


  useEffect(() => {
    if (fadeOut) {
      setVisible(false);
    }
  }, [fadeOut]);

  const color = useMemo(() => {
    switch (type) {
      case AlertType.Error:
        return 'bg-red-400 dark:bg-red-600';
      case AlertType.Success:
        return 'bg-green-400 dark:bg-green-600';
      case AlertType.Info:
        return 'bg-blue-400 dark:bg-blue-600';
      case AlertType.Warning:
        return 'bg-yellow-400 dark:bg-yellow-600';
    }
  }, [message]);

  return <div className={`w-[24em] p-4 ${color} border-gray-500 rounded mt-5 text-white transition-opacity duration-300 ease-out ${fadeOut || !visible ? 'opacity-0' : 'opacity-100'}`}>
    {message}
  </div>
};

const AlertContext = createContext({} as unknown as {
  getAlerts: () => Alert[];
  /**
   * 
   * @param message Message to display
   * @param dismissAfter Time in ms to dismiss the alert
   */
  alert: (message: string, type?: AlertType, dismissAfter?: number) => void;
});

export const AlertProvider = ({ children }: PropsWithChildren) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const alertsRef = useRef(alerts);

  const getAlerts = useCallback(() => alertsRef.current, []);

  useEffect(() => {
    alertsRef.current = alerts;
  }, [alerts]);

  const alert = (message: string, type = AlertType.Success, dismissAfter = 5000) => {
    const id = alertId++;
    setAlerts(m => [...m, {
      id,
      message,
      type,
      fadingOut: false
    }]);
    
    setTimeout(() => {
      setAlerts(messages => {
        return messages.map(m => {
          if (m.id === id) {
            return {
              id,
              message,
              type,
              fadingOut: true
            };
          }
          return m;
        });
      });
    }, dismissAfter + fadeTime);
    
    setTimeout(() => {
      setAlerts(m => m.filter(m => m.id !== id));
    }, dismissAfter + (fadeTime * 2));
  };

  return <AlertContext.Provider value={{
    alert,
    getAlerts,
  }}>
    {children}
  </AlertContext.Provider>
};

export const AlertOutlet = () => {
  const { getAlerts } = useContext(AlertContext);
  
  // State for storing alerts
  const [alerts, setAlerts] = useState(getAlerts());

  // Effect to update alerts whenever getAlerts changes
  useEffect(() => {
    setAlerts(getAlerts());
  }, [getAlerts]);

  return <div className='z-[1004] absolute left-0 right-0 top-0 m-auto flex justify-center flex-col items-center'>
    {alerts.map((alert, i) => <Alert key={i} message={alert.message} type={alert.type} fadeOut={alert.fadingOut} />)}
  </div>
};

export const useAlert = () => useContext(AlertContext).alert;
