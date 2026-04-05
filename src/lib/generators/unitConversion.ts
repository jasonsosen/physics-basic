/**
 * 単位換算 無限習題生成器
 * Week02: 長さ、面積、体積、複合単位
 */

// 題目類型
type QuizType = 'length' | 'area' | 'volume' | 'compound' | 'density';

interface GeneratedQuiz {
  id: string;
  type: QuizType;
  question: string;
  answer: string;
  answerUnit: string;
  answerValue: number;
  steps: string[];
  hint?: string;
}

// 接頭語定義
const prefixes = {
  k: { name: 'キロ', factor: 1e3, exp: 3 },
  h: { name: 'ヘクト', factor: 1e2, exp: 2 },
  da: { name: 'デカ', factor: 1e1, exp: 1 },
  '': { name: '', factor: 1, exp: 0 },
  c: { name: 'センチ', factor: 1e-2, exp: -2 },
  m: { name: 'ミリ', factor: 1e-3, exp: -3 },
  μ: { name: 'マイクロ', factor: 1e-6, exp: -6 },
  n: { name: 'ナノ', factor: 1e-9, exp: -9 },
};

// ランダム整数生成
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ランダム選択
function randChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 科学記数法フォーマット
function formatScientific(num: number): string {
  if (num === 0) return '0';
  if (Math.abs(num) >= 0.01 && Math.abs(num) < 10000) {
    // 小さい数はそのまま
    return num.toString();
  }
  const exp = Math.floor(Math.log10(Math.abs(num)));
  const mantissa = num / Math.pow(10, exp);
  if (Math.abs(mantissa - Math.round(mantissa)) < 0.0001) {
    return `${Math.round(mantissa)} × 10^${exp}`;
  }
  return `${mantissa.toFixed(1)} × 10^${exp}`;
}

// 指数表記（上付き）
function formatExp(exp: number): string {
  const superscripts = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  const minus = '⁻';
  if (exp === 0) return '⁰';
  let result = '';
  if (exp < 0) {
    result = minus;
    exp = Math.abs(exp);
  }
  for (const d of exp.toString()) {
    result += superscripts[parseInt(d)];
  }
  return result;
}

// ========== 長さ換算 ==========
export function generateLengthQuiz(): GeneratedQuiz {
  const fromUnits = ['km', 'm', 'cm', 'mm', 'μm', 'nm'];
  const toUnits = ['m']; // SI単位へ換算
  
  const fromUnit = randChoice(fromUnits.filter(u => u !== 'm'));
  const toUnit = 'm';
  
  // 値を生成（整数か簡単な小数）
  const values = [1, 2, 2.5, 3, 3.5, 4, 5, 10, 15, 20, 25, 30, 45, 50, 100, 200, 250, 500];
  const value = randChoice(values);
  
  // 換算係数を計算
  const fromFactor = getUnitFactor(fromUnit);
  const toFactor = getUnitFactor(toUnit);
  const answerValue = value * fromFactor / toFactor;
  
  const answer = formatScientific(answerValue);
  
  const steps = [
    `${getPrefix(fromUnit)}（${getPrefixSymbol(fromUnit)}）= 10${formatExp(getExp(fromUnit))}`,
    `${value} ${fromUnit} = ${value} × 10${formatExp(getExp(fromUnit))} ${toUnit}`,
    `= <strong>${answer} ${toUnit}</strong>`
  ];
  
  return {
    id: `len-${Date.now()}`,
    type: 'length',
    question: `${value} ${fromUnit}`,
    answer,
    answerUnit: toUnit,
    answerValue,
    steps,
    hint: `${getPrefix(fromUnit)} = 10${formatExp(getExp(fromUnit))}`
  };
}

// ========== 面積換算 ==========
export function generateAreaQuiz(): GeneratedQuiz {
  const fromUnits = ['km²', 'm²', 'cm²', 'mm²'];
  const toUnit = 'm²';
  
  const fromUnit = randChoice(fromUnits.filter(u => u !== 'm²'));
  const values = [1, 2, 3, 4, 5, 10, 20, 50, 100, 200, 300, 500];
  const value = randChoice(values);
  
  const baseExp = getExp(fromUnit.replace('²', ''));
  const areaExp = baseExp * 2; // 面積は指数2倍
  const answerValue = value * Math.pow(10, areaExp);
  const answer = formatScientific(answerValue);
  
  const steps = [
    `長さ：1 ${fromUnit.replace('²', '')} = 10${formatExp(baseExp)} m`,
    `面積：1 ${fromUnit} = (10${formatExp(baseExp)})² = 10${formatExp(areaExp)} m²`,
    `${value} ${fromUnit} = ${value} × 10${formatExp(areaExp)} m²`,
    `= <strong>${answer} m²</strong>`
  ];
  
  return {
    id: `area-${Date.now()}`,
    type: 'area',
    question: `${value} ${fromUnit}`,
    answer,
    answerUnit: 'm²',
    answerValue,
    steps,
    hint: `面積は指数を <strong>2倍</strong> にする！`
  };
}

