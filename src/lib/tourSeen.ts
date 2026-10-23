// Remembers per browser that the walkthrough was shown. Storage can be blocked, so every access is guarded.
const SEEN_KEY = 'gcc-planner-tour-seen'

export function hasSeenTour() {
  try {
    return localStorage.getItem(SEEN_KEY) === '1'
  } catch {
    return false
  }
}

export function markTourSeen() {
  try {
    localStorage.setItem(SEEN_KEY, '1')
  } catch {
    // Private mode or blocked storage: the tour just shows again next visit.
  }
}
