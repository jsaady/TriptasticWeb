import 'leaflet-geosearch/dist/geosearch.css';
import 'leaflet/dist/leaflet.css';
import { memo, useEffect } from 'react';
import { useGeolocation } from '@ui/utils/useGeolocation.js';
import { useStops, withStopsProvider } from './StopsContext.js';
import { withOpenStreetMapProvider } from '@ui/utils/osm.js';
import { Outlet } from 'react-router';

export const Home = withOpenStreetMapProvider(withStopsProvider(memo(() => {
  const {
    fetchStops,
    stops,
  } = useStops();

  useEffect(() => {
    fetchStops();
  }, []);

  if (!stops.length) return <div>Loading...</div>

  return <Outlet /> 
})));
