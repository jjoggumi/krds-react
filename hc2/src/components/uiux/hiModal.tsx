import React, { useEffect } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import styles from "./hiModal.module.scss"; // If using CSS modules, adjust as needed
import { X } from "lucide-react";
import { HiButton } from "./hiButton";

interface HiModalProps {
  isOpen: boolean;
  onClose: () => void;
  type?: string;
  size?: string;
  closeSkip?: boolean;
  modalLayerStyle?: React.CSSProperties;
  dimClose?: boolean;
  heading?: React.ReactNode;
  desc?: React.ReactNode;
  content?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode; // fallback for content
  className?: string;
}

const getClassList = ({
  type,
  size,
  closeSkip,
}: Pick<HiModalProps, "type" | "size" | "closeSkip">) => {
  const className = [];
  if (type === "type01") className.push(styles["modal-message"]);
  else if (type === "main") className.push(styles["main-popup"]);
  else if (type) className.push(styles[`modal-${type}`]);
  if (size) className.push(styles[`modal-${size}`]);
  if (closeSkip) className.push(styles["title-close-skip"]);
  return className.join(" ");
};

export const HiModal: React.FC<HiModalProps> = ({
  isOpen,
  onClose,
  type = null,
  size = null,
  closeSkip = false,
  modalLayerStyle = {},
  dimClose = false,
  heading,
  desc,
  content,
  footer,
  children,
  className = "",
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className={[
            styles["hi-modal-wrap"],
            'hi-modal-wrap',
            getClassList({ type, size, closeSkip }),
            className,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <motion.div
            className={`${styles["modal-dim"]}`}
            onClick={dimClose ? onClose : undefined}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          <motion.div
            className={`${styles["modal-layer"]}`}
            style={modalLayerStyle}
            initial={{ opacity: 0, y: 28, scale: 0.995 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 28, scale: 0.995 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={`${styles["modal-header"]}`}>
              <HiButton variant="link" onClick={onClose} className="absolute top-6 right-8">
                <X size={24} strokeWidth={1.6} color="var(--text-neutral-strong)" />
              </HiButton>
              {heading && <h2 className={styles['heading']}>{heading}</h2>}
              {desc && <div className={styles['desc']}>{desc}</div>}
            </div>
            <div className={`${styles["modal-content"]}${content ? "" : " n"}`}>
              {content ?? children}
            </div>
            {footer && (
              <div className={`${styles["modal-footer"]}`}>
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default HiModal;