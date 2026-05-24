import { Variants } from 'framer-motion';

/**
 * 기본 페이드 인 애니메이션
 */
export const FADE_IN_VARIANTS: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.3,
        },
    },
};

/**
 * 순서 지정이 가능한 페이드 인 애니메이션
 * custom={index} 형태로 순서를 지정
 */
export const FADE_IN_ORDERED_VARIANTS: Variants = {
    hidden: { opacity: 0 },
    visible: (i: number = 0) => ({
        opacity: 1,
        transition: {
            delay: i * 0.3,
            duration: 0.3,
        },
    }),
};

export const STAGGER_CONTAINER_VARIANTS = FADE_IN_VARIANTS;
export const STAGGER_CONTAINER_FAST_VARIANTS = FADE_IN_VARIANTS;
export const FADE_IN_UP_VARIANTS = FADE_IN_VARIANTS;
export const FADE_IN_RIGHT_VARIANTS = FADE_IN_VARIANTS;
export const FADE_IN_UP_ORDERED_VARIANTS = FADE_IN_ORDERED_VARIANTS;
export const FADE_IN_RIGHT_ORDERED_VARIANTS = FADE_IN_ORDERED_VARIANTS;
