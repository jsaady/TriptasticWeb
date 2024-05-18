import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useOpenStreetMap } from '../utils/osm.js';
import { Input } from './Input.js';
import { useDebounce } from '../utils/debounce.js';
import { BoundsTuple, SearchResult } from 'leaflet-geosearch/dist/providers/provider.js';
import { RawResult } from 'leaflet-geosearch/dist/providers/openStreetMapProvider.js';
import { useAuthorization } from '@ui/utils/useAuth.js';
import { useStops } from '@ui/features/home/StopsContext.js';
import { UserRole } from '@api/features/users/userRole.enum.js';

export interface LocalSearchResult {
  label: string;
  bounds: BoundsTuple;
}


export interface SearchBoxProps {
  onSelected: (result: LocalSearchResult) => void;
  onFocusChange?: (focused: boolean) => void;
}

export const SearchBox = ({ onSelected, onFocusChange }: SearchBoxProps) => {
  const { me } = useAuthorization();
  const { stops } = useStops();

  const osm = useOpenStreetMap();
  const mouseOverResults = useRef(false);

  const [query, setQuery] = useState('' as string);
  const [results, setResults] = useState<SearchResult<LocalSearchResult>[]>([]);
  const [resultsVisible, setResultsVisible] = useState(false);

  const onBlurred = useCallback(() => {
    if (!mouseOverResults.current) {
      setTimeout(() => {
        setResultsVisible(false);
      }, 100);
    }
  }, []);

  const onFocused = useCallback(() => {
    setResultsVisible(true);
  }, []);

  useEffect(() => {
    if (onFocusChange) {
      onFocusChange(resultsVisible);
    }
  }, [resultsVisible, onFocusChange]);

  const doSearch = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;


    if (me?.role === UserRole.ADMIN) {
      osm.search({ query }).then((results) => {
        setResults(results);
      });
    } else {
      setResults(stops.map(stop => ({
        label: stop.name,
        bounds: [stop.latitude, stop.longitude] as const,
        x: 0,
        y: 0,
        raw: {} as RawResult,
      })));
    }
  }, [osm]);

  const debouncedSearch = useDebounce(doSearch, 500);

  const handleQueryChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    debouncedSearch(e);
  }, [debouncedSearch]);

  const handleClick = useCallback((result: SearchResult<RawResult>) => {
    // calculate zoom level from bounding box tuple
    const boundA = result.bounds?.[0];
    const boundB = result.bounds?.[1];
    let zoom = undefined;

    if (boundA && boundB) {
      const lat = Math.abs(boundA[0] - boundB[0]);
      const lng = Math.abs(boundA[1] - boundB[1]);
      zoom = (1-Math.min(lat, lng)) / 0.015;
    }

    onSelected({
      label: result.label,
      bounds: result.bounds!
    });
    setResultsVisible(false);
  }, [onSelected]);

  const handleMouseOver = useCallback(() => {
    mouseOverResults.current = true;
  }, []);


  const handleMouseLeave = useCallback(() => {
    mouseOverResults.current = false;
  }, []);

  return <div className='absolute top-24 z-[1000] md:w-96 w-72'>
    <Input onBlur={onBlurred} onFocus={onFocused} onChange={handleQueryChange} value={query} placeholder='Search for a location' type="text" />
    {resultsVisible && (
      <div onMouseOver={handleMouseOver} onMouseLeave={handleMouseLeave} className='bg-white border border-gray-300 rounded-b shadow-md dark:bg-neutral-800 dark:border-neutral-700 dark:text-white'>
        {results.map((result, i) => (
          <div
            key={i}
            className='p-2 border-b border-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 dark:border-neutral-700 cursor-pointer'
            onClick={() => handleClick(result)}>
            {result.label}
          </div>
        ))}
      </div>
    )}
  </div>
};
