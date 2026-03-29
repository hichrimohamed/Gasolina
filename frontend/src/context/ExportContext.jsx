import { createContext, useContext, useRef } from 'react';

const ExportContext = createContext(null);

export function ExportProvider({ children }) {
  const exportFnRef = useRef(null);

  function registerExport(fn) {
    exportFnRef.current = fn;
  }

  function triggerExport() {
    exportFnRef.current?.();
  }

  return (
    <ExportContext.Provider value={{ registerExport, triggerExport }}>
      {children}
    </ExportContext.Provider>
  );
}

export function useExport() {
  return useContext(ExportContext);
}
