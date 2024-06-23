import { StopListDTO } from '@api/features/stops/dto/stop.dto.js';
import { Clickable } from '@ui/components/Clickable.js';
import { Table, TableColumn } from '@ui/components/Table/index.js';
import { useState } from 'react';
import { useStops } from '../stops/StopsContext.js';
import { ViewStopDetails } from '../stops/ViewStopDetails.js';

export const ListView = () => {
  const { stops } = useStops();

  const [selectedStop, setSelectedStop] = useState<StopListDTO | null>(null);

  const handleClose = () => {
    console.log('closing!!');
    setSelectedStop(null);
  };

  const handleOpen = (stop: StopListDTO) => {
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
      <ViewStopDetails stopId={selectedStop.id} onClose={handleClose} showViewMapButton />
    )}
  </>
};