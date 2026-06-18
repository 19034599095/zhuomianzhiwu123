const app = getApp()

Page({
  data: {
    plants: [],
    unlockedPlants: [],
    filterType: 'all',
    showDetail: false,
    selectedPlant: null
  },

  onLoad: function() {
    this.loadData()
  },

  onShow: function() {
    this.loadData()
  },

  loadData: function() {
    this.setData({
      plants: app.globalData.plants,
      unlockedPlants: app.globalData.userData.unlockedPlants
    })
  },

  get totalPlants() {
    return this.data.plants.length
  },

  get unlockedCount() {
    return this.data.unlockedPlants.length
  },

  get collectionProgress() {
    return (this.unlockedCount / this.totalPlants) * 100
  },

  get filteredPlants() {
    if (this.data.filterType === 'all') {
      return this.data.plants
    } else if (this.data.filterType === 'unlocked') {
      return this.data.plants.filter(p => this.data.unlockedPlants.includes(p.id))
    } else {
      return this.data.plants.filter(p => !this.data.unlockedPlants.includes(p.id))
    }
  },

  isUnlocked: function(plant) {
    return this.data.unlockedPlants.includes(plant.id)
  },

  setFilter: function(type) {
    this.setData({ filterType: type })
  },

  showPlantDetail: function(e) {
    const plant = e.currentTarget.dataset.plant
    if (!this.isUnlocked(plant)) {
      wx.showToast({
        title: '完成专注解锁更多植物',
        icon: 'none'
      })
      return
    }
    
    this.setData({
      selectedPlant: plant,
      showDetail: true
    })
  },

  closeDetail: function() {
    this.setData({ showDetail: false })
  },

  stopPropagation: function() {},

  getPlantDescription: function(plant) {
    const descriptions = {
      1: '多肉植物耐旱易养，叶片肥厚饱满，是新手入门的最佳选择',
      2: '仙人掌生命力顽强，能在干旱环境中生存，象征坚韧不拔',
      3: '向日葵追逐阳光生长，花盘硕大明亮，代表积极向上',
      4: '薄荷清新芳香，可食用可驱蚊，是实用的香草植物',
      5: '绿萝净化空气能手，藤蔓飘逸优美，适合室内养护',
      6: '绣球花花球饱满，颜色会随土壤酸碱度变化',
      7: '铃兰花形优雅，香气清新，是浪漫的象征',
      8: '小雏菊小巧可爱，花期长，代表纯洁与希望'
    }
    return descriptions[plant.id] || '这是一株可爱的植物'
  },

  getPlantTips: function(plant) {
    const tips = {
      1: '多肉需要充足阳光，但要避免暴晒，浇水不宜过多',
      2: '仙人掌耐旱性极强，宁可少浇水也不要浇多',
      3: '向日葵需要充足的阳光才能茁壮成长',
      4: '薄荷生长迅速，定期修剪可以促进分枝',
      5: '绿萝喜湿润环境，但要避免积水',
      6: '绣球花喜欢酸性土壤，可以使用专用肥料',
      7: '铃兰喜欢凉爽环境，夏季需要遮阴',
      8: '小雏菊适应性强，保持土壤湿润即可'
    }
    return tips[plant.id] || '用心呵护，它会茁壮成长'
  }
})