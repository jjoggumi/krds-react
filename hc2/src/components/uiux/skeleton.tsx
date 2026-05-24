import React from "react";
import { motion } from 'framer-motion';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  radius?: string;
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = 18,
  radius = "rounded-sm",
  className = "",
}) => {
  const shimmerWidth = typeof width === 'number' ? `${Math.max(40, Math.round(width * 0.4))}px` : '40%';

  return (
    <>
      <style>
        {`
          @keyframes skeleton-shimmer {
            0% { transform: translateX(-120%); }
            100% { transform: translateX(120%); }
          }
        `}
      </style>

      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className={`relative overflow-hidden bg-bg-neutral-subtler ${radius} ${className}`}
        style={{ width, height }}
      >
        <div
          className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-transparent via-white/30 to-transparent blur-sm opacity-60"
          aria-hidden
          style={{
            width: shimmerWidth,
            animation: 'skeleton-shimmer 1.6s linear infinite'
          }}
        />
      </motion.div>
    </>
  );
};

export default Skeleton;
