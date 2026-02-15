
import React from 'react';

interface ShortlistProps {
  dates: string[];
  isLoading: boolean;
  error: string | null;
}

const Shortlist: React.FC<ShortlistProps> = ({ dates, isLoading, error }) => {
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
          <p className="text-gray-400">AI is checking for matches...</p>
        </div>
      );
    }

    if (error) {
       return <p className="text-center text-red-400">{error}</p>;
    }

    if (dates.length === 0) {
      return <p className="text-center text-gray-400">No common free weekends found yet. Keep updating!</p>;
    }

    return (
      <ul className="space-y-3">
        {dates.map((date, index) => (
          <li key={index} className="flex items-center bg-gray-700/50 p-3 rounded-lg transition-transform hover:scale-105">
            <svg className="w-6 h-6 text-emerald-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span className="text-gray-200 font-medium">{date}</span>
          </li>
        ))}
      </ul>
    );
  };
  
  return (
    <div className="bg-gray-800 rounded-xl shadow-lg p-6 h-full">
      <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
        <svg className="w-6 h-6 text-emerald-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
        Shortlist
      </h2>
      <div className="h-px bg-gray-700 mb-4"></div>
      {renderContent()}
    </div>
  );
};

export default Shortlist;
