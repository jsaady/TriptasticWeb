import { LatLng } from 'leaflet';
import 'leaflet-geosearch/dist/geosearch.css';
import { BoundsTuple } from 'leaflet-geosearch/dist/providers/provider.js';
import 'leaflet/dist/leaflet.css';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { ConfirmModal } from '@ui/components/ConfirmModal.js';
import { LocalSearchResult, SearchBox } from '@ui/components/SearchBox.js';
import { StopMarker } from '@ui/components/StopMarker.js';
import { useGeolocation } from '@ui/utils/useGeolocation.js';
import { EditNoteStop } from './EditNoteStop.js';
import { MapBridge } from '../mapView/MapBridge.js';
import { useStops, withStopsProvider } from './StopsContext.js';
import { ViewStopDetails } from './ViewStopDetails.js';
import { withOpenStreetMapProvider } from '@ui/utils/osm.js';
import { MapLibreTileLayer } from '../mapView/MapLibreTileLayer.js';
import { CreateStopDTO, UpdateStopDTO } from '@api/features/stops/dto/stop.dto.js';
import { useFetchApiKey } from './fetchApiKey.js';
import { Outlet } from 'react-router';

export const Home = withOpenStreetMapProvider(withStopsProvider(memo(() => {
  const {
    fetchStops,
    stops,
  } = useStops();

  const {
    currentLocation,
    lastLocation,
    getLocation
  } = useGeolocation();

  useEffect(() => {
    fetchStops();
  }, []);


  if (!stops.length) return <div>Loading...</div>

  return <Outlet /> 
})));
