const app = getApp()

Page({
  data: {
    userData: null,
    currentPlant: null,
    plantRecords: [],
    plantStages: ['种子', '幼苗', '成株', '开花']
  },

  onLoad: function() {
    this.loadUserData()
  },

  onShow: function() {
    this.loadUserData()
  },

  loadUserData: function() {
    const userData = app.globalData.userData
    this.setData({
      userData: userData,
      currentPlant: userData.currentPlant,
      plantRecords: userData.plantRecords || []
    })
  },

  get unlockedCount() {
    return this.data.userData ? this.data.userData.unlockedPlants.length : 0
  },

  getPlantEmoji: function(plant) {
    if (!plant) return '🌱'
    const plants = app.globalData.plants
    const found = plants.find(p => p.id === plant.id)
    return found ? found.emoji : '🌱'
  },

  get growthProgress() {
    if (!this.data.currentPlant) return 0
    return (this.data.currentPlant.currentWater / this.data.currentPlant.totalWaterNeeded) * 100
  },

  get bloomProgress() {
    if (!this.data.currentPlant) return 0
    const minutes = this.data.currentPlant.focusMinutes / 60
    return Math.min((minutes / this.data.currentPlant.bloomTime) * 100, 100)
  },

  formatBloomTime: function(seconds) {
    return Math.floor(seconds / 60)
  },

  formatDate: function(timestamp) {
    const date = new Date(timestamp)
    return `${date.getMonth() + 1}/${date.getDate()}`
  },

  startNewPlant: function() {
    const newPlant = app.startNewPlant()
    
    if (this.data.currentPlant && !this.data.currentPlant.isWilted) {
      this.data.plantRecords.unshift({ ...this.data.currentPlant })
      app.globalData.userData.plantRecords = this.data.plantRecords
      app.saveUserData()
    }
    
    this.loadUserData()
    
    wx.showToast({
      title: '🌱 种下了一颗新种子！',
      icon: 'none'
    })
  },

  goToFocus: function() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  }
})