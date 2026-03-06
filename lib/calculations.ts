/**
 * フリーランス手取りシミュレーター - 計算ロジック
 * 令和7年度（2025年度）の税率・保険料率に基づく
 */

import { getNhiRates } from "./nhi-rates"

// ───────────────────────────────────────────────
// 定数
// ───────────────────────────────────────────────

/** 国民年金 月額（令和7年度） */
const NENKIN_MONTHLY = 16_980
/** 基礎控除額 */
const KISO_KOJO = 480_000
/** 国民健康保険 所得控除（いわゆる33万控除） */
const NHI_SHOTOKU_KOJO = 430_000
/** 住民税 均等割 */
const JUMINZEI_KINTO = 5_000

// ───────────────────────────────────────────────
// 型定義
// ───────────────────────────────────────────────

export type TaxType = "exempt" | "simplified" | "special20" | "standard"
export type ConsumptionTaxMode = "exclusive" | "inclusive"
export type AoiroType = 650_000 | 100_000 | 0

export interface SimulatorInput {
  // 基本
  monthlyRate: number        // 月単価（円）
  workingMonths: number      // 稼働月数
  prefecture: string         // 都道府県
  age40plus: boolean         // 40歳以上（介護保険）
  dependents: number         // 扶養家族人数（0〜4）
  // インボイス・消費税
  ctMode: ConsumptionTaxMode // "exclusive"=外税 / "inclusive"=内税
  taxType: TaxType           // 課税区分
  // 控除・節税
  expenses: number           // 年間経費（円）
  aoiro: AoiroType           // 青色申告特別控除（650000 / 100000 / 0）
  shoukibo: number           // 小規模企業共済 掛金/年（円）
  ideco: number              // iDeCo 掛金/年（円）
  nisa: number               // 新NISA 積立投資枠 積立額/年（円）
  horizonYears: number       // 積立年数（将来受取額の計算用）
  spouseDeduction: boolean   // 配偶者控除（配偶者の年収103万以下）
}

export interface SimulatorResult {
  // 売上・消費税
  grossSales: number           // 年間売上（税抜）
  consumptionTaxReceived: number // 受取消費税
  consumptionTaxPaid: number   // 納付消費税
  consumptionTaxProfit: number // 消費税実入り（受取 - 納付）
  // 事業所得
  businessIncome: number       // 事業所得（売上 - 経費 - 青色控除）
  // 社会保険
  nenkin: number               // 国民年金（年額）
  nhi: number                  // 国民健康保険（年額）
  // 所得税・住民税
  taxableIncome: number        // 課税所得
  incomeTax: number            // 所得税（復興税込み）
  residentTax: number          // 住民税
  // 節税
  shoukiboEffect: number       // 小規模企業共済 節税効果額
  idecoEffect: number          // iDeCo 節税効果額
  // 将来受取額
  horizonYears: number         // 積立年数（表示用）
  shoukiboFuture: number       // 小規模企業共済 積立元本合計
  idecoFuture3: number         // iDeCo 将来額（年利3%）
  idecoFuture5: number         // iDeCo 将来額（年利5%）
  nisaPrincipal: number        // 新NISA 実際の元本合計（上限1,800万）
  nisaCapYear: number | null   // 何年目に生涯枠1,800万に達するか（超えない場合はnull）
  nisaFuture3: number          // 新NISA 将来額（年利3%）
  nisaFuture5: number          // 新NISA 将来額（年利5%）
  furusatoMax: number          // ふるさと納税 目安上限額
  // 積立額（入力値のパススルー・内訳表示用）
  annualShoukibo: number
  annualIdeco: number
  annualNisa: number
  // 手取り
  netAnnual: number            // 手取り年収（流動性ベース）
  netMonthly: number           // 手取り月換算
  effectiveTaxRate: number     // 実効負担率（税+保険/売上）
  // 内訳表示用
  breakdown: BreakdownItem[]
  // 年金
  estimatedAnnualPension: number // 老齢基礎年金（概算）
  pensionYears: number           // 計算に使った年数
}

