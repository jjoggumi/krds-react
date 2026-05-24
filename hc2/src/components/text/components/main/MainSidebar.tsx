import { useState, useRef, useEffect, useCallback, RefObject } from 'react';
import { createPortal } from 'react-dom';

import styles from './MainSidebar.module.scss';

import { Button, Icon, HiButton, HiIcon } from '@/components/uiux';
import { Avatar } from './Avatar';
import { ShowConfirm, CONFIRM_OPTIONS} from '@/components/uiux/modal'

import { dispatchRouteChange, handleHc2TextEvent } from '@/components/text/utils';

import { useTextContext } from '@/components/text/context/TextContext';

import { PermissionRole, TextAuthority } from '@/components/text/types';
import { useSenderNumber, useSendInfo } from '@/components/text/queries/useSend';
import { useLocation } from 'react-router-dom';
import { showToast } from '@/unimplementeds/toast';
import { useApiErrorHandler } from '@/components/text/hooks/apiErrorHandler';
import { Plus } from 'lucide-react';

const cx = (...args: (string | boolean | undefined | null)[]) => {
  return args.filter(Boolean).join(' ');
}

// 공통: 여러 ref 영역 밖을 클릭하거나 창이 blur 되면 닫기 처리
const useClickOutsideClose = <T extends HTMLElement>(
  refs: Array<RefObject<T>>, 
  active: boolean, 
  onClose: () => void
) => {
  // onClose를 ref로 감싸서 deps에서 제외 → 매 렌더마다 리스너 재등록 방지
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; });

  useEffect(() => {
    if (!active) return;

    // 스크롤 감지: touchstart ~ pointerdown 사이에 스크롤이 발생하면 click 무시
    let isScrolling = false;
    let scrollTimer: ReturnType<typeof setTimeout>;

    const onScrollStart = () => {
      isScrolling = true;
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => { isScrolling = false; }, 300);
    };

    const onDocClick = (e: MouseEvent) => {
      if (isScrolling) return;
      const target = e.target as Node;
      const isInside = refs.some((ref) => {
        const el = ref.current;
        return el && el.contains(target);
      });
      if (!isInside) {
        onCloseRef.current();
      }
    };

    const onWindowBlur = () => {
      onCloseRef.current();
    };

    window.addEventListener('scroll', onScrollStart, { passive: true, capture: true });
    window.addEventListener('click', onDocClick, true);
    window.addEventListener('blur', onWindowBlur);

    return () => {
      clearTimeout(scrollTimer);
      window.removeEventListener('scroll', onScrollStart, { capture: true });
      window.removeEventListener('click', onDocClick, true);
      window.removeEventListener('blur', onWindowBlur);
    };
  }, [active]); // onClose는 ref로 처리 → deps 제외
};

const MENU_ITEMS = [
  { key: 'send', label: '문자 발송', icon: 'lnb-mobile', permission: 'SEND_MESSAGE' },
  { key: 'contact', label: '주소록', icon: 'lnb-address', permission: 'CONTACT' },
  { key: 'result', label: '실시간 발송결과', icon: 'lnb-clock', permission: null },
  // { key: 'charge', label: '포인트 충전', icon: 'lnb-point' },
  // { key: 'numbers', label: '발신번호 관리', icon: 'lnb-call' },
  { key: 'permission', label: '사용 권한 관리', icon: 'lnb-authority', permission: 'AUTHORITY' },
];

