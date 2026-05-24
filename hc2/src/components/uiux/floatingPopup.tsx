import React, { useEffect, useRef, useState } from "react";
import moment from "moment";
import styles from "./floatingPopup.module.scss";
import { HiButton } from "./hiButton";
import { X } from 'lucide-react';

interface FloatingPopupProps {
  imgSrc: string;
  onOpen: () => void;
  hasTodayOption?: boolean;
  onClose?: () => void;
}

const STORAGE_KEY = "floatingPopupNotToday";

const FloatingPopup: React.FC<FloatingPopupProps> = ({
  imgSrc,
  onOpen,
  hasTodayOption = false,
  onClose,
}) => {
  const [show, setShow] = useState(false); // 애니메이션용
  const [shouldRender, setShouldRender] = useState(true); // 실제 DOM mount 여부
  const popupRef = useRef<HTMLDivElement>(null);
  const today = moment().format("YYYYMMDD");

  // 최초 mount 시 localStorage 체크
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      if (data[today]) {
        setShouldRender(false);
        return;
      }
    }
    setShouldRender(true);
    setTimeout(() => setShow(true), 10); // mount 후 show
  }, [today]);

  // 닫기 버튼 또는 오늘 다시 보지 않음 클릭 시 hide 애니메이션
  const handleClose = () => {
    setShow(false);
  };

  // 오늘 다시 보지 않음 클릭 시 localStorage 저장 후 hide
  const handleNotToday = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ [today]: true }));
    setShow(false);
  };

  // hide 애니메이션 끝나면 실제로 unmount
  const handleAnimationEnd = (e: React.AnimationEvent<HTMLDivElement>) => {
    if (!show && e.target === popupRef.current) {
      setShouldRender(false);
      if (onClose) onClose();
    }
  };

  if (!shouldRender) return null;

  return (
    <div
      ref={popupRef}
      data-floating-popup="true"
      className={
        styles["floating-popup"] +
        " " + (show ? styles.show : styles.hide)
      }
      onAnimationEnd={handleAnimationEnd}
    >
      <div className={styles.inner}>
        {/* ----- TOP ----- */}
        <div className={styles.top}>
          <HiButton
            variant="link"
            type="button"
            className={styles.imgButton}
            onClick={onOpen}
          >
            <img src={imgSrc} alt="popup" />
          </HiButton>
        </div>

        {/* ----- BOTTOM ----- */}
        <div className={styles.bottom}>
          {hasTodayOption ? (
            <>
              <HiButton
                variant="link"
                type="button"
                className={styles.btnClose}
                onClick={handleNotToday}
              >
                오늘 다시 보지 않음
              </HiButton>
              <span className={styles.checkbox} />
            </>
          ) : (
            <HiButton
              variant="link"
              type="button"
              className={styles.btnClose}
              onClick={handleClose}
            >
              닫기 
              <X size={20} strokeWidth={1.6} />
            </HiButton>
          )}
        </div>
      </div>
    </div>
  );
};

export default FloatingPopup;