export interface BreakdownItem {
  label: string
  amount: number
  color: string
  isDeduction?: boolean
}

// ───────────────────────────────────────────────
// 消費税計算
// ───────────────────────────────────────────────

function calcConsumptionTax(
  salesExclTax: number,
  ctMode: ConsumptionTaxMode,
  taxType: TaxType
): { received: number; paid: number; profit: number } {
  if (ctMode === "inclusive") {
    return { received: 0, paid: 0, profit: 0 }
  }
  const received = salesExclTax * 0.1
  let paid = 0
  switch (taxType) {
    case "exempt":     paid = 0;            break  // 免税：受け取っても納付義務なし（ただしインボイス発行不可）
    case "simplified": paid = received * 0.5; break // 簡易課税（第5種）：みなし仕入率50%
    case "special20":  paid = received * 0.2; break // 2割特例（〜2027/9末）
    case "standard":   paid = received * 0.5; break // 本則課税：経費仕入税額次第（簡易と同程度で近似）
  }
  return { received, paid, profit: received - paid }
}

// ───────────────────────────────────────────────
// 国民健康保険計算
// ───────────────────────────────────────────────

function calcNhi(
  businessIncome: number,
  prefecture: string,
  age40plus: boolean,
  dependents: number
): number {
  const rates = getNhiRates(prefecture)
  const nhiBase = Math.max(0, businessIncome - NHI_SHOTOKU_KOJO)

  const iryo = nhiBase * rates.iryo.shotokuRitsu + rates.iryo.kintoWari * (1 + dependents)
  const kaigo = age40plus
    ? nhiBase * rates.kaigo.shotokuRitsu + rates.kaigo.kintoWari * (1 + dependents)
    : 0

  const total = iryo + kaigo
  const jogen = rates.iryo.jogen + (age40plus ? rates.kaigo.jogen : 0)
  return Math.min(total, jogen)
}

// ───────────────────────────────────────────────
// 所得税（累進課税）
// ───────────────────────────────────────────────

interface TaxBracket {
  limit: number
  rate: number
  deduction: number
}

const TAX_BRACKETS: TaxBracket[] = [
  { limit: 1_950_000,   rate: 0.05, deduction: 0 },
  { limit: 3_300_000,   rate: 0.10, deduction: 97_500 },
  { limit: 6_950_000,   rate: 0.20, deduction: 427_500 },
  { limit: 9_000_000,   rate: 0.23, deduction: 636_000 },
  { limit: 18_000_000,  rate: 0.33, deduction: 1_536_000 },
  { limit: 40_000_000,  rate: 0.40, deduction: 2_796_000 },
  { limit: Infinity,    rate: 0.45, deduction: 4_796_000 },
]

function calcIncomeTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0
  const bracket = TAX_BRACKETS.find(b => taxableIncome <= b.limit)!
  const base = taxableIncome * bracket.rate - bracket.deduction
  return Math.max(0, Math.floor(base * 1.021)) // 復興特別所得税 2.1%
}

// ───────────────────────────────────────────────
// 住民税
// ───────────────────────────────────────────────

function calcResidentTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return JUMINZEI_KINTO
  return Math.floor(taxableIncome * 0.10) + JUMINZEI_KINTO
}

// ───────────────────────────────────────────────
// メイン計算関数
// ───────────────────────────────────────────────

/** 年末払い複利の将来価値 FV = PMT × ((1+r)^n - 1) / r */
function futureValue(annualPmt: number, rate: number, years: number): number {
  if (annualPmt <= 0 || years <= 0) return 0
  if (rate === 0) return annualPmt * years
  return Math.round(annualPmt * ((Math.pow(1 + rate, years) - 1) / rate))
}

/**
 * 生涯上限付きの将来価値（新NISA用）
 * 上限に達した年以降は新規入金なし・それまでの残高のみ複利で成長
 */
