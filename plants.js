export const PLANTS = [
  {
    id: 1,
    name: '多肉',
    emoji: '🌵',
    color: '#8BC34A',
    minTime: 3,
    maxTime: 8,
    description: '多肉植物耐旱易养，叶片肥厚饱满，是新手入门的最佳选择',
    tips: '多肉需要充足阳光，但要避免暴晒，浇水不宜过多'
  },
  {
    id: 2,
    name: '仙人掌',
    emoji: '🌿',
    color: '#689F38',
    minTime: 5,
    maxTime: 12,
    description: '仙人掌生命力顽强，能在干旱环境中生存，象征坚韧不拔',
    tips: '仙人掌耐旱性极强，宁可少浇水也不要浇多'
  },
  {
    id: 3,
    name: '向日葵',
    emoji: '🌻',
    color: '#FFC107',
    minTime: 4,
    maxTime: 9,
    description: '向日葵追逐阳光生长，花盘硕大明亮，代表积极向上',
    tips: '向日葵需要充足的阳光才能茁壮成长'
  },
  {
    id: 4,
    name: '薄荷',
    emoji: '🌱',
    color: '#AED581',
    minTime: 2,
    maxTime: 6,
    description: '薄荷清新芳香，可食用可驱蚊，是实用的香草植物',
    tips: '薄荷生长迅速，定期修剪可以促进分枝'
  },
  {
    id: 5,
    name: '绿萝',
    emoji: '🍃',
    color: '#4CAF50',
    minTime: 6,
    maxTime: 10,
    description: '绿萝净化空气能手，藤蔓飘逸优美，适合室内养护',
    tips: '绿萝喜湿润环境，但要避免积水'
  },
  {
    id: 6,
    name: '绣球',
    emoji: '💐',
    color: '#9C27B0',
    minTime: 7,
    maxTime: 11,
    description: '绣球花花球饱满，颜色会随土壤酸碱度变化',
    tips: '绣球花喜欢酸性土壤，可以使用专用肥料'
  },
  {
    id: 7,
    name: '铃兰',
    emoji: '🌸',
    color: '#E1BEE7',
    minTime: 3,
    maxTime: 7,
    description: '铃兰花形优雅，香气清新，是浪漫的象征',
    tips: '铃兰喜欢凉爽环境，夏季需要遮阴'
  },
  {
    id: 8,
    name: '小雏菊',
    emoji: '🌼',
    color: '#FFEB3B',
    minTime: 4,
    maxTime: 8,
    description: '小雏菊小巧可爱，花期长，代表纯洁与希望',
    tips: '小雏菊适应性强，保持土壤湿润即可'
  }
]

export const PLANT_STAGES = ['种子', '幼苗', '成株', '开花']

export const getPlantById = (id) => {
  return PLANTS.find(p => p.id === id)
}

export const getRandomPlant = () => {
  const index = Math.floor(Math.random() * PLANTS.length)
  return PLANTS[index]
}

export const createNewPlant = (plantId) => {
  const plant = plantId ? getPlantById(plantId) : getRandomPlant()
  if (!plant) return null

  const bloomTime = Math.floor(Math.random() * (plant.maxTime - plant.minTime + 1)) + plant.minTime

  return {
    ...plant,
    bloomTime,
    currentWater: 0,
    totalWaterNeeded: 4,
    stage: 0,
    focusMinutes: 0,
    isBloomed: false,
    isWilted: false,
    createdAt: Date.now()
  }
}

export const calculateGrowthProgress = (plant) => {
  if (!plant) return 0
  return (plant.currentWater / plant.totalWaterNeeded) * 100
}

export const calculateBloomProgress = (plant) => {
  if (!plant) return 0
  const minutes = plant.focusMinutes / 60
  return Math.min((minutes / plant.bloomTime) * 100, 100)
}