export const MainSidebar = () => {
  const location = useLocation();

  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= 1340;
  });
  const [menuHover, setMenuHover] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  // 접기/펼치기 버튼만 safe zone으로: 이 버튼 클릭시 팝업 유지
  const menuBtnRef = useRef<HTMLDivElement | null>(null);
  const pointPortalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const menu = location.pathname.split('/').pop();
    setActiveMenu(menu);
  }, [location.pathname]);

  // 핸들러 정리: 토글 및 아바타/학교 이름 클릭
  const [noTransition, setNoTransition] = useState(false);

  const toggleCollapsed = () => {
    if (!isCollapsed) {
      setNoTransition(true);
    }
    setIsCollapsed((s) => !s);
    window.setTimeout(() => setNoTransition(false), 320);
  };
  useEffect(() => {
    const onResize = () => {
      try {
        setIsCollapsed(window.innerWidth <= 1341);
      } catch (e) {
        // 안전하게 무시
      }
    };
    window.addEventListener('resize', onResize);
    // 초기 적용
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleChangeMenu = (targetMenu: string) => {
    // 메뉴 클릭 시 active 상태 업데이트 및 라우트 변경 이벤트 전파
    setActiveMenu(targetMenu);
    dispatchRouteChange({ menu: targetMenu });
  };

  return (
    <aside className={cx(styles.mainSidebar, isCollapsed && styles.mainSidebarCollapsed)} aria-label="Main navigation">
      {/* 메뉴 축소/확대 버튼 */}
      <div
        ref={menuBtnRef}
        className={cx(styles.menuBtn, isCollapsed && styles.toggleCollapsedPos)}
        aria-hidden
        aria-expanded={!isCollapsed}
        onClick={toggleCollapsed}
        onMouseEnter={() => setMenuHover(true)}
        onMouseLeave={() => setMenuHover(false)}
      >
        <Icon icon={isCollapsed ? 'double-right' : 'double-left'} iconSize={20} color={menuHover ? 'white' : 'primary'} />
      </div>
      {/* 학교 영역 */}
      <SchoolInfo
        isCollapsed={isCollapsed}
        containerRef={containerRef}
        popupRef={popupRef}
        menuBtnRef={menuBtnRef}
        noTransition={noTransition}
      />
      <div className='relative min-h-0 flex-1'>
        <div className={styles['mainSideScroll'] + " overflow-y-auto border-t border-bg-fixed-black/12 flex flex-col h-full " + (isCollapsed ? 'p-0 gap-0' : 'p-4 gap-4')}>
          {/* 프로필 / 포인트 카드 (네비게이션 상단) */}
          {isCollapsed ? (
            <AuthorityInfoCollapsed pointPortalRef={pointPortalRef} />
          ) : (
            <AuthorityInfoExpended/>
          )}
          <Menu activeMenu={activeMenu} onChangeMenu={handleChangeMenu} isCollapsed={isCollapsed} />
          {isCollapsed ? (
            <SupportCollapsed />
          ) : (
            <SupportExpanded />
          )}
        </div>
        <div
          ref={pointPortalRef}
          style={{ position: 'absolute', top: 0, left: '80px', pointerEvents: 'none', zIndex: 7 }}
        />
      </div>
    </aside>
  );
};

interface SchoolInfoProps {
  isCollapsed: boolean;
  containerRef: RefObject<HTMLDivElement>;
  popupRef: RefObject<HTMLDivElement>;
  menuBtnRef: RefObject<HTMLDivElement>;
  noTransition: boolean;
}

const SchoolInfo = ({isCollapsed, containerRef, popupRef, menuBtnRef, noTransition}: SchoolInfoProps) => {
  const { textAuthorities, currentSchool } = useTextContext();

  const [showSchoolPopup, setShowSchoolPopup] = useState(false);
  const [popupOpenClass, setPopupOpenClass] = useState(false);
  const [isAvatarActive, setIsAvatarActive] = useState(false);

  // 트리거·팝업·토글버튼 외부 클릭 시 닫기 (사이드바 빈 영역·메뉴 클릭 포함)
  const handleCloseSchoolPopup = useCallback(() => setShowSchoolPopup(false), []);
  useClickOutsideClose([containerRef, popupRef, menuBtnRef], showSchoolPopup, handleCloseSchoolPopup);

  useEffect(() => {
    if (showSchoolPopup) {
      const t = window.setTimeout(() => setPopupOpenClass(true), 20);
      return () => window.clearTimeout(t);
    } else {
      setPopupOpenClass(false);
    }
  }, [showSchoolPopup]);

  // showSchoolPopup 상태와 연동하여 트리거에 active 클래스를 붙입니다.
  useEffect(() => {
    if (showSchoolPopup) {
      setIsAvatarActive(true);
      return undefined;
    }
    const t = window.setTimeout(() => setIsAvatarActive(false), 220);
    return () => window.clearTimeout(t);
  }, [showSchoolPopup]);

  const handleAvatarClick = () => {
    setShowSchoolPopup((s) => !s);
  };

  const handleSchoolNameClick = () => {
    setShowSchoolPopup((s) => !s);
  };
  return (
    <div className={styles.schoolHeader}>
      <div className={cx(styles.schoolInner, isCollapsed ? styles.schoolInnerCollapsed : styles.schoolInnerExpanded)}>
        <div ref={containerRef} className={cx(styles.schoolTrigger, isCollapsed && 'cursor-pointer', isCollapsed && isAvatarActive && styles.active)}>
          <Avatar
            img={currentSchool.schoolImagePath || undefined}
            alt={currentSchool.schoolName || '학교 이미지'}
            size="lg"
            type="class"
            className={cx(
              isCollapsed ? styles.avatarCollapsed : styles.avatarExpanded,
              isCollapsed && isAvatarActive && styles.avatarActive,
              isCollapsed && 'cursor-pointer'
            )}
            onClick={handleAvatarClick}
            isCollapsed={isCollapsed}
          />
          {!isCollapsed && (
            <div className={cx(styles.schoolNameWrapper, showSchoolPopup && styles.openIcon)} onClick={handleSchoolNameClick}>
              <span className="text-leading-h3 font-bold">{currentSchool.schoolName}</span>
              <span className={styles.iconWrapper}>
                {/* 기본 아이콘 */}
                <Icon
                  icon="down-circle"
                  iconSize={20}
                  color="black"
                  className={cx(styles.schoolIcon, styles.base, showSchoolPopup && styles.rotated)}
                />
                {/* 호버/활성 시 보일 아이콘 (fill 버전) */}
                <Icon
                  icon="down-circle-fill"
                  iconSize={20}
                  color="black"
                  className={cx(styles.schoolIcon, styles.filled, (showSchoolPopup) && styles.rotated)}
                />
              </span>
            </div>
          )}
          <SchoolSelector
            popupOpenClass={popupOpenClass}
            isCollapsed={isCollapsed}
            setShowSchoolPopup={setShowSchoolPopup}
            noTransition={noTransition}
            popupRef={popupRef}
          />
        </div>
      </div>
    </div>
  );
};

interface SchoolSelectorProps {
  popupOpenClass: boolean;
  isCollapsed: boolean;
  setShowSchoolPopup: (v: boolean) => void;
  noTransition: boolean;
  popupRef: RefObject<HTMLDivElement>;
}

const SchoolSelector = ({ popupOpenClass, isCollapsed, setShowSchoolPopup, noTransition, popupRef }: SchoolSelectorProps) => {
  const { textAuthorities } = useTextContext();

  const handleClickSchool = (textAuthority: TextAuthority) => {
    setShowSchoolPopup(false);
    dispatchRouteChange({ 
      schoolId: textAuthority.schoolId,
      menu: 'send'
    });
    showToast(`${textAuthority.schoolName}입니다.`)
  }

  const handleClickAddSchool = () => {
    setShowSchoolPopup(false);
    ShowConfirm('학교를 추가하시려면 고객센터 또는 1:1문의를 이용해주세요.', {
      ...CONFIRM_OPTIONS.TEXT,
      hideCancel: true,
    }).then();
  }

  return (
    <div
      className={cx(
        styles.popupBox,
        isCollapsed ? styles.popupRight : styles.popupBelow,
        popupOpenClass && styles.open,
        noTransition && styles.noTransition
      )}
      ref={popupRef}
    >
      <ul className={styles.popupList}>
        {textAuthorities.map((textAuthority) => (
          <li
            key={textAuthority.schoolId}
            className={styles.popupItem}
            onClick={() => handleClickSchool(textAuthority)}
          >
            <span className="flex-1 truncate">{textAuthority.schoolName}</span>
          </li>
        ))}
      </ul>
      <div className={cx("mt-2 w-full", styles.popupFooter)}>
        <HiButton
          size="xs"
          variant='primary'
          block
          onClick={handleClickAddSchool}
        >
          <Plus size={18} className='stroke-text-base -ml-1.5' />
          학교 추가하기
        </HiButton>
      </div>
    </div>
  )
}

const AuthorityInfoCollapsed = ({ pointPortalRef }: { pointPortalRef?: RefObject<HTMLDivElement | null> }) => {
  const { currentSchool } = useTextContext();

  const { senderNumbers = [] } = useSenderNumber(currentSchool.schoolId);
  const hasSenderNumbers = senderNumbers.length > 0;

  const [isShowPointInfo, setIsShowPointInfo] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);

  const { point, totalPoint } = currentSchool;
  const hasPoint = point > 0;

  // 포인트 팝업: 버튼 wrapper와 팝업을 포함 영역으로 처리
  const handleClosePointInfo = useCallback(() => setIsShowPointInfo(false), []);
  useClickOutsideClose([wrapperRef, popupRef], isShowPointInfo, handleClosePointInfo);

  const handleClickAddSenderNumber = () => {
    ShowConfirm('발신번호를 등록하시려면 고객센터 또는 1:1문의를 이용해주세요.', {
      ...CONFIRM_OPTIONS.TEXT,
      hideCancel: true,
    }).then();
  }

  return (
    <>
      {hasPoint || hasSenderNumbers ? (
        <div className="relative flex justify-center" ref={wrapperRef}>
          <HiButton
            variant="link"
            className={"h-16 w-16 mt-2 mb-2.5 py-2 text-d1 text-[#4267b2] rounded-md bg-[#f5faff] border border-(--ocean-300) transition duration-140 ease-linear group hover:bg-(--bg-primary-subtler) active:bg-(--bg-primary-subtler)"}
            onClick={() => setIsShowPointInfo(!isShowPointInfo)}
          >
            <div className={"transition-transform duration-150 ease-in-out transform-gpu flex flex-col justify-center items-center pb-1 group-hover:scale-105"}>
              <HiIcon icon="lnb-point" size={26}/>
              포인트
            </div>
          </HiButton>
          {
            pointPortalRef?.current && createPortal(
              <div
                ref={popupRef}
                className={cx(
                  styles.profileCard,
                  'absolute top-0 left-0 z-12 w-53 px-5 py-4',
                  isShowPointInfo && styles.open
                )}
                style={{ pointerEvents: isShowPointInfo ? 'auto' : 'none' }}
              >
                <PointInfo />
              </div>,
              pointPortalRef.current
            )
          }
        </div>
      ) : (
        <Button variant="light-primary" outline className={"h-16 w-16 mt-2 mr-2 mb-2.5 py-2 text-[var(--text-d1)] rounded-lg bg-[#f5faff] border border-[var(--ocean-300)] transition duration-[140ms] ease-linear group hover:bg-[var(--bg-primary-subtler)] active:bg-[var(--bg-primary-subtler)]"} onClick={handleClickAddSenderNumber}>          
          <div className={"transition-transform duration-150 ease-in-out transform-gpu flex flex-col justify-center items-center pb-1 group-hover:scale-105"}>
            <Icon icon="lnb-call" iconSize={26}/>
            번호 등록
          </div>
        </Button>
      )}
    </>
  );
};

