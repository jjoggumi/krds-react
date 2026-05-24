import { Loading } from '@/components/uiux';
import { createContext, useContext, useState, type ReactNode, useCallback } from 'react';

interface LoadingContextState {
  showLoading: (message?: string) => void;
  hideLoading: () => void;
}

const LoadingContext = createContext<LoadingContextState | null>(null);

interface LoadingProviderProps {
   children: ReactNode;
}

export const LoadingContextProvider = ({ children }: LoadingProviderProps) => {
  const [loadingState, setLoadingState] = useState<{ active: boolean; message?: string | null }>({
    active: false,
    message: null,
  });

  const showLoading = useCallback((message?: string) => {
    setLoadingState({ active: true, message });
  }, []);

  const hideLoading = useCallback(() => {
    setLoadingState({ active: false, message: null });
  }, []);

   return (
      <LoadingContext.Provider value={{ showLoading, hideLoading }}>
         {children}
         {loadingState.active && <Loading variant="timetable" overlay text={loadingState.message} />}
      </LoadingContext.Provider>
   );
};

export const useLoadingContext = () => useContext(LoadingContext);