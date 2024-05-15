import { OmitType, PickType } from '@nestjs/swagger'
import { Stop } from '../entities/stop.entity.js';


export class StopDetailDTO extends PickType(Stop, [
  'id',
  'name',
  'notes',
  'createdAt',
  'updatedAt',
  'desiredArrivalDate',
  'actualArrivalDate',
  'latitude',
  'longitude',
  'type',
  'importId',
  'status'
]){ }

export class StopListDTO extends OmitType(StopDetailDTO, ['notes']){ }
export class UpdateStopDTO extends OmitType(StopDetailDTO, ['createdAt', 'updatedAt']){ }
export class CreateStopDTO extends OmitType(UpdateStopDTO, ['id']){ }
