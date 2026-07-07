const TRIGRAMS = [
  { name: '乾', nature: '天', pattern: '111', image: '刚健', advice: '主动但不躁进' },
  { name: '兑', nature: '泽', pattern: '110', image: '悦动', advice: '重视沟通与承诺' },
  { name: '离', nature: '火', pattern: '101', image: '明辨', advice: '先看清事实再行动' },
  { name: '震', nature: '雷', pattern: '100', image: '发动', advice: '动中求稳' },
  { name: '巽', nature: '风', pattern: '011', image: '入微', advice: '柔顺推进' },
  { name: '坎', nature: '水', pattern: '010', image: '险陷', advice: '谨慎穿越风险' },
  { name: '艮', nature: '山', pattern: '001', image: '止定', advice: '先停后定' },
  { name: '坤', nature: '地', pattern: '000', image: '承载', advice: '顺势承接' },
]

const HEXAGRAM_NAMES = [
  ['乾为天', '天泽履', '天火同人', '天雷无妄', '天风姤', '天水讼', '天山遁', '天地否'],
  ['泽天夬', '兑为泽', '泽火革', '泽雷随', '泽风大过', '泽水困', '泽山咸', '泽地萃'],
  ['火天大有', '火泽睽', '离为火', '火雷噬嗑', '火风鼎', '火水未济', '火山旅', '火地晋'],
  ['雷天大壮', '雷泽归妹', '雷火丰', '震为雷', '雷风恒', '雷水解', '雷山小过', '雷地豫'],
  ['风天小畜', '风泽中孚', '风火家人', '风雷益', '巽为风', '风水涣', '风山渐', '风地观'],
  ['水天需', '水泽节', '水火既济', '水雷屯', '水风井', '坎为水', '水山蹇', '水地比'],
  ['山天大畜', '山泽损', '山火贲', '山雷颐', '山风蛊', '山水蒙', '艮为山', '山地剥'],
  ['地天泰', '地泽临', '地火明夷', '地雷复', '地风升', '地水师', '地山谦', '坤为地'],
]

const TEXTS = {
  乾为天: {
    guaci: '元亨，利贞。',
    xiang: '天行健，君子以自强不息。',
    yaoci: ['初九，潜龙勿用。', '九二，见龙在田，利见大人。', '九三，君子终日乾乾，夕惕若厉，无咎。', '九四，或跃在渊，无咎。', '九五，飞龙在天，利见大人。', '上九，亢龙有悔。'],
  },
  坤为地: {
    guaci: '元亨，利牝马之贞。',
    xiang: '地势坤，君子以厚德载物。',
    yaoci: ['初六，履霜，坚冰至。', '六二，直方大，不习无不利。', '六三，含章可贞。', '六四，括囊，无咎无誉。', '六五，黄裳，元吉。', '上六，龙战于野，其血玄黄。'],
  },
  水雷屯: {
    guaci: '元亨，利贞，勿用有攸往，利建侯。',
    xiang: '云雷，屯；君子以经纶。',
    yaoci: ['初九，磐桓，利居贞，利建侯。', '六二，屯如邅如，乘马班如。', '六三，即鹿无虞，惟入于林中。', '六四，乘马班如，求婚媾，往吉。', '九五，屯其膏，小贞吉，大贞凶。', '上六，乘马班如，泣血涟如。'],
  },
  山水蒙: {
    guaci: '亨。匪我求童蒙，童蒙求我。',
    xiang: '山下出泉，蒙；君子以果行育德。',
    yaoci: ['初六，发蒙，利用刑人。', '九二，包蒙吉，纳妇吉。', '六三，勿用取女。', '六四，困蒙，吝。', '六五，童蒙，吉。', '上九，击蒙，不利为寇，利御寇。'],
  },
  水天需: {
    guaci: '有孚，光亨，贞吉，利涉大川。',
    xiang: '云上于天，需；君子以饮食宴乐。',
    yaoci: ['初九，需于郊，利用恒，无咎。', '九二，需于沙，小有言，终吉。', '九三，需于泥，致寇至。', '六四，需于血，出自穴。', '九五，需于酒食，贞吉。', '上六，入于穴，有不速之客三人来，敬之终吉。'],
  },
  天水讼: {
    guaci: '有孚窒惕，中吉，终凶。利见大人，不利涉大川。',
    xiang: '天与水违行，讼；君子以作事谋始。',
    yaoci: ['初六，不永所事，小有言，终吉。', '九二，不克讼，归而逋。', '六三，食旧德，贞厉，终吉。', '九四，不克讼，复即命。', '九五，讼，元吉。', '上九，或锡之鞶带，终朝三褫之。'],
  },
  地水师: {
    guaci: '贞，丈人吉，无咎。',
    xiang: '地中有水，师；君子以容民畜众。',
    yaoci: ['初六，师出以律，否臧凶。', '九二，在师中，吉无咎。', '六三，师或舆尸，凶。', '六四，师左次，无咎。', '六五，田有禽，利执言，无咎。', '上六，大君有命，开国承家。'],
  },
  水地比: {
    guaci: '吉。原筮，元永贞，无咎。',
    xiang: '地上有水，比；先王以建万国，亲诸侯。',
    yaoci: ['初六，有孚比之，无咎。', '六二，比之自内，贞吉。', '六三，比之匪人。', '六四，外比之，贞吉。', '九五，显比，王用三驱。', '上六，比之无首，凶。'],
  },
}

