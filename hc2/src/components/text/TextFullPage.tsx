/**
 * TextFullPage
 *
 * 문자 서비스 전체 React 페이지 (GNB 포함 풀페이지).
 * 기존 TextMain은 컨텐츠 영역만 담당했으나, TextFullPage는 AppLayout으로 감싸
 * 상단 헤더(AppHeader)까지 React에서 직접 렌더링한다.
 *
 * Vue shell(createReactPage)에서 아래 props를 JSON 문자열로 전달:
 *   - user        : Vuex state.user
 *   - route       : { menu, schoolId, query }
 *   - authorities : TextAuthority[]
 */
import { useEffect, useMemo, useState } from 'react';
import { MemoryRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AppLayout, AppHeader } from '@/components/layout';
import { RootLayout } from '@/components/text/components/RootLayout';
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

interface TextFullPageProps {
  /** Vuex state.user (JSON 문자열) */
  user: string;
  /** CurrentRoute (JSON 문자열) */
  route: string;
  /** TextAuthority[] (JSON 문자열) */
  authorities: string;
}

export const TextFullPage = ({ user, route, authorities }: TextFullPageProps) => {
  const parsedUser = useMemo(() => {
    try { return JSON.parse(user); } catch { return {}; }
  }, [user]);

  const curRoute: CurrentRoute = useMemo(() => {
    try { return JSON.parse(route); } catch { return {}; }
  }, [route]);

  const textAuthorities: TextAuthority[] = useMemo(() => {
    try { return JSON.parse(authorities); } catch { return []; }
  }, [authorities]);

  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/']}>
        <RouteTracker curRoute={curRoute} />
        <TextFullLayout
          user={parsedUser}
          textAuthorities={textAuthorities}
          schoolId={curRoute.schoolId}
        />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

// ── 내부 컴포넌트 ──────────────────────────────────────────────────

/**
 * Vue 라우터와 React MemoryRouter를 동기화.
 * curRoute(Vue side)가 바뀌면 React 내부 라우터도 이동.
 */
const RouteTracker = ({ curRoute }: { curRoute: CurrentRoute }) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const { menu, schoolId, query } = curRoute;
    if (!menu) return;

    const targetPath = `/${schoolId}/${menu}`;
    const isSamePath = location.pathname === targetPath;

    if (!isSamePath) {
      navigate(targetPath, { state: query || null });
    } else {
      navigate(targetPath, { state: query || null, replace: true });
    }
  }, [curRoute, location.pathname, navigate]);

  // 라우트 변경 시 스크롤 초기화
  useEffect(() => {
    const scrollEl = document.querySelector('#text-scroll-wrap');
    if (scrollEl) scrollEl.scrollTop = 0;
  }, [location.pathname]);

  return null;
};

/**
 * AppLayout + TextContainer.
 * AppLayout은 헤더 + 바디 구조를 잡고,
 * TextContainer(기존 RootLayout 포함)가 사이드바와 메인 컨텐츠를 렌더링.
 */
const TextFullLayout = ({
  user,
  textAuthorities,
  schoolId,
}: {
  user: Record<string, any>;
  textAuthorities: TextAuthority[];
  schoolId?: string;
}) => {
  const handleBackToMain = () => {
    // React → Vue 라우터로 메인 이동
    window.dispatchEvent(
      new CustomEvent('react-route-change', {
        detail: { routePath: '/main', query: {} },
      })
    );
  };

  return (
    <AppLayout
      header={
        <AppHeader
          user={user}
          title="문자서비스"
          onBackToMain={handleBackToMain}
        />
      }
    >
      <TextContainer textAuthorities={textAuthorities} schoolId={schoolId} />
    </AppLayout>
  );
};

/**
 * 권한 기반 학교 선택 + 라우팅 컨테이너.
 * 기존 TextMain의 TextContainer와 동일한 구조 유지.
 */
const TextContainer = ({
  textAuthorities,
  schoolId,
}: {
  textAuthorities: TextAuthority[];
  schoolId?: string;
}) => {
  const [currentSchool, setCurrentSchool] = useState<TextAuthority | null>(null);

  useEffect(() => {
    if (!schoolId) return;
    const target = textAuthorities.find((s) => s.schoolId === schoolId);
    if (target) setCurrentSchool(target);
  }, [textAuthorities, schoolId]);

  if (!currentSchool) return null;

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
