export const QUESTIONS = [
  {
    id: 1,
    question: '多肉植物通常需要多久浇一次水？',
    options: ['每天', '每周', '每月', '每季度'],
    answer: 2,
    reward: 1,
    explanation: '多肉植物耐旱性强，通常每周浇水一次即可，夏季可适当增加频率'
  },
  {
    id: 2,
    question: '向日葵的花盘会随着什么转动？',
    options: ['月亮', '太阳', '星星', '风向'],
    answer: 1,
    reward: 1,
    explanation: '向日葵具有向阳性，花盘会随着太阳的移动而转动'
  },
  {
    id: 3,
    question: '薄荷属于什么科植物？',
    options: ['菊科', '唇形科', '蔷薇科', '豆科'],
    answer: 1,
    reward: 1,
    explanation: '薄荷属于唇形科薄荷属植物'
  },
  {
    id: 4,
    question: '绿萝原产于哪个地区？',
    options: ['非洲', '南美洲', '亚洲', '欧洲'],
    answer: 1,
    reward: 1,
    explanation: '绿萝原产于南美洲的热带雨林地区'
  },
  {
    id: 5,
    question: '仙人掌主要生长在什么环境？',
    options: ['热带雨林', '沙漠', '草原', '海边'],
    answer: 1,
    reward: 1,
    explanation: '仙人掌主要生长在沙漠等干旱环境中'
  },
  {
    id: 6,
    question: '铃兰的花语是什么？',
    options: ['勇敢', '幸福归来', '永恒', '纯洁'],
    answer: 1,
    reward: 1,
    explanation: '铃兰的花语是"幸福归来"，代表幸福、吉祥'
  },
  {
    id: 7,
    question: '绣球花的颜色会受什么影响？',
    options: ['土壤酸碱度', '温度', '光照', '水分'],
    answer: 0,
    reward: 1,
    explanation: '绣球花的颜色会随土壤酸碱度变化，酸性土壤开蓝色花，碱性土壤开粉色花'
  },
  {
    id: 8,
    question: '小雏菊象征着什么？',
    options: ['爱情', '快乐', '希望', '友谊'],
    answer: 2,
    reward: 1,
    explanation: '小雏菊象征着希望、纯洁和美好'
  }
]

export const getRandomQuestion = () => {
  const index = Math.floor(Math.random() * QUESTIONS.length)
  return QUESTIONS[index]
}

export const getQuestionById = (id) => {
  return QUESTIONS.find(q => q.id === id)
}