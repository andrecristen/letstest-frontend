import React, { createContext, useContext, useMemo, useState } from "react";

type PageLoadingContextType = {
  isLoading: boolean;
  setLoading: (value: boolean) => void;
};

const PageLoadingContext = createContext<PageLoadingContextType | undefined>(undefined);

export const PageLoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  const value = useMemo(() => ({
    isLoading,
    setLoading: setIsLoading,
  }), [isLoading]);

  return (
    <PageLoadingContext.Provider value={value}>
      {children}
    </PageLoadingContext.Provider>
  );
};

export const usePageLoadingContext = () => {
  const context = useContext(PageLoadingContext);
  if (!context) {
    throw new Error("usePageLoadingContext must be used within PageLoadingProvider");
  }
  return context;
};
