
export type Status = 'Free' | 'Busy';

export interface Weekend {
  id: string;
  display: string;
}

export type Availability = Record<string, Record<string, Status>>;
