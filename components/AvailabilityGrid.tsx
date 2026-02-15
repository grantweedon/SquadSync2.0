
import React from 'react';
import { Availability, Weekend } from '../types';

interface AvailabilityGridProps {
  weekends: Weekend[];
  users: string[];
  availability: Availability;
  currentUser: string;
  onToggleStatus: (weekendId: string) => void;
}

const StatusIndicator: React.FC<{ status: 'Free' | 'Busy' }> = ({ status }) => {
  const isFree = status === 'Free';
  const bgColor = isFree ? 'bg-emerald-500' : 'bg-red-500';
  const icon = isFree ? (
    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
  ) : (
    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
  );

  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${bgColor} shadow-md`}>
      {icon}
    </div>
  );
};

const AvailabilityGrid: React.FC<AvailabilityGridProps> = ({ weekends, users, availability, currentUser, onToggleStatus }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-800">
          <tr>
            <th scope="col" className="py-3.5 px-4 text-left text-sm font-semibold text-gray-300">
              Weekend
            </th>
            {users.map(user => (
              <th
                key={user}
                scope="col"
                className={`py-3.5 px-4 text-center text-sm font-semibold text-gray-300 transition-colors ${
                  currentUser === user ? 'text-emerald-400' : ''
                }`}
              >
                {user}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700 bg-gray-800/50">
          {weekends.map(weekend => (
            <tr key={weekend.id} className="hover:bg-gray-700/50 transition-colors">
              <td className="whitespace-nowrap py-4 px-4 text-sm font-medium text-gray-200">
                {weekend.display}
              </td>
              {users.map(user => (
                <td key={`${weekend.id}-${user}`} className={`py-4 px-4 text-sm text-gray-300 transition-all ${
                  currentUser === user ? 'bg-gray-700/70' : ''
                }`}>
                  <div className="flex justify-center">
                    {currentUser === user ? (
                      <button 
                        onClick={() => onToggleStatus(weekend.id)}
                        className="transform transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-emerald-500 rounded-full"
                        aria-label={`Toggle ${user}'s status for ${weekend.display} to ${availability[weekend.id][user] === 'Free' ? 'Busy' : 'Free'}`}
                      >
                         <StatusIndicator status={availability[weekend.id]?.[user] || 'Busy'} />
                      </button>
                    ) : (
                       <StatusIndicator status={availability[weekend.id]?.[user] || 'Busy'} />
                    )}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AvailabilityGrid;
