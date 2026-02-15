
import { Weekend, Availability, Status } from '../types';

/**
 * Generates a list of upcoming weekends.
 * @param count The number of upcoming weekends to generate.
 * @returns An array of Weekend objects.
 */
export const generateUpcomingWeekends = (count: number): Weekend[] => {
  const weekends: Weekend[] = [];
  let currentDate = new Date();

  while (weekends.length < count) {
    // Move to the next Saturday
    while (currentDate.getDay() !== 6) {
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const saturday = new Date(currentDate);
    const sunday = new Date(currentDate);
    sunday.setDate(saturday.getDate() + 1);

    const formatOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const saturdayStr = saturday.toLocaleDateString('en-US', formatOptions);
    const sundayStr = sunday.toLocaleDateString('en-US', formatOptions);

    const weekendId = `${saturday.getFullYear()}-${saturday.getMonth() + 1}-${saturday.getDate()}`;
    const display = `Sat, ${saturdayStr} - Sun, ${sundayStr}`;

    weekends.push({ id: weekendId, display });

    // Move to the next week
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return weekends;
};

/**
 * Initializes the availability state, setting everyone to 'Busy' by default.
 * @param weekends An array of Weekend objects.
 * @param users An array of user names.
 * @returns An initial Availability object.
 */
export const initializeAvailability = (weekends: Weekend[], users: string[]): Availability => {
  const initialAvailability: Availability = {};
  weekends.forEach(weekend => {
    initialAvailability[weekend.id] = {};
    users.forEach(user => {
      initialAvailability[weekend.id][user] = 'Busy';
    });
  });
  return initialAvailability;
};
