import { StopType } from '@api/features/stops/entities/stopType.enum.js';
import { ButtonSelectOption } from '@ui/components/ButtonSelect.js';

export const stopOptions: ButtonSelectOption[] = [
  { value: StopType.NATIONAL_PARK, label: 'National Park', icon: 'compass' },
  { value: StopType.HOCKEY_CITY, label: 'Hockey City', icon: 'database' },
  { value: StopType.PIT_STOP, label: 'Pit Stop', icon: 'coffee' },
  { value: StopType.HIDDEN_GEM, label: 'Hidden Gem', icon: 'star' },
  { value: StopType.FAMILY_AND_FRIENDS, label: 'Family & Friends', icon: 'users' },
];
