import { createContext, ReactNode, useContext, useState } from 'react';
import { SendTargetWithValidation } from '@/components/text/types';

interface SendReceiverState {
  focusedRow: SendTargetWithValidation | null;
  handleFocusRow: (row: SendTargetWithValidation | null) => void;
}

export const SendReceiverContext = createContext<SendReceiverState | null>(null);

export const SendReceiverContextProvider = ({ children }: { children: ReactNode }) => {
  const [focusedRow, setFocusedRow] = useState<SendTargetWithValidation | null>(null);

  const handleFocusRow = (row: SendTargetWithValidation | null) => {
    setFocusedRow(row);
  };

  return (
    <SendReceiverContext.Provider
      value={{
        focusedRow,
        handleFocusRow,
      }}
    >
      {children}
    </SendReceiverContext.Provider>
  );
};

export const useSendReceiverContext = () => useContext(SendReceiverContext);
