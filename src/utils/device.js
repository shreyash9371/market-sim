export function isMobileDevice() {
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    const isNarrow = window.innerWidth < 1024
    const ua = navigator.userAgent
    const isMobileUA = /Android.*Mobile|iPhone|iPod/i.test(ua)

    return hasTouch && isNarrow && isMobileUA
}