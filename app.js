App({
  onLaunch: function () {
    this.initUserData()
  },
  
  initUserData: function() {
    let userData = wx.getStorageSync('userData')
    if (!userData) {
      userData = {
        todayTomatoes: 0,
        totalTomatoes: 0,
        currentPlant: null,
        gardenLevel: 1,
        unlockedPlants: [],
        plantRecords: [],
        lastFocusDate: ''
      }
      wx.setStorageSync('userData', userData)
    }
    this.globalData.userData = userData
  },
  
  globalData: {
    userData: null,
    plants: [
      { id: 1, name: '多肉', minTime: 3, maxTime: 8, emoji: '🌵', color: '#8BC34A' },
      { id: 2, name: '仙人掌', minTime: 5, maxTime: 12, emoji: '🌿', color: '#689F38' },
      { id: 3, name: '向日葵', minTime: 4, maxTime: 9, emoji: '🌻', color: '#FFC107' },
      { id: 4, name: '薄荷', minTime: 2, maxTime: 6, emoji: '🌱', color: '#AED581' },
      { id: 5, name: '绿萝', minTime: 6, maxTime: 10, emoji: '🍃', color: '#4CAF50' },
      { id: 6, name: '绣球', minTime: 7, maxTime: 11, emoji: '💐', color: '#9C27B0' },
      { id: 7, name: '铃兰', minTime: 3, maxTime: 7, emoji: '🌸', color: '#E1BEE7' },
      { id: 8, name: '小雏菊', minTime: 4, maxTime: 8, emoji: '🌼', color: '#FFEB3B' }
    ],
    plantStages: ['种子', '幼苗', '成株', '开花'],
    questions: [
      { id: 1, question: '多肉植物通常需要多久浇一次水？', options: ['每天', '每周', '每月', '每季度'], answer: 2, reward: 1 },
      { id: 2, question: '向日葵的花盘会随着什么转动？', options: ['月亮', '太阳', '星星', '风向'], answer: 1, reward: 1 },
      { id: 3, question: '薄荷属于什么科植物？', options: ['菊科', '唇形科', '蔷薇科', '豆科'], answer: 1, reward: 1 },
      { id: 4, question: '绿萝原产于哪个地区？', options: ['非洲', '南美洲', '亚洲', '欧洲'], answer: 1, reward: 1 },
      { id: 5, question: '仙人掌主要生长在什么环境？', options: ['热带雨林', '沙漠', '草原', '海边'], answer: 1, reward: 1 },
      { id: 6, question: '铃兰的花语是什么？', options: ['勇敢', '幸福归来', '永恒', '纯洁'], answer: 1, reward: 1 },
      { id: 7, question: '绣球花的颜色会受什么影响？', options: ['土壤酸碱度', '温度', '光照', '水分'], answer: 0, reward: 1 },
      { id: 8, question: '小雏菊象征着什么？', options: ['爱情', '快乐', '希望', '友谊'], answer: 2, reward: 1 }
    ]
  },
  
  saveUserData: function() {
    wx.setStorageSync('userData', this.globalData.userData)
  },
  
  getRandomPlant: function() {
    const plants = this.globalData.plants
    const unlockedIds = this.globalData.userData.unlockedPlants
    const availablePlants = unlockedIds.length < plants.length 
      ? plants.filter(p => Math.random() > 0.3 || unlockedIds.includes(p.id))
      : plants
    
    const randomPlant = availablePlants[Math.floor(Math.random() * availablePlants.length)]
    
    if (!unlockedIds.includes(randomPlant.id)) {
      this.globalData.userData.unlockedPlants.push(randomPlant.id)
      this.saveUserData()
    }
    
    return {
      ...randomPlant,
      bloomTime: Math.floor(Math.random() * (randomPlant.maxTime - randomPlant.minTime + 1)) + randomPlant.minTime,
      currentWater: 0,
      totalWaterNeeded: 4,
      stage: 0,
      focusMinutes: 0,
      isBloomed: false,
      isWilted: false,
      createdAt: Date.now()
    }
  },
  
  addWater: function(bonus = 0) {
    const plant = this.globalData.userData.currentPlant
    if (!plant || plant.isWilted) return false
    
    const critChance = Math.random()
    const extraBonus = critChance < 0.1 ? 2 : (critChance < 0.3 ? 1 : 0)
    const totalWater = 1 + bonus + extraBonus
    
    plant.currentWater += totalWater
    plant.focusMinutes += 25
    
    if (plant.currentWater >= plant.totalWaterNeeded) {
      plant.currentWater = 0
      if (plant.stage < 3) {
        plant.stage++
      }
      
      if (plant.stage === 3 && !plant.isBloomed) {
        if (plant.focusMinutes >= plant.bloomTime * 60) {
          plant.isBloomed = Math.random() > 0.3
        }
      }
    }
    
    this.globalData.userData.totalTomatoes++
    
    const today = new Date().toDateString()
    if (this.globalData.userData.lastFocusDate !== today) {
      this.globalData.userData.todayTomatoes = 1
      this.globalData.userData.lastFocusDate = today
    } else {
      this.globalData.userData.todayTomatoes++
    }
    
    this.globalData.userData.gardenLevel = Math.floor(this.globalData.userData.totalTomatoes / 10) + 1
    
    this.saveUserData()
    
    return { success: true, crit: extraBonus > 0, extraBonus }
  },
  
  wiltPlant: function() {
    const plant = this.globalData.userData.currentPlant
    if (plant) {
      plant.isWilted = true
      this.saveUserData()
    }
  },
  
  startNewPlant: function() {
    this.globalData.userData.currentPlant = this.getRandomPlant()
    this.saveUserData()
    return this.globalData.userData.currentPlant
  }
})