const USER_DATA_KEY = 'desktopGarden_userData'
const SETTINGS_KEY = 'desktopGarden_settings'

const defaultUserData = {
  todayTomatoes: 0,
  totalTomatoes: 0,
  currentPlant: null,
  gardenLevel: 1,
  unlockedPlants: [],
  plantRecords: [],
  lastFocusDate: '',
  settings: {
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    soundEnabled: true,
    vibrationEnabled: true
  }
}

const defaultSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  soundEnabled: true,
  vibrationEnabled: true
}

export const getUserData = () => {
  try {
    const data = wx.getStorageSync(USER_DATA_KEY)
    return data ? JSON.parse(data) : { ...defaultUserData }
  } catch (e) {
    console.error('Failed to get user data:', e)
    return { ...defaultUserData }
  }
}

export const saveUserData = (data) => {
  try {
    wx.setStorageSync(USER_DATA_KEY, JSON.stringify(data))
    return true
  } catch (e) {
    console.error('Failed to save user data:', e)
    return false
  }
}

export const getSettings = () => {
  try {
    const data = wx.getStorageSync(SETTINGS_KEY)
    return data ? JSON.parse(data) : { ...defaultSettings }
  } catch (e) {
    console.error('Failed to get settings:', e)
    return { ...defaultSettings }
  }
}

export const saveSettings = (settings) => {
  try {
    wx.setStorageSync(SETTINGS_KEY, JSON.stringify(settings))
    return true
  } catch (e) {
    console.error('Failed to save settings:', e)
    return false
  }
}

export const resetUserData = () => {
  try {
    wx.setStorageSync(USER_DATA_KEY, JSON.stringify(defaultUserData))
    return true
  } catch (e) {
    console.error('Failed to reset user data:', e)
    return false
  }
}

export const formatDate = (timestamp) => {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export const isToday = (dateStr) => {
  return dateStr === new Date().toDateString()
}

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}