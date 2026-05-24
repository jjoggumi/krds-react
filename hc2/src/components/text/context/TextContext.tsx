import { createContext, useContext } from 'react';
import { TextAuthority } from '@/components/text/types';

interface TextState {
  textAuthorities: TextAuthority[];
  currentSchool: TextAuthority | null;
}

export const TextContext = createContext<TextState>({
  textAuthorities: [],
  currentSchool: null,
});

export const useTextContext = () => useContext(TextContext);
