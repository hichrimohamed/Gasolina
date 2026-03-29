import { createContext, useContext, useState } from 'react';

const DateContext = createContext(null);

const DEFAULT_FROM = '2025-01-01';
const DEFAULT_TO   = new Date().toISOString().slice(0, 10);

export function DateProvider({ children }) {
  const [from, setFrom] = useState(
    () => localStorage.getItem('date_from') ?? DEFAULT_FROM
  );
  const [to, setTo] = useState(
    () => localStorage.getItem('date_to') ?? DEFAULT_TO
  );

  function setRange(f, t) {
    setFrom(f);
    setTo(t);
    if (f) localStorage.setItem('date_from', f);
    if (t) localStorage.setItem('date_to', t);
  }

  return (
    <DateContext.Provider value={{ from, to, setRange }}>
      {children}
    </DateContext.Provider>
  );
}

export function useDate() {
  return useContext(DateContext);
}
