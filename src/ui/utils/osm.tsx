import { ComponentType, createContext, JSX, useContext, useMemo } from 'react';
import { OpenStreetMapProvider } from 'leaflet-geosearch';

const OpenStreetMapContext = createContext(new OpenStreetMapProvider())

export const OpenStreetMap = ({ children }: React.PropsWithChildren) => {
  const ref = useMemo(() => new OpenStreetMapProvider(), []);

  return <OpenStreetMapContext.Provider value={ref}>
    {children}
  </OpenStreetMapContext.Provider>
};

export const useOpenStreetMap = () => {
  return useContext(OpenStreetMapContext);
};