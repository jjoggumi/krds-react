import { useEffect, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LessonExchange from './pages/LessonExchange';
import LessonAdjustment from './pages/LessonAdjustment';
import LessonReplacement from './pages/LessonReplacement';
import { BrowserRouter, useRoutes, useLocation, useNavigate, Outlet, useSearchParams } from 'react-router-dom';
import ChangeHistoryManagement from './pages/ChangeHistoryManagement';
import ChangeHistoryDetail from './pages/ChangeHistoryDetail';
import LessonAddition from './pages/LessonAddition';

// ---------------------------------------------------------
// 1. 네이티브 통신 및 라우팅 상태 감시 핸들러
// ---------------------------------------------------------
const WebViewHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // URL이 변경될 때마다 네이티브 앱에 현재 상태 전달
  useEffect(() => {
    const navState = {
      action: 'ROUTE_CHANGE',
      path: location.pathname,
      // history.length가 1 이하이면 더 이상 뒤로 갈 곳이 없음을 의미
      canGoBack: window.history.length > 1 
    };

    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify(navState));
    }
  }, [location]);

  // 네이티브에서 물리 버튼이나 스와이프를 막고, 명시적으로 웹에 뒤로가기를 요청할 때 사용할 글로벌 함수
  useEffect(() => {
    window.handleNativeBackPress = () => {
      // 현재 페이지가 백 이벤트를 소비하면 라우팅 백으로 내려가지 않음
      if (window.handlePageBackPress?.()) {
        return;
      }
      if (window.history.length > 1 && location.pathname !== '/home') {
        navigate(-1); // 웹 히스토리 뒤로가기
      } else {
        // 첫 화면이거나 히스토리가 없으면 앱 종료 요청
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ action: 'CLOSE_WEBVIEW' }));
        }
      }
    };

    return () => {
      delete window.handleNativeBackPress;
    };
  }, [location, navigate]);

  return null;
};

const MobileViewportHandler = () => {
  useEffect(() => {
    const prevViewportMeta = document.querySelector('meta[name="viewport"]');
    const prevContent = prevViewportMeta?.getAttribute('content') || '';
    const viewportMeta = prevViewportMeta || document.createElement('meta');

    if (!prevViewportMeta) {
      viewportMeta.setAttribute('name', 'viewport');
      document.head.appendChild(viewportMeta);
    }

    viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');

    return () => {
      if (prevViewportMeta) {
        prevViewportMeta.setAttribute('content', prevContent);
        return;
      }

      viewportMeta.remove();
    };
  }, []);

  return null;
};

// ---------------------------------------------------------
// 2. 페이지 및 레이아웃 컴포넌트
// ---------------------------------------------------------
const TimetableMobileLayout = () => (
  <div>
    <style>{`
      #nprogress .bar { background: transparent !important; }
      #nprogress .peg { box-shadow: 0 0 10px transparent, 0 0 5px transparent !important; }
      `
    }</style>
    <Outlet />
  </div>
);

const AppRoutes = () => {
  const [searchParams] = useSearchParams();
  
  const props = useMemo(() => ({
    teacherId: searchParams.get('teacherId') || undefined,
    lessonDate: searchParams.get('lessonDate') ? Number(searchParams.get('lessonDate')) : undefined,
    timetableId: searchParams.get('timetableId') || undefined,
  }), [searchParams]);

  const routeConfig = useMemo(() => [
  {
      path: '/',
      element: <TimetableMobileLayout />,
      children: [
        { index: true, element: <LessonExchange { ...props } /> },  // 기본 경로는 변경 신청 페이지로 설정
        { path: '/change-lesson/exchange', element: <LessonExchange { ...props } /> },
        { path: '/change-lesson/adjustment', element: <LessonAdjustment { ...props } /> },
        { path: '/change-lesson/replacement', element: <LessonReplacement { ...props } /> },
        { path: '/change-lesson/addition', element: <LessonAddition { ...props } /> },
        { path: '/change-history', element: <ChangeHistoryManagement { ...props } /> },
        { path: '/change-history/:lessonChangeId', element: <ChangeHistoryDetail { ...props } /> },
      ]
    },
  ], [props]);
  
  return useRoutes(routeConfig);
};

const queryClient = new QueryClient();

interface TimetableMobileMainProps {
  basepath: string;
}

export const TimetableMobileMain = ({basepath}: TimetableMobileMainProps) => {
   return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter basename={basepath}>
          <MobileViewportHandler />
          <WebViewHandler />
          <AppRoutes />
        </BrowserRouter>
      </QueryClientProvider>
   );
};