function futureValueWithCap(annualPmt: number, rate: number, years: number, lifetimeCap: number): number {
  if (annualPmt <= 0 || years <= 0) return 0
  // 上限に達するまでの年数
  const contribYears = Math.min(years, Math.floor(lifetimeCap / annualPmt))
  const growthYears = years - contribYears
  // 積立期間終了時の残高
  const fvAtContribEnd = rate === 0
    ? annualPmt * contribYears
    : annualPmt * ((Math.pow(1 + rate, contribYears) - 1) / rate)
  // 残り期間は入金なしで複利運用
  return Math.round(fvAtContribEnd * Math.pow(1 + rate, growthYears))
}

function getIncomeTaxRate(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0
  return TAX_BRACKETS.find(b => taxableIncome <= b.limit)!.rate
}

export function calculate(input: SimulatorInput): SimulatorResult {
  const {
    monthlyRate, workingMonths, prefecture, age40plus, dependents,
    ctMode, taxType, expenses, aoiro, shoukibo, ideco, nisa, horizonYears, spouseDeduction
  } = input

  // ① 年間売上
  const baseAnnual = monthlyRate * workingMonths
  const grossSales = ctMode === "inclusive"
    ? Math.floor(baseAnnual / 1.1)  // 内税→税抜
    : baseAnnual

  // ② 消費税
  const ct = calcConsumptionTax(grossSales, ctMode, taxType)

  // ③ 事業所得
  const businessIncome = Math.max(0, grossSales - expenses - aoiro)

  // ④ 国民年金
  const nenkin = NENKIN_MONTHLY * 12  // 203,760円

  // ⑤ 国民健康保険
  const nhi = calcNhi(businessIncome, prefecture, age40plus, dependents)

  // ⑥ 課税所得
  const socialInsuranceDeduction = nenkin + nhi
  const spouseKojo = spouseDeduction ? 380_000 : 0
  const taxableIncome = Math.max(
    0,
    businessIncome - KISO_KOJO - socialInsuranceDeduction - shoukibo - ideco - spouseKojo
  )

  // ⑦ 所得税・住民税
  const incomeTax = calcIncomeTax(taxableIncome)
  const residentTax = calcResidentTax(taxableIncome)

  // ⑧ 節税効果（小規模・iDeCo を使わなかった場合との差分）
  const taxableIncomeWithout = Math.max(
    0,
    businessIncome - KISO_KOJO - socialInsuranceDeduction - spouseKojo
  )
  const incomeTaxWithout = calcIncomeTax(taxableIncomeWithout)
  const residentTaxWithout = calcResidentTax(taxableIncomeWithout)
  const shoukiboEffect = (incomeTaxWithout + residentTaxWithout) - (incomeTax + residentTax)
  const idecoEffect = shoukibo > 0 || ideco > 0
    ? Math.floor((incomeTaxWithout + residentTaxWithout) - (incomeTax + residentTax))
    : 0

  // ⑨ 手取り（キャッシュフローベース）
  // 小規模・iDeCo・新NISAは積立なので現金支出だが将来受取 → 手取りから引く
  const netAnnual = grossSales + ct.profit
    - nenkin - nhi - incomeTax - residentTax
    - expenses - shoukibo - ideco - nisa

  const netMonthly = workingMonths > 0 ? Math.floor(netAnnual / workingMonths) : 0

  // 実効負担率（税+保険の合計 / 税抜売上）
  const totalBurden = nenkin + nhi + incomeTax + residentTax + ct.paid
  const effectiveTaxRate = grossSales > 0 ? totalBurden / grossSales : 0

  // 内訳
  const breakdown: BreakdownItem[] = [
    { label: "年間売上（税抜）", amount: grossSales, color: "#3b82f6" },
    ...(ct.profit > 0 ? [{ label: `消費税実入り（${taxType === "exempt" ? "免税" : taxType === "simplified" ? "簡易課税" : taxType === "special20" ? "2割特例" : "本則課税"}）`, amount: ct.profit, color: "#0ea5e9" }] : []),
    { label: "経費", amount: expenses, color: "#f59e0b", isDeduction: true },
    { label: `青色申告控除（${aoiro/10000}万）`, amount: aoiro, color: "#f97316", isDeduction: true },
    { label: "国民健康保険", amount: nhi, color: "#ef4444", isDeduction: true },
    { label: "国民年金", amount: nenkin, color: "#ec4899", isDeduction: true },
    { label: "所得税（復興税込）", amount: incomeTax, color: "#8b5cf6", isDeduction: true },
    { label: "住民税", amount: residentTax, color: "#a855f7", isDeduction: true },
    ...(shoukibo > 0 ? [{ label: "小規模企業共済（積立）", amount: shoukibo, color: "#64748b", isDeduction: true }] : []),
    ...(ideco > 0 ? [{ label: "iDeCo（積立）", amount: ideco, color: "#94a3b8", isDeduction: true }] : []),
    ...(nisa > 0 ? [{ label: "新NISA（積立）", amount: nisa, color: "#6366f1", isDeduction: true }] : []),
    { label: "手取り", amount: netAnnual, color: "#22c55e" },
  ]

  // ⑩ 将来受取額
  const shoukiboFuture = shoukibo * horizonYears   // 元本積み上げ（付加共済金含まず）
  const idecoFuture3 = futureValue(ideco, 0.03, horizonYears)
  const idecoFuture5 = futureValue(ideco, 0.05, horizonYears)
  const nisaFuture3 = futureValueWithCap(nisa, 0.03, horizonYears, 18_000_000)
  const nisaFuture5 = futureValueWithCap(nisa, 0.05, horizonYears, 18_000_000)
  const nisaPrincipal = nisa > 0 ? Math.min(nisa * horizonYears, 18_000_000) : 0
  const nisaRawCapYear = nisa > 0 ? Math.ceil(18_000_000 / nisa) : Infinity
  const nisaCapYear: number | null = nisaRawCapYear <= horizonYears ? nisaRawCapYear : null

  // ⑪ ふるさと納税 目安上限
  // = floor(住民税所得割 × 20% / (0.9 - 所得税率 × 1.021 - 0.1)) + 2,000
  const residentTaxShotoku = Math.max(0, taxableIncome) * 0.10
  const itRate = getIncomeTaxRate(taxableIncome)
  const furusatoDenominator = 0.9 - itRate * 1.021 - 0.1
  const furusatoMax = furusatoDenominator > 0
    ? Math.floor(residentTaxShotoku * 0.2 / furusatoDenominator) + 2_000
    : 0

  // 年金見込み（horizonYearsを国民年金加入年数として概算）
  const pensionYears = Math.min(horizonYears, 40)
  const estimatedAnnualPension = Math.floor(816_000 * pensionYears / 40)

  return {
    grossSales,
    consumptionTaxReceived: ct.received,
    consumptionTaxPaid: ct.paid,
    consumptionTaxProfit: ct.profit,
    businessIncome,
    nenkin,
    nhi,
    taxableIncome,
    incomeTax,
    residentTax,
    shoukiboEffect,
    idecoEffect,
    horizonYears,
    shoukiboFuture,
    idecoFuture3,
    idecoFuture5,
    nisaPrincipal,
    nisaCapYear,
    nisaFuture3,
    nisaFuture5,
    furusatoMax,
    annualShoukibo: shoukibo,
    annualIdeco: ideco,
    annualNisa: nisa,
    netAnnual,
    netMonthly,
    effectiveTaxRate,
    breakdown,
    estimatedAnnualPension,
    pensionYears,
  }
}

// ───────────────────────────────────────────────
// ユーティリティ
// ───────────────────────────────────────────────

export function formatCurrency(n: number): string {
  return Math.round(n).toLocaleString("ja-JP") + "円"
}

export function formatMan(n: number): string {
  const man = Math.round(n / 10_000)
  return man.toLocaleString("ja-JP") + "万円"
}
