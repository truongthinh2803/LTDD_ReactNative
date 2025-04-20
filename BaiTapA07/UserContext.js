import React, { createContext, useState, useContext } from 'react';

// Tạo User Context
const UserContext = createContext();

// Tạo Provider cho User Context
export const UserProvider = ({ children }) => {
  const [userID, setUserID] = useState(null);

  return (
    <UserContext.Provider value={{ userID, setUserID }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook để sử dụng User Context
export const useUser = () => useContext(UserContext);