export function buildZhouyiReading(lines = [], question = '') {
  const normalized = normalizeLines(lines)
  const changed = normalized.map((line) => line.changing ? { ...line, type: line.type === 'yang' ? 'yin' : 'yang' } : line)
  const original = buildHexagram(normalized)
  const transformed = buildHexagram(changed)
  const movingLines = normalized.map((line, index) => line.changing ? index + 1 : null).filter(Boolean)
  const activeLine = movingLines[0] || null
  const originalText = getHexagramText(original)
  const changedText = getHexagramText(transformed)

  return {
    question: question || '未书写，心中默念',
    original: { ...original, ...originalText },
    changed: { ...transformed, ...changedText },
    movingLines,
    activeLine,
    tags: resultTags(original, transformed, movingLines),
    plainText: explainPlain(original, transformed, movingLines),
    action: actionAdvice(original, transformed, movingLines),
  }
}

function normalizeLines(lines) {
  const fallback = [
    { type: 'yang', changing: true, name: '老阳' },
    { type: 'yang', changing: false, name: '少阳' },
    { type: 'yang', changing: false, name: '少阳' },
    { type: 'yang', changing: false, name: '少阳' },
    { type: 'yang', changing: false, name: '少阳' },
    { type: 'yang', changing: false, name: '少阳' },
  ]
  const source = Array.isArray(lines) && lines.length === 6 ? lines : fallback
  return source.map((line, index) => ({
    type: line.type === 'yin' ? 'yin' : 'yang',
    changing: Boolean(line.changing),
    name: line.name || (line.type === 'yin' ? '阴爻' : '阳爻'),
    id: line.id || `line-${index}`,
  }))
}

function buildHexagram(lines) {
  const lower = trigramFromLines(lines.slice(0, 3))
  const upper = trigramFromLines(lines.slice(3, 6))
  const name = HEXAGRAM_NAMES[trigramIndex(upper)][trigramIndex(lower)]
  return {
    name,
    upper,
    lower,
    image: `${upper.nature}上${lower.nature}下`,
    structure: `${upper.name}${lower.name}`,
  }
}

function trigramFromLines(lines) {
  const pattern = lines.map((line) => line.type === 'yang' ? '1' : '0').join('')
  return TRIGRAMS.find((item) => item.pattern === pattern) || TRIGRAMS[0]
}

function trigramIndex(trigram) {
  return Math.max(0, TRIGRAMS.findIndex((item) => item.name === trigram.name))
}

function getHexagramText(hexagram) {
  const known = TEXTS[hexagram.name]
  if (known) return known
  return {
    guaci: `${hexagram.name}，取${hexagram.upper.image}与${hexagram.lower.image}之象。`,
    xiang: `${hexagram.image}，宜先观本卦所示处境，再看动爻与变卦的转向。`,
    yaoci: Array.from({ length: 6 }, (_, index) => `${lineLabel(index + 1)}，${index < 3 ? hexagram.lower.advice : hexagram.upper.advice}。`),
  }
}

function resultTags(original, changed, movingLines) {
  const tags = ['文化参考']
  if (movingLines.length === 0) tags.push('宜守')
  if (movingLines.length === 1) tags.push('一爻发动')
  if (movingLines.length > 1) tags.push('多爻变动')
  if (original.upper.name === original.lower.name) tags.push('本气纯一')
  if (original.name !== changed.name) tags.push('有变卦')
  return tags
}

function explainPlain(original, changed, movingLines) {
  const moving = movingLines.length ? `动爻在第 ${movingLines.join('、')} 爻，说明事情已有变化点。` : '本卦无动爻，说明当前更适合守住主线，先不急变。'
  return `${original.name}为本卦，取${original.upper.image}与${original.lower.image}之象；${changed.name}为变卦，表示后续转向。${moving}`
}

function actionAdvice(original, changed, movingLines) {
  if (!movingLines.length) return `先按${original.lower.advice}处理眼前事务，再观察外部反馈。`
  if (movingLines.length >= 3) return '变化点较多，先降低承诺和成本，分阶段验证，不宜一次做重决策。'
  return `先处理第 ${movingLines.join('、')} 爻对应的关键变化，再看是否转向${changed.name}所示的局面。`
}

function lineLabel(position) {
  return ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'][position - 1] || `${position}爻`
}
