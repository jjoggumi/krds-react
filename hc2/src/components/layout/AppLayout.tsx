import styles from './AppLayout.module.scss';
import { AppHeader } from './AppHeader';

interface AppLayoutProps {
  /** 상단 헤더 영역. AppHeader를 사용하거나 직접 커스텀 컴포넌트 전달 */
  header?: React.ReactNode;
  /** 좌측 사이드바 영역 */
  sidebar?: React.ReactNode;
  /** 메인 컨텐츠 영역 */
  children: React.ReactNode;
}

/**
 * AppLayout
 *
 * 전체 React 페이지의 공통 레이아웃.
 *
 * 구조:
 * ```
 * ┌──────────────────────────────┐
 * │ header (56px)                │
 * ├────────┬─────────────────────┤
 * │ sidebar│ main (children)     │
 * │        │                     │
 * └────────┴─────────────────────┘
 * ```
 *
 * 사용 예:
 * ```tsx
 * <AppLayout
 *   header={<AppHeader user={user} title="문자서비스" onBackToMain={...} />}
 *   sidebar={<TextSidebar />}
 * >
 *   <Outlet />
 * </AppLayout>
 * ```
 */
export const AppLayout = ({ header, sidebar, children }: AppLayoutProps) => {
  return (
    <div className={styles.layout}>
      {header && <div className={styles.header}>{header}</div>}

      <div className={styles.body}>
        {sidebar && <div className={styles.sidebar}>{sidebar}</div>}
        <div className={styles.main}>{children}</div>
      </div>
    </div>
  );
};

// 서브 컴포넌트로 AppHeader도 re-export (하나의 import로 사용 가능하게)
AppLayout.Header = AppHeader;