const AuthorityInfoExpended = () => {
  const { currentSchool } = useTextContext();

  const { senderNumbers = [] } = useSenderNumber(currentSchool.schoolId);
  const hasSenderNumbers = senderNumbers.length > 0;

  const { point, totalPoint } = currentSchool;
  const hasPoint = point > 0;
  
  const handleClickAddSenderNumber = () => {
    ShowConfirm('발신번호를 등록하시려면 고객센터 또는 1:1문의를 이용해주세요.', {         
      ...CONFIRM_OPTIONS.TEXT,
      hideCancel: true,
    }).then();
  }

  return (
    <div className={styles.profileCard}>
      <div className={styles.profileTop}>
        {currentSchool.role === PermissionRole.OWNER &&
          <div className='text-text-primary-base text-leading-d2'>소유자</div>
        }
        <div className="text-leading-b2 break-all">{currentSchool.managerName} 선생님</div>
      </div>
        {hasPoint || hasSenderNumbers ? (
          <>
            <div className={styles.profileDivider} />
            <PointInfo />
          </>
        ) : (
          <>
          <div>
            <div className="bg-bg-neutral-base p-3 text-leading-b3 text-text-neutral-stronger rounded-2 text-center mt-2 mb-2">
              발신번호 미등록
            </div>
            <Button
              variant="link"
              className="text-text-primary-base! text-leading-d1 underline w-full"
              size="xs"
              onClick={handleClickAddSenderNumber}
            >
              발신번호 등록하기
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

const DEFAULT_POINT = { point: 0, totalPoint: 0 };

const PointInfo = () => {
  const { currentSchool } = useTextContext();
  const { handleError } = useApiErrorHandler();

  const { data, isError, error } = useSendInfo(currentSchool.schoolId);
  const { point, totalPoint } = data || DEFAULT_POINT;

  useEffect(() => {
    if (isError) {
      handleError(error);
    }
  }, [isError]);

  // Percent 표시 규칙
  // - 100% ~ 11%: 실제 비율로 표시
  // - 10% 이하: 10%로 고정 표시(단, 0%는 0)
  let percent = 0;
  if (totalPoint > 0) {
    if (point === 0) {
      percent = 0;
    } else {
      const raw = Math.min(100, Math.round((point / totalPoint) * 10000) / 100);
      percent = raw < 10 ? 10 : raw;
    }
  }

  const handleClickCharge = () => {
    ShowConfirm('포인트를 충전하시려면 고객센터 또는 1:1문의를 이용해주세요.', {
      ...CONFIRM_OPTIONS.TEXT,
      hideCancel: true,
    }).then();
  }

  return (
    <div className={styles.pointsWrap}>
      <div className={styles.pointsHeader}>
        <div className={styles.pointsLabel + ' text-leading-d1'} >
          잔여 포인트(통합)
        </div>
        {
          currentSchool.role === PermissionRole.OWNER && (
            <HiButton variant="underline" onClick={handleClickCharge}>
              <div className="text-leading-d1">
              충전하기
              </div>
            </HiButton>
          )
        }
      </div>
      <div className={cx(styles.pointsAmount, (point || 0) < 100 && 'text-graphic-red!') + ' text-leading-b2'}>{(point).toLocaleString()}P</div>
      <div className={styles.pointsBar}>
        {/* point가 0이면 바(fill)를 렌더링하지 않는다 */}
        {point > 0 && (
          <div
            className={cx(styles.pointsBarFill, (point || 0) < 100 && styles.warning)}
            style={{ width: `${percent}%` }}
          />
        )}
      </div>
    </div>
  )
}

interface MenuProps {
  activeMenu: string | null;
  onChangeMenu: (targetMenu: string) => void;
  isCollapsed: boolean;
}

const Menu = ({ activeMenu, onChangeMenu, isCollapsed }: MenuProps) => {
  const { currentSchool } = useTextContext();
  const handleClickMenu = (targetMenu: string) => {
    onChangeMenu(targetMenu);
  };

  const permissions = currentSchool.permissions.filter(permission => permission.isAllowed);
  const filteredMenu = currentSchool.role === PermissionRole.OWNER ?
    MENU_ITEMS :
    MENU_ITEMS.filter(menu => menu.permission === null || permissions.some(permission => permission.featureType === menu.permission));

  return (
    <nav className={styles.menuListWrap}>
      <ul className={styles.menuList}>
        {filteredMenu.map((item) => {
          let label = item.label;
          if (isCollapsed) {
            if (item.key === 'result') label = '발송결과';
            if (item.key === 'permission') label = '사용 권한';
          }
          return (
            <li key={item.key} className={cx(styles.menuItem, activeMenu === item.key && styles.active)}>
              <button type="button" className={styles.menuTitle} onClick={() => handleClickMenu(item.key)} aria-label={label}>
                <div className={styles.menuContent}>
                  <Icon icon={item.icon || item.key} iconSize={26} className={styles.menuIcon} />
                  <span className={styles.menuLabel}>{label}</span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

const SupportCollapsed = () => {
  return (
    <div className="flex flex-col gap-3 items-center w-full mt-auto border-t border-bg-inverse/10 py-3 px-2">
      <HiButton
        variant="link"
        className="group"
        onClick={handleClickSupport}
      >
        <div className="flex flex-col items-center gap-0.75 bg-transparent w-16 h-16 justify-center shadow-none transform-gpu transition-transform duration-150 ease-in-out origin-center cursor-pointer group-hover:scale-[1.08] group-active:scale-100">
          <div className="relative w-7.5 h-7.5">
            <HiIcon
              icon="lnb-sns"
              size={30}
              className="absolute top-0 left-0 transition-opacity duration-150 ease-in-out opacity-100 group-hover:opacity-0"
            />
            <HiIcon
              icon="lnb-sns-active"
              size={30}
              className="absolute top-0 left-0 transition-opacity duration-150 ease-in-out opacity-0 group-hover:opacity-100"
            />
          </div>
          <div className="text-text-inverse text-d1 font-medium text-center leading-[130%]">
            문자 서비스
            <br />
            주요 기능
          </div>
        </div>
      </HiButton>

      <HiButton
        variant="link"
        className="group"
        onClick={handleHelpQuestion}
      >
        <div className="flex flex-col items-center gap-0.75 bg-transparent w-16 h-16 justify-center shadow-none transform-gpu transition-transform duration-150 ease-in-out origin-center cursor-pointer group-hover:scale-[1.08] group-active:scale-100">        
         <div
            className="relative w-6 h-6 rounded-full flex items-center justify-center 
                      bg-[#768AA8] transition-all duration-200
                      group-hover:bg-bg-primary-base"
          >
            <HiIcon icon="question" size={24} color="text-base" />
          </div>
          <div className="text-text-inverse text-d1 text-center font-medium leading-[130%]">문의</div>
        </div>
      </HiButton>
    </div>
  );
};

const SupportExpanded = () => {
  const handleClickTerms = (layerType: string) => {
    handleHc2TextEvent({ command: 'showTerms', eventData: { layerType }})
  }

  return (
    <div className={cx(styles.bottomArea, )}>
      <div className={cx(styles.bottomCard, styles.bottomCardText)} onClick={handleClickSupport}>
        <div className="flex flex-col gap-1 flex-1">
          <span className={cx(styles.bottomCardLabel, styles.bottomCardGradient)}>문자 서비스 사용법</span>
        </div>
        <Icon icon="arrow-right" color="secondary" className="ml-2" iconSize={16} />
      </div>

      <div className={cx(styles.bottomCard, styles.bottomCardPoint)} onClick={handleHelpQuestion}>
        <div className="flex flex-col gap-1 flex-1">
          <div className="flex items-center w-full">
            <span className={cx(styles.bottomCardLabel, styles.bottomCardLink)}>포인트 충전, 번호 등록문의</span>
          </div>
          <div className="flex items-center gap-1">
            <Icon icon="tel" color="primary" iconSize={18} />
            <span className="text-text-primary-base text-detail-d2">1811-0919</span>
          </div>
        </div>
        <Icon icon="arrow-right" color="secondary" className="ml-2" iconSize={16} />
      </div>
      <div className="flex items-center gap-2 mt-2 justify-center">
        <HiButton
          variant='underline'
          className="!text-text-neutral-stronger text-d2 !leading-d3"
          onClick={() => handleClickTerms('textPolicy')}
        >
          문자서비스 이용약관
        </HiButton>
        <HiButton
          variant='underline'
          className="!text-text-neutral-stronger text-d2 !leading-d3"
          onClick={() => handleClickTerms('privacyPolicy')}
        >
          개인정보 처리방침
        </HiButton>
      </div>

    </div>
  );
};

const handleHelpQuestion = () => {
  dispatchRouteChange({ menu: null, routePath: '/help/question', query: { isWrite: true}});
};

const handleClickSupport = () => {
  window.open('https://hiclass.notion.site/_-2f6d43c0e0b0804281cdd99414242204', '_blank', 'noopener,noreferrer');
};