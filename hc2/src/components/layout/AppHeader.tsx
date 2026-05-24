import styles from './AppHeader.module.scss';

interface AppUser {
  name?: string;
  profileImagePath?: string;
  profileImage?: string;
  userType?: string;
}

interface AppHeaderProps {
  user?: AppUser;
  title?: string;
  onBackToMain?: () => void;
  children?: React.ReactNode;
}

/** 전체 React 페이지의 상단 헤더 */
export const AppHeader = ({ user, title, onBackToMain, children }: AppHeaderProps) => {
  const profileImg = user?.profileImagePath || user?.profileImage;
  const userName = user?.name;
  const initials = userName ? userName.charAt(0) : '?';

  return (
    <div className={styles.header}>
      {/* 로고 / 메인 이동 */}
      <button
        type="button"
        className={styles.logoArea}
        onClick={onBackToMain}
        title="하이클래스 메인으로"
      >
        <span className={styles.logoText}>HiClass</span>
      </button>

      {/* 페이지 제목 구분선 */}
      {title && (
        <>
          <div className={styles.divider} />
          <span className={styles.pageTitle}>{title}</span>
        </>
      )}

      {/* 추가 컨텐츠 슬롯 (페이지별 버튼 등) */}
      {children}

      <div className={styles.spacer} />

      {/* 사용자 정보 */}
      {user && (
        <div className={styles.userArea}>
          {userName && <span className={styles.userName}>{userName}</span>}
          <div className={styles.avatar}>
            {profileImg ? (
              <img src={profileImg} alt={userName || '사용자'} />
            ) : (
              <span>{initials}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
