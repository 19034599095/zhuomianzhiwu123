const app = getApp()

Page({
  data: {
    userData: null,
    currentPlant: null,
    plantStages: ['种子', '幼苗', '成株', '开花'],
    
    timerSeconds: 25 * 60,
    isRunning: false,
    isPaused: false,
    currentMode: 'focus',
    focusCount: 0,
    
    plantShaking: false,
    showWaterEffect: false,
    showCritEffect: false,
    lastCritBonus: 0,
    petMessage: '',
    
    showWaterModal: false,
    waterScore: 0,
    targetX: 100,
    targetY: 100,
    
    showQuestionModal: false,
    questions: [],
    currentQuestion: null,
    selectedAnswer: null,
    questionIndex: 0
  },

  onLoad: function() {
    this.loadUserData()
    this.loadQuestions()
  },

  onShow: function() {
    this.loadUserData()
  },

  loadUserData: function() {
    const userData = app.globalData.userData
    this.setData({
      userData: userData,
      currentPlant: userData.currentPlant
    })
  },

  loadQuestions: function() {
    this.setData({
      questions: app.globalData.questions,
      currentQuestion: app.globalData.questions[0]
    })
  },

  formatTime: function(seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  },

  get plantStages() {
    return app.globalData.plantStages
  },

  getPlantEmoji: function(plant) {
    if (!plant) return '🌱'
    const plants = app.globalData.plants
    const found = plants.find(p => p.id === plant.id)
    return found ? found.emoji : '🌱'
  },

  get timerGradient() {
    if (this.data.currentMode === 'focus') {
      return 'linear-gradient(135deg, #FF9800 0%, #FF5722 100%)'
    } else if (this.data.currentMode === 'shortBreak') {
      return 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)'
    } else {
      return 'linear-gradient(135deg, #2196F3 0%, #42A5F5 100%)'
    }
  },

  get progress() {
    const total = this.data.currentMode === 'focus' ? 25 * 60 : 
                 this.data.currentMode === 'shortBreak' ? 5 * 60 : 15 * 60
    return (total - this.data.timerSeconds) / total
  },

  startTimer: function() {
    if (!this.data.currentPlant) {
      this.startNewPlant()
    }
    
    if (this.data.currentPlant && this.data.currentPlant.isWilted) {
      wx.showToast({
        title: '植物枯萎了，先种新的吧',
        icon: 'none'
      })
      return
    }

    this.setData({
      isRunning: true,
      isPaused: false
    })

    this.timer = setInterval(() => {
      this.setData({
        timerSeconds: this.data.timerSeconds - 1
      })

      if (this.data.timerSeconds <= 0) {
        this.timerComplete()
      }
    }, 1000)

    this.showPetMessage('开始专注啦，别放弃我哦～')
  },

  pauseTimer: function() {
    clearInterval(this.timer)
    this.setData({
      isRunning: false,
      isPaused: true
    })
    this.showPetMessage('休息一下，马上回来哦～')
  },

  abortTimer: function() {
    clearInterval(this.timer)
    this.setData({
      isRunning: false,
      isPaused: false,
      timerSeconds: 25 * 60,
      currentMode: 'focus'
    })
    
    if (this.data.currentPlant) {
      app.wiltPlant()
      this.loadUserData()
      this.showPetMessage('😭 植物枯萎了...')
      this.setData({ plantShaking: true })
      setTimeout(() => this.setData({ plantShaking: false }), 500)
    }
  },

  timerComplete: function() {
    clearInterval(this.timer)

    if (this.data.currentMode === 'focus') {
      this.data.focusCount++
      this.addWater()
      this.showPetMessage('🎉 完成！植物喝到水啦～')
      
      if (this.data.focusCount >= 4) {
        this.data.focusCount = 0
        this.setData({
          timerSeconds: 15 * 60,
          currentMode: 'longBreak'
        })
      } else {
        this.setData({
          timerSeconds: 5 * 60,
          currentMode: 'shortBreak'
        })
      }

      setTimeout(() => {
        if (!this.data.isPaused) {
          this.startTimer()
        }
      }, 3000)
    } else {
      this.setData({
        timerSeconds: 25 * 60,
        currentMode: 'focus',
        isRunning: false,
        isPaused: false
      })
      this.showPetMessage('休息结束，准备下一轮专注吧！')
    }
  },

  addWater: function() {
    const result = app.addWater()
    this.loadUserData()
    
    if (result.success) {
      this.setData({
        showWaterEffect: true
      })
      setTimeout(() => this.setData({ showWaterEffect: false }), 800)
      
      if (result.crit) {
        this.setData({
          showCritEffect: true,
          lastCritBonus: result.extraBonus
        })
        setTimeout(() => this.setData({ showCritEffect: false }), 1000)
      }
    }
  },

  startNewPlant: function() {
    const newPlant = app.startNewPlant()
    this.setData({
      currentPlant: newPlant
    })
    this.showPetMessage('🌱 种下了一颗新种子！')
  },

  showPetMessage: function(msg) {
    this.setData({ petMessage: msg })
    setTimeout(() => this.setData({ petMessage: '' }), 3000)
  },

  openWaterGame: function() {
    if (!this.data.currentPlant || this.data.currentPlant.isWilted) {
      wx.showToast({ title: '先种一棵植物吧', icon: 'none' })
      return
    }
    
    this.setData({
      showWaterModal: true,
      waterScore: 0
    })
    this.moveTarget()
  },

  closeWaterModal: function() {
    this.setData({ showWaterModal: false })
    if (this.data.waterScore > 0) {
      app.addWater(Math.floor(this.data.waterScore / 10))
      this.loadUserData()
      wx.showToast({ title: `获得 ${Math.floor(this.data.waterScore / 10)} 次浇水奖励`, icon: 'success' })
    }
  },

  moveTarget: function() {
    if (!this.data.showWaterModal) return
    const containerWidth = 520
    const containerHeight = 300
    const targetSize = 80
    
    this.setData({
      targetX: Math.random() * (containerWidth - targetSize),
      targetY: Math.random() * (containerHeight - targetSize)
    })

    setTimeout(() => this.moveTarget(), 1500)
  },

  tapWater: function(e) {
    const target = this.data
    const clickX = e.detail.x - 40
    const clickY = e.detail.y - 200
    
    const distance = Math.sqrt(
      Math.pow(clickX - target.targetX, 2) + 
      Math.pow(clickY - target.targetY, 2)
    )

    if (distance < 60) {
      this.setData({
        waterScore: this.data.waterScore + 10
      })
      this.moveTarget()
    }
  },

  stopPropagation: function() {},

  openQuestion: function() {
    this.setData({
      showQuestionModal: true,
      questionIndex: 0,
      selectedAnswer: null,
      currentQuestion: this.data.questions[0]
    })
  },

  closeQuestionModal: function() {
    this.setData({ showQuestionModal: false })
  },

  selectAnswer: function(e) {
    if (this.data.selectedAnswer !== null) return
    
    const index = parseInt(e.currentTarget.dataset.index)
    this.setData({ selectedAnswer: index })

    if (index === this.data.currentQuestion.answer) {
      app.addWater(this.data.currentQuestion.reward)
      this.loadUserData()
    }
  },

  nextQuestion: function() {
    this.data.questionIndex++
    if (this.data.questionIndex >= this.data.questions.length) {
      this.closeQuestionModal()
      return
    }
    
    this.setData({
      currentQuestion: this.data.questions[this.data.questionIndex],
      selectedAnswer: null
    })
  }
})