import { withOpenStreetMapProvider } from '@ui/utils/osm.js';
import 'leaflet-geosearch/dist/geosearch.css';
import 'leaflet/dist/leaflet.css';
import { memo, useEffect } from 'react';
import { Outlet } from 'react-router';
import { useStops, withStopsProvider } from '../stops/StopsContext.js';

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
