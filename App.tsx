
import React, { useState, useEffect, useCallback } from 'react';
import { USERS } from './constants';
import { Availability, Status, Weekend } from './types';
import { findCommonFreeWeekends } from './services/geminiService';
import Header from './components/Header';
import UserSelector from './components/UserSelector';
import Shortlist from './components/Shortlist';
import AvailabilityGrid from './components/AvailabilityGrid';
import { generateUpcomingWeekends, initializeAvailability } from './utils/dateUtils';

const App: React.FC = () => {
  const [weekends] = useState<Weekend[]>(generateUpcomingWeekends(12));
  const [availability, setAvailability] = useState<Availability>(() => initializeAvailability(weekends, USERS));
  const [currentUser, setCurrentUser] = useState<string>(USERS[0]);
  const [shortlist, setShortlist] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const updateShortlist = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const commonWeekends = await findCommonFreeWeekends(availability, USERS, weekends);
      setShortlist(commonWeekends);
    } catch (err) {
      console.error("Error updating shortlist:", err);
      setError("Failed to get suggestions from Gemini. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [availability, weekends]);

  useEffect(() => {
    updateShortlist();
  }, [updateShortlist]);

  const handleToggleStatus = (weekendId: string) => {
    setAvailability(prev => {
      const currentStatus = prev[weekendId][currentUser];
      const newStatus: Status = currentStatus === 'Free' ? 'Busy' : 'Free';
      return {
        ...prev,
        [weekendId]: {
          ...prev[weekendId],
          [currentUser]: newStatus,
        },
      };
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Header />

        <main className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-xl shadow-lg p-6">
               <AvailabilityGrid
                  weekends={weekends}
                  users={USERS}
                  availability={availability}
                  currentUser={currentUser}
                  onToggleStatus={handleToggleStatus}
                />
            </div>
          </div>
          <div className="lg:col-span-1 flex flex-col gap-8">
             <UserSelector
                users={USERS}
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
              />
            <Shortlist dates={shortlist} isLoading={isLoading} error={error} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
