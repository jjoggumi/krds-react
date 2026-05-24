// 문자 서비스 진입점
import { useEffect, useMemo, useState } from 'react';
import { MemoryRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { RootLayout } from './components/RootLayout';

import { TextSend } from '@/components/text/pages/TextSend';
import { TextContact } from '@/components/text/pages/TextContact';
import { TextSendResult } from '@/components/text/pages/TextSendResult';
import { TextPermission } from '@/components/text/pages/TextPermission';

import { TextContext } from '@/components/text/context/TextContext';

import { CurrentRoute, TextAuthority } from '@/components/text/types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
      refetchOnReconnect: true,
    },
  },
});

interface TextMainProps {
  route: string;
  authorities: string;
}

export const TextMain = ({ route, authorities }: TextMainProps) => {
  const curRoute: CurrentRoute = useMemo(() => JSON.parse(route), [route]);
  const textAuthorities: TextAuthority[] = useMemo(() => JSON.parse(authorities), [authorities]);

  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/']}>
        <RouteTracker curRoute={curRoute}/>
        <TextContainer textAuthorities={textAuthorities} schoolId={curRoute.schoolId} />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

const RouteTracker = ({ curRoute }: { curRoute: CurrentRoute }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // vue 에서 라우터 바꾸면 React 라우터도 이동
  useEffect(() => {
    const { menu, schoolId, query } = curRoute;
    const targetPath = menu.startsWith('/') ? menu : `/${menu}`;
    const isSamePath = location.pathname === targetPath;

    if (!isSamePath) {
      navigate(`/${schoolId}/${menu}`, { state: query || null });
    } else {
      navigate(`/${schoolId}/${menu}`, { state: query || null, replace: true });
    }
  }, [curRoute, location.pathname, navigate]);

  useEffect(() => {
    if (document.querySelector('#text-scroll-wrap')) {
      document.querySelector('#text-scroll-wrap').scrollTop = 0;
    }
  }, [location.pathname]);

  return null;
};

const TextContainer = ({ textAuthorities, schoolId }: { textAuthorities:TextAuthority[]; schoolId: string }) => {
  const [currentSchool, setCurrentSchool] = useState<TextAuthority | null>(null);

  useEffect(() => {
    if (schoolId) {
      const target = textAuthorities.find((school) => school.schoolId === schoolId);
      if (target) {
        setCurrentSchool(target);
        return;
      }
    }
  }, [textAuthorities, schoolId, currentSchool]);

  if (!currentSchool) {
    return null;
  }

  return (
    <TextContext.Provider value={{ textAuthorities, currentSchool }}>
      <Routes>
        <Route path="/:schoolId" element={<RootLayout />}>
          <Route path="send" element={<TextSend />} />
          <Route path="contact" element={<TextContact />} />
          <Route path="result" element={<TextSendResult />} />
          <Route path="permission" element={<TextPermission />} />
        </Route>
      </Routes>
    </TextContext.Provider>
  );
};
