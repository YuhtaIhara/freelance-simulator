"use client"

import { SimulatorResult, formatMan } from "@/lib/calculations"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface Props {
  result: SimulatorResult
  workingMonths: number
}

function Row({ label, amount, highlight, muted, indent }: {
  label: string
  amount: number
  highlight?: boolean
  muted?: boolean
  indent?: boolean
}) {
  return (
    <div className={`flex justify-between items-center py-1.5 ${indent ? "pl-4" : ""}`}>
      <span className={`text-sm ${muted ? "text-muted-foreground" : ""} ${highlight ? "font-semibold" : ""}`}>
        {label}
      </span>
      <span className={`tabular-nums text-sm ${highlight ? "text-lg font-bold" : ""} ${muted ? "text-muted-foreground" : ""}`}>
        {formatMan(amount)}
      </span>
    </div>
  )
}

function DeductionRow({ label, amount }: { label: string; amount: number }) {
  return (
    <div className="flex justify-between items-center py-1.5 pl-4">
      <span className="text-sm text-muted-foreground">− {label}</span>
      <span className="tabular-nums text-sm text-rose-500">▼ {formatMan(amount)}</span>
    </div>
  )
}

export function ResultCard({ result, workingMonths }: Props) {
  const {
    grossSales, consumptionTaxProfit, consumptionTaxReceived, consumptionTaxPaid,
    businessIncome,
    nenkin, nhi, taxableIncome, incomeTax, residentTax,
    annualShoukibo, annualIdeco, annualNisa,
    shoukiboEffect, idecoEffect,
    horizonYears, shoukiboFuture, idecoFuture3, idecoFuture5,
    nisaPrincipal, nisaCapYear, nisaFuture3, nisaFuture5,
    furusatoMax,
    netAnnual, netMonthly, effectiveTaxRate,
    estimatedAnnualPension, pensionYears,
  } = result

  const totalDeductions = nenkin + nhi + incomeTax + residentTax

  return (
    <div className="space-y-4">
      {/* ヒーロー */}
      <Card className="border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950">
        <CardContent className="pt-5 pb-4">
          <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-1">手取り年収（概算）</p>
          <p className="text-4xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
            {formatMan(netAnnual)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            月換算 {formatMan(netMonthly)} ／ 実効負担率 {(effectiveTaxRate * 100).toFixed(1)}%
          </p>
        </CardContent>
      </Card>

      {/* 内訳 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">収支内訳</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Row label={`年間売上（税抜・${workingMonths}ヶ月）`} amount={grossSales} highlight />

          {consumptionTaxProfit > 0 && (
            <>
              <div className="flex justify-between items-center py-1.5 pl-4">
                <span className="text-sm text-sky-600">+ 消費税実入り（受取 − 納付）</span>
                <span className="tabular-nums text-sm text-sky-600 font-medium">
                  +{formatMan(consumptionTaxProfit)}
                  <span className="text-xs text-muted-foreground ml-1">
                    （受取{formatMan(consumptionTaxReceived)} / 納付{formatMan(consumptionTaxPaid)}）
                  </span>
                </span>
              </div>
            </>
          )}

          <Separator className="my-2" />
          <Row label="事業所得（経費・青色控除後）" amount={businessIncome} />

          <Separator className="my-2" />
          <p className="text-xs text-muted-foreground mb-1">社会保険</p>
          <DeductionRow label="国民健康保険" amount={nhi} />
          <DeductionRow label="国民年金（月1.698万×12）" amount={nenkin} />

          <Separator className="my-2" />
          <p className="text-xs text-muted-foreground mb-1">税金</p>
          <Row label="課税所得" amount={taxableIncome} muted />
          <DeductionRow label="所得税（復興税込）" amount={incomeTax} />
          <DeductionRow label="住民税" amount={residentTax} />

          <Separator className="my-2" />
          <p className="text-xs font-medium">合計負担（保険+税）</p>
          <Row label="" amount={totalDeductions} highlight />

          {(annualShoukibo > 0 || annualIdeco > 0 || annualNisa > 0) && (
            <>
              <Separator className="my-2" />
              <p className="text-xs text-muted-foreground mb-1">積立（将来受取）</p>
              {annualShoukibo > 0 && <DeductionRow label="小規模企業共済" amount={annualShoukibo} />}
              {annualIdeco > 0 && <DeductionRow label="iDeCo" amount={annualIdeco} />}
              {annualNisa > 0 && <DeductionRow label="新NISA" amount={annualNisa} />}
            </>
          )}

          <Separator className="my-3" />
          <Row label="手取り年収" amount={netAnnual} highlight />
          <Row label={`手取り月換算（÷${workingMonths}ヶ月）`} amount={netMonthly} />
        </CardContent>
      </Card>

      {/* 節税効果 */}
      {(shoukiboEffect > 0 || idecoEffect > 0) && (
        <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-amber-700 dark:text-amber-300">節税効果</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-1">
            <p className="text-xs text-muted-foreground mb-2">
              小規模企業共済・iDeCoを活用した場合の節税額（税負担の軽減分）
            </p>
            {shoukiboEffect > 0 && (
              <div className="flex justify-between text-sm">
                <span>節税効果（合計）</span>
                <span className="font-bold text-amber-600 tabular-nums">▼ {formatMan(shoukiboEffect)}/年</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              ※掛金は将来受取の積立。手取りには含まれていません。
            </p>
          </CardContent>
        </Card>
      )}

      {/* 将来受取額シミュレーション */}
      <Card className="border-violet-300 bg-violet-50 dark:bg-violet-950">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-violet-700 dark:text-violet-300">
            将来受取額（年金・積立）
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          <div className="flex justify-between items-start text-sm">
            <div>
              <span>老齢基礎年金（国民年金）</span>
              <div className="text-xs text-muted-foreground mt-0.5">{pensionYears}年加入ベースの概算・月額 {formatMan(Math.round(estimatedAnnualPension / 12))}</div>
            </div>
            <span className="tabular-nums font-semibold text-violet-700 dark:text-violet-300">{formatMan(estimatedAnnualPension)}<span className="text-xs font-normal text-muted-foreground">/年</span></span>
          </div>
          {(shoukiboFuture > 0 || idecoFuture3 > 0 || nisaFuture3 > 0) && (
            <>
              <Separator />
              {shoukiboFuture > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span>小規模企業共済</span>
                <span className="tabular-nums font-semibold text-violet-700 dark:text-violet-300">
                  {formatMan(shoukiboFuture)}
                  <span className="text-xs text-muted-foreground ml-1">（積立金相当額）</span>
                </span>
              </div>
            )}
            {idecoFuture3 > 0 && (
              <div className="flex justify-between items-start text-sm">
                <span>iDeCo</span>
                <div className="text-right tabular-nums">
                  <div className="font-semibold text-violet-700 dark:text-violet-300">
                    {formatMan(idecoFuture3)}<span className="text-xs text-muted-foreground ml-1">（年利3%）</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatMan(idecoFuture5)}<span className="ml-1">（年利5%）</span>
                  </div>
                </div>
              </div>
            )}
            {nisaFuture3 > 0 && (
              <div className="flex justify-between items-start text-sm">
                <div>
                  <div>新NISA</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    元本 {formatMan(nisaPrincipal)}
                    {nisaCapYear !== null && (
                      <span className="ml-1 text-amber-600">（{nisaCapYear}年目に1,800万到達）</span>
                    )}
                  </div>
                </div>
                <div className="text-right tabular-nums">
                  <div className="font-semibold text-violet-700 dark:text-violet-300">
                    {formatMan(nisaFuture3)}<span className="text-xs text-muted-foreground ml-1">（年利3%）</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatMan(nisaFuture5)}<span className="ml-1">（年利5%）</span>
                  </div>
                </div>
              </div>
            )}
              <p className="text-xs text-muted-foreground pt-1 border-t">
                ※小規模は積立元本のみ。iDeCo・新NISAは想定利回り。実際の運用益は変動します。
              </p>
            </>
          )}
          <p className="text-xs text-muted-foreground pt-2 border-t">年金は令和7年度額・運用年数を加入年数として概算。実際の受取額は加入履歴・物価スライドにより変動します。</p>
        </CardContent>
      </Card>

      {/* ふるさと納税 目安 */}
      {furusatoMax > 2_000 && (
        <Card className="border-slate-200 bg-slate-50 dark:bg-slate-900">
          <CardContent className="pt-4 pb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">参考: ふるさと納税</p>
            <div className="flex justify-between items-baseline">
              <span className="text-sm">目安上限額</span>
              <span className="tabular-nums font-bold text-base">{formatMan(furusatoMax)}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              返礼品換算で約 {formatMan(Math.floor(furusatoMax * 0.3 / 10_000) * 10_000)} 相当（30%目安）。
              2,000円の自己負担を除く全額が控除対象。
            </p>
          </CardContent>
        </Card>
      )}

      {/* 免責 */}
      <p className="text-xs text-muted-foreground text-center leading-relaxed">
        令和7年度（2025年度）の税率・国保料率に基づく概算です。<br />
        実際の保険料は市区町村により異なります。税務の判断は税理士にご相談ください。
      </p>
    </div>
  )
}
