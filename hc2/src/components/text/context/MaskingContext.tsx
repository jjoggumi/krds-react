import { createContext, useContext, useState, type ReactNode } from 'react';

interface MaskingContextState {
   isMasked: boolean;
   setIsMasked: (value: boolean) => void;
   toggleMasked: () => void;
}

const MaskingContext = createContext<MaskingContextState | null>(null);

interface MaskingProviderProps {
   children: ReactNode;
   initialIsMasked?: boolean;
}

export const MaskingProvider = ({ children, initialIsMasked = false }: MaskingProviderProps) => {
   const [isMasked, setIsMasked] = useState(initialIsMasked);

   return (
      <MaskingContext.Provider value={{ isMasked, setIsMasked, toggleMasked: () => setIsMasked(!isMasked) }}>
         {children}
      </MaskingContext.Provider>
   );
};

export const useMaskingContext = () => useContext(MaskingContext);
