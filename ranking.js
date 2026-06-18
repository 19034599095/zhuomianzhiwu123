const app = getApp()

Page({
  data: {
    currentTab: 'tomatoes',
    userData: null,
    rankingData: [],
    myRank: 1,
    myScore: 0
  },

  onLoad: function() {
    this.loadData()
    this.generateMockData()
  },

  onShow: function() {
    this.loadData()
  },

  loadData: function() {
    const userData = app.globalData.userData
    this.setData({
      userData: userData
    })
    this.updateMyScore()
  },

  updateMyScore: function() {
    const userData = this.data.userData
    if (!userData) return

    let score = 0
    if (this.data.currentTab === 'tomatoes') {
      score = userData.todayTomatoes
    } else if (this.data.currentTab === 'plants') {
      score = userData.unlockedPlants.length
    } else {
      score = userData.gardenLevel
    }

    this.setData({ myScore: score })
    this.calculateRank()
  },

  get scoreUnit() {
    if (this.data.currentTab === 'tomatoes') {
      return '个番茄'
    } else if (this.data.currentTab === 'plants') {
      return '株植物'
    } else {
      return '级'
    }
  },

  setTab: function(tab) {
    this.setData({ currentTab: tab })
    this.updateMyScore()
    this.sortRanking()
  },

  generateMockData: function() {
    const mockUsers = [
      { name: '小明', avatar: '👦', score: { tomatoes: 8, plants: 6, level: 5 }, plant: '🌻', level: 5 },
      { name: '小红', avatar: '👧', score: { tomatoes: 6, plants: 5, level: 4 }, plant: '🌸', level: 4 },
      { name: '阿华', avatar: '👨', score: { tomatoes: 5, plants: 4, level: 3 }, plant: '🌿', level: 3 },
      { name: '小美', avatar: '👩', score: { tomatoes: 4, plants: 3, level: 3 }, plant: '🌱', level: 3 },
      { name: '大壮', avatar: '🧑', score: { tomatoes: 3, plants: 2, level: 2 }, plant: '🌵', level: 2 },
      { name: '小花', avatar: '👧', score: { tomatoes: 2, plants: 2, level: 2 }, plant: '🌼', level: 2 },
      { name: '老王', avatar: '👴', score: { tomatoes: 1, plants: 1, level: 1 }, plant: '🍃', level: 1 }
    ]

    this.setData({
      rankingData: mockUsers
    })

    this.sortRanking()
  },

  sortRanking: function() {
    const tab = this.data.currentTab
    const data = [...this.data.rankingData]
    
    data.sort((a, b) => {
      return b.score[tab] - a.score[tab]
    })

    this.setData({ rankingData: data })
    this.calculateRank()
  },

  calculateRank: function() {
    const myScore = this.data.myScore
    const tab = this.data.currentTab
    
    let rank = 1
    for (const user of this.data.rankingData) {
      if (user.score[tab] > myScore) {
        rank++
      }
    }

    this.setData({ myRank: rank })
  },

  shareGarden: function() {
    wx.showToast({
      title: '分享功能开发中',
      icon: 'none'
    })
  }
})