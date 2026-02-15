
import React from 'react';

interface UserSelectorProps {
  users: string[];
  currentUser: string;
  setCurrentUser: (user: string) => void;
}

const UserSelector: React.FC<UserSelectorProps> = ({ users, currentUser, setCurrentUser }) => {
  return (
    <div className="bg-gray-800 rounded-xl shadow-lg p-6">
      <label htmlFor="user-select" className="block text-sm font-medium text-gray-300 mb-2">
        Who are you?
      </label>
       <div className="relative">
        <select
          id="user-select"
          value={currentUser}
          onChange={(e) => setCurrentUser(e.target.value)}
          className="w-full appearance-none bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
        >
          {users.map(user => (
            <option key={user} value={user}>
              {user}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>
       <p className="mt-4 text-sm text-gray-400">
        Select your name to update your availability. Your column is highlighted for clarity.
      </p>
    </div>
  );
};

export default UserSelector;
