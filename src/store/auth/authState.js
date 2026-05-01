export let globalUser = null
export let globalLoading = true
export let globalApproved = false
export let globalSessionId = null

export function setGlobalUser(val) {
    globalUser = val
}

export function setGlobalLoading(val) {
    globalLoading = val
}

export function setGlobalApproved(val) {
    globalApproved = val
}

export function setGlobalSessionId(val) {
    globalSessionId = val
}