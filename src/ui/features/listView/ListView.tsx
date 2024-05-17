import { StopListDTO } from '@api/features/stops/dto/stop.dto.js';
import { Table, TableColumn } from '@ui/components/Table/index.js';
import { useStops } from '../home/StopsContext.js';
import { Clickable } from '@ui/components/Clickable.js';
import { useState } from 'react';
import { ViewStopDetails } from '../home/ViewStopDetails.js';

export const ListView = () => {
  const { stops } = useStops();

  const [selectedStop, setSelectedStop] = useState<StopListDTO | null>(null);

  const handleClose = () => {
    console.log('closing!!');
    setSelectedStop(null);
  };

  const handleOpen = (stop: StopListDTO) => {
    console.log('opening!!');
    setSelectedStop(stop);
  };

  return <>
    <Table initialSortColumn='desiredArrivalDate' initialSortDirection='asc' keyColumn='id' rows={stops} sortEnabled>
      <TableColumn name='Stop Name' column='name'>
        {(row: StopListDTO) => (
          <Clickable className='text-blue-300' onClick={() => handleOpen(row)}>
            {row.name}
          </Clickable>
        )}
      </TableColumn>
      <TableColumn name='Arrival Date' column='actualArrivalDate'>
        {(row: StopListDTO) => row.desiredArrivalDate.toLocaleDateString()}
      </TableColumn>
    </Table>

    {selectedStop && (
      <ViewStopDetails stopId={selectedStop.id} onClose={handleClose} />
    )}
  </>
};