
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
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [currentUser, setCurrentUser] = useState<string>(USERS[0]);
  const [shortlist, setShortlist] = useState<string[]>([]);
  const [isShortlistLoading, setIsShortlistLoading] = useState<boolean>(false);
  const [isFetchingData, setIsFetchingData] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const setupAvailability = async () => {
      setIsFetchingData(true);
      setError(null);
      let response: Response | null = null;
      try {
        response = await fetch('/api/availability');
        if (!response.ok) {
          let errorText = `Failed to fetch data. Status: ${response.status}`;
          try {
            const errorData = await response.json();
            if (errorData.error) {
              errorText = `Error from server: ${errorData.error}. This often means the backend can't connect to the database. Please check backend logs and ensure credentials are set up correctly.`;
            }
          } catch (e) {
            // Ignore if response body is not json
          }
          throw new Error(errorText);
        }
        const savedData = await response.json();

        if (Object.keys(savedData).length > 0) {
          setAvailability(savedData);
        } else {
          // First run, initialize and save state
          const initialData = initializeAvailability(weekends, USERS);
          setAvailability(initialData);
          const postResponse = await fetch('/api/availability', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(initialData),
          });
          if (!postResponse.ok) {
            throw new Error('Failed to save initial availability data.');
          }
        }
      } catch (err) {
        console.error("Failed to setup availability:", err);
        setError(err instanceof Error ? err.message : "Could not load or initialize availability data. Please refresh.");
      } finally {
        setIsFetchingData(false);
      }
    };

    setupAvailability();
  }, [weekends]);

  const updateShortlist = useCallback(async () => {
    if (!availability) return;

    setIsShortlistLoading(true);
    setError(null);
    try {
      const commonWeekends = await findCommonFreeWeekends(availability, USERS, weekends);
      setShortlist(commonWeekends);
    } catch (err) {
      console.error("Error updating shortlist:", err);
      setError("Failed to get suggestions from Gemini. Please try again.");
    } finally {
      setIsShortlistLoading(false);
    }
  }, [availability, weekends]);

  useEffect(() => {
    updateShortlist();
  }, [updateShortlist]);

  const handleToggleStatus = async (weekendId: string) => {
    if (!availability) return;

    const originalAvailability = availability;
    const currentStatus = availability[weekendId][currentUser];
    const newStatus: Status = currentStatus === 'Free' ? 'Busy' : 'Free';
    const newAvailability = {
      ...availability,
      [weekendId]: {
        ...availability[weekendId],
        [currentUser]: newStatus,
      },
    };
    setAvailability(newAvailability); // Optimistic update

    try {
      const response = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAvailability),
      });
      if (!response.ok) {
        throw new Error('Failed to save availability');
      }
    } catch (err) {
      console.error("Error saving availability:", err);
      setError("Failed to save your change. Please try again.");
      setAvailability(originalAvailability); // Revert on failure
    }
  };

  if (isFetchingData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-400"></div>
        <p className="ml-4 text-lg text-gray-300">Loading Squad Data...</p>
      </div>
    );
  }

  if (!availability) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-center p-4">
        <div>
          <h2 className="text-2xl font-bold text-red-500">Loading Failed</h2>
          <p className="text-gray-400 mt-2 max-w-md">{error || "An unknown error occurred."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Header />

        <main className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg-col-span-2">
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
            <Shortlist dates={shortlist} isLoading={isShortlistLoading} error={error} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