// ========== 体積換算 ==========
export function generateVolumeQuiz(): GeneratedQuiz {
  const fromUnits = ['cm³', 'mm³', 'L', 'mL'];
  const toUnit = 'm³';
  
  const fromUnit = randChoice(fromUnits);
  const values = [1, 2, 2.5, 4, 5, 10, 50, 100, 500, 1000, 2000, 4000];
  const value = randChoice(values);
  
  let answerValue: number;
  let steps: string[];
  
  if (fromUnit === 'L') {
    answerValue = value * 1e-3;
    steps = [
      `1 L = 1 dm³（立方デシメートル）`,
      `1 dm = 10⁻¹ m`,
      `1 L = 1 dm³ = (10⁻¹)³ = 10⁻³ m³`,
      `${value} L = ${value} × 10⁻³ m³`,
      `= <strong>${formatScientific(answerValue)} m³</strong>`
    ];
  } else if (fromUnit === 'mL') {
    answerValue = value * 1e-6;
    steps = [
      `1 mL = 10⁻³ L = 10⁻³ × 10⁻³ m³ = 10⁻⁶ m³`,
      `${value} mL = ${value} × 10⁻⁶ m³`,
      `= <strong>${formatScientific(answerValue)} m³</strong>`
    ];
  } else {
    const baseExp = getExp(fromUnit.replace('³', ''));
    const volExp = baseExp * 3;
    answerValue = value * Math.pow(10, volExp);
    steps = [
      `長さ：1 ${fromUnit.replace('³', '')} = 10${formatExp(baseExp)} m`,
      `体積：1 ${fromUnit} = (10${formatExp(baseExp)})³ = 10${formatExp(volExp)} m³`,
      `${value} ${fromUnit} = ${value} × 10${formatExp(volExp)} m³`,
      `= <strong>${formatScientific(answerValue)} m³</strong>`
    ];
  }
  
  return {
    id: `vol-${Date.now()}`,
    type: 'volume',
    question: `${value} ${fromUnit}`,
    answer: formatScientific(answerValue),
    answerUnit: 'm³',
    answerValue,
    steps,
    hint: `体積は指数を <strong>3倍</strong> にする！`
  };
}

// ========== 複合単位（速度） ==========
export function generateCompoundQuiz(): GeneratedQuiz {
  const speedValues = [18, 36, 54, 72, 90, 108, 120, 144, 180, 216, 252, 288, 324, 360];
  const value = randChoice(speedValues);
  const answerValue = value / 3.6;
  
  const steps = [
    `分数で書く：${value} km / 1 h`,
    `分子：${value} km = ${value} × 1000 m = ${value * 1000} m`,
    `分母：1 h = 3600 s`,
    `${value * 1000} m ÷ 3600 s = <strong>${answerValue} m/s</strong>`,
    `💡 速攻法：km/h → m/s は ÷ 3.6`
  ];
  
  return {
    id: `comp-${Date.now()}`,
    type: 'compound',
    question: `${value} km/h`,
    answer: answerValue.toString(),
    answerUnit: 'm/s',
    answerValue,
    steps,
    hint: `km/h → m/s は ÷ 3.6`
  };
}

// ========== 密度換算 ==========
export function generateDensityQuiz(): GeneratedQuiz {
  const densityValues = [0.5, 0.8, 1.0, 1.2, 1.5, 2.0, 2.5, 2.7, 3.0, 5.0, 7.8, 8.9, 10.5, 11.3, 13.6, 19.3];
  const value = randChoice(densityValues);
  const answerValue = value * 1000;
  
  const steps = [
    `分子：${value} g = ${value} × 10⁻³ kg`,
    `分母：1 cm³ = 10⁻⁶ m³`,
    `(${value} × 10⁻³) ÷ (10⁻⁶)`,
    `= ${value} × 10⁻³⁺⁶ = ${value} × 10³`,
    `= <strong>${answerValue} kg/m³</strong>`,
    `💡 g/cm³ → kg/m³ は × 1000`
  ];
  
  return {
    id: `dens-${Date.now()}`,
    type: 'density',
    question: `${value} g/cm³`,
    answer: answerValue.toString(),
    answerUnit: 'kg/m³',
    answerValue,
    steps,
    hint: `g/cm³ → kg/m³ は × 1000`
  };
}

// ========== ランダム生成 ==========
export function generateRandomQuiz(): GeneratedQuiz {
  const generators = [
    generateLengthQuiz,
    generateLengthQuiz,  // 長さを多めに
    generateAreaQuiz,
    generateVolumeQuiz,
    generateCompoundQuiz,
    generateDensityQuiz,
  ];
  return randChoice(generators)();
}

// ========== ヘルパー関数 ==========
function getUnitFactor(unit: string): number {
  const factors: Record<string, number> = {
    'km': 1e3, 'm': 1, 'cm': 1e-2, 'mm': 1e-3, 'μm': 1e-6, 'nm': 1e-9,
  };
  return factors[unit] ?? 1;
}

function getExp(unit: string): number {
  const exps: Record<string, number> = {
    'km': 3, 'm': 0, 'cm': -2, 'mm': -3, 'μm': -6, 'nm': -9,
  };
  return exps[unit] ?? 0;
}

function getPrefix(unit: string): string {
  const names: Record<string, string> = {
    'km': 'キロ', 'm': '', 'cm': 'センチ', 'mm': 'ミリ', 'μm': 'マイクロ', 'nm': 'ナノ',
  };
  return names[unit] ?? '';
}

function getPrefixSymbol(unit: string): string {
  const symbols: Record<string, string> = {
    'km': 'k', 'm': '', 'cm': 'c', 'mm': 'm', 'μm': 'μ', 'nm': 'n',
  };
  return symbols[unit] ?? '';
}

export type { GeneratedQuiz, QuizType };
