import React, { createContext, useState } from "react";

export const LoggedContext = createContext();

export function LoggedProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState("false");

  return (
    <LoggedContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      {children}
    </LoggedContext.Provider>
  );
}
