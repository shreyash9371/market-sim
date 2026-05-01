export const listeners = new Set()

export function notify() {
    listeners.forEach(fn => fn())
}