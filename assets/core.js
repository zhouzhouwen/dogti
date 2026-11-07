/* DOGTI 核心数据（与语言无关）
 * 维度：Gosling, Kwan & John (2003) —— 狗的 Energy / Affection / Emotional Reactivity / Intelligence
 * 对应人类大五人格的 外向性 / 宜人性 / 神经质 / 开放性；4 维 × 高低 = 16 种。
 * 第 5 维 C（尽责性/自律）只在人类和黑猩猩身上出现（Gosling & John, 1999），只决定"款"，不决定狗种。
 * 题目改写自公有领域 IPIP 大五题库；每个类型维度 6 题（正反向各 3），C 维 4 题（正反向各 2）。
 */
window.TI_CORE = {
  site: { id: 'dogti', name: 'DOGTI', version: '2.2.0', hero: ['golden', 'shiba', 'husky'], runner: 'corgi', loader: 'dachshund', combo: ['corgi', 'shiba'], combo2: ['collie', 'bichon'] },
  typeDims: ['E', 'A', 'N', 'O'],
  modDim: 'C',
  eggTriggers: { speed: 'speed', sloth: 'sloth', night: 'night', early: 'early', again: 'again', twin: 'twin', shiny: 'shiny', goal: 'bone', lang: 'bilingual' },
  petEgg: 'petter',
  consoleArt: '∪･ω･∪ 汪！Woof!',
  goalIcon: '<svg viewBox="0 0 40 40" width="34" height="34"><path d="M8 22a5 5 0 1 1 5-5h14a5 5 0 1 1 5 5 5 5 0 1 1-5 5H13a5 5 0 1 1-5-5z" fill="#fff7e8" stroke="#2b211c" stroke-width="2.6" stroke-linejoin="round"/></svg>',
  dims: [
    { key: 'E', color: '#ff8a3d' },
    { key: 'A', color: '#ff6fa5' },
    { key: 'N', color: '#8b7cff' },
    { key: 'O', color: '#1fb5a3' },
    { key: 'C', color: '#e3a400', human: true }
  ],
  // 题目顺序与 lang-*.js 里的 items 一一对应；k = 1 正向，-1 反向
  items: [
    { d: 'E', k: 1 }, { d: 'A', k: 1 }, { d: 'N', k: 1 }, { d: 'O', k: 1 },
    { d: 'E', k: -1 }, { d: 'A', k: -1 }, { d: 'C', k: 1 }, { d: 'N', k: -1 },
    { d: 'O', k: -1 }, { d: 'E', k: 1 }, { d: 'A', k: 1 }, { d: 'N', k: 1 },
    { d: 'O', k: 1 }, { d: 'C', k: -1 }, { d: 'E', k: -1 }, { d: 'A', k: -1 },
    { d: 'N', k: -1 }, { d: 'O', k: -1 }, { d: 'E', k: 1 }, { d: 'A', k: 1 },
    { d: 'C', k: 1 }, { d: 'N', k: 1 }, { d: 'O', k: 1 }, { d: 'E', k: -1 },
    { d: 'A', k: -1 }, { d: 'N', k: -1 }, { d: 'O', k: -1 }, { d: 'C', k: -1 }
  ],
  // 类型键 = E A N O 四维的高(H)/低(L)
  types: {
    HHLH: { art: 'golden', bg: '#ffe9a8', ac: '#d9900f' },
    HHLL: { art: 'corgi', bg: '#ffd9b8', ac: '#e0701f' },
    HHHH: { art: 'samoyed', bg: '#dcebff', ac: '#3f7fd6' },
    HHHL: { art: 'bichon', bg: '#ffe0ea', ac: '#e04f86' },
    HLLH: { art: 'husky', bg: '#d9e2ff', ac: '#4b5fc4' },
    HLLL: { art: 'tianyuan', bg: '#f6e7c1', ac: '#b9811f' },
    HLHH: { art: 'collie', bg: '#d9f2e6', ac: '#23935f' },
    HLHL: { art: 'chihuahua', bg: '#ffd6cf', ac: '#d9443d' },
    LHLH: { art: 'labrador', bg: '#e6f0d6', ac: '#5f8f2c' },
    LHLL: { art: 'frenchie', bg: '#eadcf8', ac: '#8152cf' },
    LHHH: { art: 'poodle', bg: '#ffe3d3', ac: '#cf6630' },
    LHHL: { art: 'maltese', bg: '#fbe3f1', ac: '#c94d93' },
    LLLH: { art: 'shiba', bg: '#ffe1c4', ac: '#d86c14' },
    LLLL: { art: 'chow', bg: '#f3e2cc', ac: '#a8661f' },
    LLHH: { art: 'dachshund', bg: '#dcf0f3', ac: '#26879a' },
    LLHL: { art: 'akita', bg: '#f9dcd6', ac: '#c0413a' }
  },
  // 隐藏款：特殊作答方式触发，替换结果页主角（按顺序判定）
  hidden: {
    mystery: { art: 'mystery', bg: '#ece7ff', ac: '#6f59d9' },
    echo: { art: 'echo', bg: '#fff1b8', ac: '#c98a00' },
    rebel: { art: 'rebel', bg: '#ffd9d4', ac: '#c43c2f' },
    diode: { art: 'diode', bg: '#e8e8ee', ac: '#2f3040' }
  },
  hiddenOrder: ['mystery', 'echo', 'rebel', 'diode'],
  // 彩蛋卡：收藏在图鉴里，不改变结果
  eggs: {
    speed: { art: 'speed', bg: '#fff3c4', ac: '#d99a00' },
    sloth: { art: 'sloth', bg: '#e3f0d9', ac: '#5e8f3a' },
    night: { art: 'night', bg: '#dcdcff', ac: '#3f46b8' },
    early: { art: 'early', bg: '#ffe6cc', ac: '#e07b25' },
    again: { art: 'again', bg: '#dff3f0', ac: '#1f9a88' },
    twin: { art: 'twin', bg: '#ffe0ea', ac: '#d6457f' },
    shiny: { art: 'shiny', bg: '#fff6c9', ac: '#c79a00' },
    petter: { art: 'petter', bg: '#ffe3ef', ac: '#d94f8a' },
    bone: { art: 'bone', bg: '#fff1dc', ac: '#c98a2a' },
    bilingual: { art: 'bilingual', bg: '#e3f0ff', ac: '#3f7fd6' }
  },
  eggOrder: ['speed', 'sloth', 'night', 'early', 'again', 'twin', 'shiny', 'petter', 'bone', 'bilingual'],
  rules: {
    mysteryNeutral: 15,   // ≥15 题选"说不好"
    echoAgree: 23,        // ≥23 题选同意（4 或 5）
    rebelDisagree: 23,    // ≥23 题选不同意（1 或 2）
    diodeExtreme: 24,     // ≥24 题只选两端（1 或 5）
    speedMs: 50000, slothMs: 360000, petterTaps: 30, againRuns: 3
  },
  // 两种狗的关系：按"哪几个维度不同"（E A N O，1=不同）给基础默契值
  rel: {
    '0000': 90, '1000': 88, '0100': 84, '0010': 91, '0001': 86,
    '1100': 79, '1010': 96, '1001': 81, '0110': 80, '0101': 77, '0011': 83,
    '1110': 74, '1101': 72, '1011': 76, '0111': 73, '1111': 70
  },
  circle: ['1010', '0000', '0101', '0010', '1000', '1111'],
  refs: [
    { cite: 'Gosling, S. D., Kwan, V. S. Y., & John, O. P. (2003). A dog\'s got personality: A cross-species comparative approach to personality judgments in dogs and humans. Journal of Personality and Social Psychology, 85(6), 1161–1169.', doi: '10.1037/0022-3514.85.6.1161' },
    { cite: 'Gosling, S. D., & John, O. P. (1999). Personality dimensions in nonhuman animals: A cross-species review. Current Directions in Psychological Science, 8(3), 69–75.', doi: '10.1111/1467-8721.00017' },
    { cite: 'Goldberg, L. R., Johnson, J. A., Eber, H. W., Hogan, R., Ashton, M. C., Cloninger, C. R., & Gough, H. G. (2006). The International Personality Item Pool and the future of public-domain personality measures. Journal of Research in Personality, 40(1), 84–96.', doi: '10.1016/j.jrp.2005.08.007' },
    { cite: 'Donnellan, M. B., Oswald, F. L., Baird, B. M., & Lucas, R. E. (2006). The Mini-IPIP scales: Tiny-yet-effective measures of the Big Five factors of personality. Psychological Assessment, 18(2), 192–203.', doi: '10.1037/1040-3590.18.2.192' },
    { cite: 'Likert, R. (1932). A technique for the measurement of attitudes. Archives of Psychology, 22(140), 1–55.', doi: '' },
    { cite: 'Simms, L. J., Zelazny, K., Williams, T. F., & Bernstein, L. (2019). Does the number of response options matter? Psychometric perspectives using personality questionnaire data. Psychological Assessment, 31(4), 557–566.', doi: '10.1037/pas0000648' },
    { cite: 'Haslam, N., Holland, E., & Kuppens, P. (2012). Categories versus dimensions in personality and psychopathology: A quantitative review of taxometric research. Psychological Medicine, 42(5), 903–920.', doi: '10.1017/S0033291711001966' },
    { cite: 'Forer, B. R. (1949). The fallacy of personal validation: A classroom demonstration of gullibility. Journal of Abnormal and Social Psychology, 44(1), 118–123.', doi: '10.1037/h0059240' },
    { cite: 'Morrill, K., Hekman, J., Li, X., McClure, J., Logan, B., Goodman, L., … Karlsson, E. K. (2022). Ancestry-inclusive dog genomics challenges popular breed stereotypes. Science, 376(6592), eabk0639.', doi: '10.1126/science.abk0639' }
  ]
};
