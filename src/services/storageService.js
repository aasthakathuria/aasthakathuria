const STORAGE_KEY = 'grocery-tracker-items'

export function getItems() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveItems(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch (e) {
    console.error('Failed to save items:', e)
  }
}

export function addItems(newItems) {
  const existing = getItems()
  const combined = [...existing, ...newItems]
  saveItems(combined)
}
