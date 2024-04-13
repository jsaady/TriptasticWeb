import type { Stop } from '../../../api/features/stops/entities/stop.entity.js'
import { useHttp } from '../../utils/http.js';

export const createStop = async (body: Pick<Stop, 'latitude'|'longitude'|'name'>) => {
  const { post } = useHttp();

  return post('/api/notes', body)
}