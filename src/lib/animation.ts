/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   AVRYTHINK SUITE — Motion System
   Centralised animation configs for framer-motion.
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

// ── Core transitions ──

export const spring = { type: 'spring' as const, stiffness: 400, damping: 32 }

export const easeOut = { duration: 0.18, ease: [0.0, 0.0, 0.2, 1] as const }

export const easeIn = { duration: 0.12, ease: [0.4, 0.0, 1, 1] as const }

export const smooth = { duration: 0.22, ease: [0.4, 0.0, 0.2, 1] as const }

// ── Preset variants ──

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: easeOut },
}

export const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.0, 0.0, 0.2, 1] as const } },
}

export const fadeDown = {
  hidden: { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0, transition: smooth },
}

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: spring },
}

export const stagger = {
  visible: { transition: { staggerChildren: 0.04, delayChildren: 0.08 } },
}

// ── Interaction presets ──

export const buttonTap = {
  whileTap: { scale: 0.97 },
  whileHover: { y: -1 },
  transition: { type: 'spring' as const, stiffness: 500, damping: 30 },
}

export const cardHover = {
  whileHover: { y: -3, transition: { duration: 0.15 } },
}

// ── Overlay / Modal ──

export const modalOverlay = {
  initial: { opacity: 0 },
  animate: { opacity: 0.4, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}

export const modalContent = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1, transition: spring },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.15 } },
}

// ── Dropdown ──

export const dropdownContent = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.14 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.1 } },
}

// ── Context menu ──

export const contextMenuContent = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1, transition: spring },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.12 } },
}

// ── Toast ──

export const toastEnter = {
  initial: { opacity: 0, x: 32 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, x: 32, transition: { duration: 0.2 } },
}

// ── List items ──

export const listItem = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

export const listItemStagger = {
  visible: { transition: { staggerChildren: 0.04 } },
  hidden: {},
}

// ── Tab indicator ──

export const tabIndicator = { type: 'spring' as const, stiffness: 500, damping: 35 }

// ── Reduced motion helper ──

export function getMotionProps(prefersReducedMotion: boolean) {
  if (prefersReducedMotion) {
    return { duration: 0, x: 0, y: 0, scale: 1, opacity: 1 }
  }
  return {}
}
