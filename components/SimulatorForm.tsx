"use client"

import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { Info } from "lucide-react"
import { SimulatorInput, TaxType, ConsumptionTaxMode, AoiroType } from "@/lib/calculations"
import { PREFECTURE_LIST } from "@/lib/nhi-rates"

interface Props {
  input: SimulatorInput
  onChange: (input: SimulatorInput) => void
}

function InfoTip({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="inline w-3.5 h-3.5 ml-1 text-muted-foreground cursor-help" />
      </TooltipTrigger>
      <TooltipContent className="max-w-60 text-xs">{text}</TooltipContent>
    </Tooltip>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{children}</p>
  )
}

export function SimulatorForm({ input, onChange }: Props) {
  const set = <K extends keyof SimulatorInput>(key: K, value: SimulatorInput[K]) =>
    onChange({ ...input, [key]: value })

  return (
    <div className="space-y-6">
      {/* ── 基本 ── */}
      <section>
        <SectionLabel>基本情報</SectionLabel>
        <div className="space-y-5">

          {/* 月単価 */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>月単価</Label>
              <span className="text-lg font-bold tabular-nums">{(input.monthlyRate / 10_000).toFixed(0)} 万円</span>
            </div>
            <Slider
              min={300_000} max={2_000_000} step={10_000}
              value={[input.monthlyRate]}
              onValueChange={([v]) => set("monthlyRate", v)}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>30万</span><span>200万</span>
            </div>
          </div>

          {/* 稼働月数 */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>稼働月数</Label>
              <span className="text-lg font-bold tabular-nums">{input.workingMonths} ヶ月</span>
            </div>
            <Slider
              min={1} max={12} step={1}
              value={[input.workingMonths]}
              onValueChange={([v]) => set("workingMonths", v)}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>1ヶ月</span><span>12ヶ月</span>
            </div>
          </div>

          {/* 都道府県 */}
          <div>
            <Label className="mb-2 block">
              都道府県
              <InfoTip text="国民健康保険料の計算に使用します。都道府県ごとに料率が異なります。" />
            </Label>
            <Select value={input.prefecture} onValueChange={v => set("prefecture", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-60">
                {PREFECTURE_LIST.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* 40歳以上 */}
          <div className="flex items-center justify-between">
            <Label>
              40歳以上
              <InfoTip text="40〜64歳は国保に介護分が加算されます。" />
            </Label>
            <Switch
              checked={input.age40plus}
              onCheckedChange={v => set("age40plus", v)}
            />
          </div>

          {/* 扶養家族 */}
          <div>
            <Label className="mb-2 block">
              扶養家族人数
              <InfoTip text="国保の均等割が加入者数分加算されます。" />
            </Label>
            <Select
              value={String(input.dependents)}
              onValueChange={v => set("dependents", Number(v))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {[0, 1, 2, 3, 4].map(n => (
                  <SelectItem key={n} value={String(n)}>{n}人</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 配偶者控除 */}
          <div className="flex items-center justify-between">
            <Label>
              配偶者控除
              <InfoTip text="配偶者の年収が103万円以下の場合、課税所得から38万円が控除されます（本人の合計所得900万以下が条件）。" />
            </Label>
            <Switch
              checked={input.spouseDeduction}
              onCheckedChange={v => set("spouseDeduction", v)}
            />
          </div>
        </div>
      </section>

      <Separator />

      {/* ── インボイス・消費税 ── */}
      <section>
        <SectionLabel>インボイス・消費税</SectionLabel>
        <div className="space-y-4">

          {/* 単価の消費税 */}
          <div>
            <Label className="mb-2 block">
              単価の消費税
              <InfoTip text="外税：単価に+10%の消費税が別途加算される。内税：消費税込みの単価（実質売上は÷1.1）。" />
            </Label>
            <Select
              value={input.ctMode}
              onValueChange={v => set("ctMode", v as ConsumptionTaxMode)}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="exclusive">外税（別途 +10%）</SelectItem>
                <SelectItem value="inclusive">内税（消費税込み）</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 課税区分 */}
          {input.ctMode === "exclusive" && (
            <div>
              <Label className="mb-2 block">
                課税区分
                <InfoTip text="免税：消費税を納付しないが取引先が控除できない。簡易課税（第5種）：受取消費税の50%を納付。2割特例：受取消費税の20%のみ納付（2027/9末まで）。" />
              </Label>
              <Select
                value={input.taxType}
                onValueChange={v => set("taxType", v as TaxType)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="exempt">免税事業者</SelectItem>
                  <SelectItem value="simplified">簡易課税（第5種・IT系）</SelectItem>
                  <SelectItem value="special20">2割特例（〜2027年9月）</SelectItem>
                  <SelectItem value="standard">本則課税</SelectItem>
                </SelectContent>
              </Select>
              {input.taxType === "exempt" && (
                <p className="text-xs text-amber-600 mt-1.5">
                  ⚠ 免税事業者はインボイスを発行できず、取引先が仕入税額控除を受けられません。契約交渉で単価引下げ要求が生じる可能性があります。
                </p>
              )}
              {input.taxType === "special20" && (
                <p className="text-xs text-blue-600 mt-1.5">
                  ℹ 2割特例は2023〜2027年9月末までの経過措置です。適用後は簡易課税または本則課税に移行します。
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      <Separator />

      {/* ── 控除・節税 ── */}
      <section>
        <SectionLabel>控除・節税</SectionLabel>
        <div className="space-y-5">

          {/* 年間経費 */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>
                年間経費
                <InfoTip text="業務に必要な経費（交通費・通信費・家賃按分・機材費・書籍代など）。全額事業所得から控除できます。" />
              </Label>
              <span className="font-bold tabular-nums">{(input.expenses / 10_000).toFixed(0)} 万円</span>
            </div>
            <Slider
              min={0} max={2_000_000} step={10_000}
              value={[input.expenses]}
              onValueChange={([v]) => set("expenses", v)}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0万</span><span>200万</span>
            </div>
          </div>

          {/* 青色申告控除 */}
          <div>
            <Label className="mb-2 block">
              青色申告特別控除
              <InfoTip text="複式簿記で65万円、簡易簿記で10万円、白色申告は0円。65万円控除を受けるにはe-Tax提出が必要です。" />
            </Label>
            <Select
              value={String(input.aoiro)}
              onValueChange={v => set("aoiro", Number(v) as AoiroType)}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="650000">65万円（青色・複式簿記）</SelectItem>
                <SelectItem value="100000">10万円（青色・簡易帳簿）</SelectItem>
                <SelectItem value="0">なし（白色申告）</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 小規模企業共済 */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>
                小規模企業共済
                <InfoTip text="中小機構が運営する退職金制度。掛金は全額所得控除。月最大7万円（年84万円）まで。将来受取時は退職所得または一時所得として課税。" />
              </Label>
              <span className="font-bold tabular-nums">{(input.shoukibo / 10_000).toFixed(0)} 万円/年</span>
            </div>
            <Slider
              min={0} max={840_000} step={10_000}
              value={[input.shoukibo]}
              onValueChange={([v]) => set("shoukibo", v)}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0万</span><span>84万（月7万）</span>
            </div>
          </div>

          {/* iDeCo */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>
                iDeCo（個人型確定拠出年金）
                <InfoTip text="自営業者の上限は月6.8万円（年81.6万円）。掛金は全額所得控除。60歳まで引き出し不可。" />
              </Label>
              <span className="font-bold tabular-nums">{(input.ideco / 10_000).toFixed(0)} 万円/年</span>
            </div>
            <Slider
              min={0} max={816_000} step={10_000}
              value={[input.ideco]}
              onValueChange={([v]) => set("ideco", v)}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0万</span><span>81.6万（月6.8万）</span>
            </div>
          </div>

          {/* 新NISA（積立投資枠） */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>
                新NISA（積立投資枠）
                <InfoTip text="月10万円・年120万円まで非課税で投資可能（積立投資枠）。生涯投資枠は1,800万円（元本ベース）。iDeCoと異なり所得控除の対象外のため現年度の手取りへの影響はなし。運用益・分配金はすべて非課税。" />
              </Label>
              <span className="font-bold tabular-nums">{(input.nisa / 10_000).toFixed(0)} 万円/年</span>
            </div>
            <Slider
              min={0} max={1_200_000} step={10_000}
              value={[input.nisa]}
              onValueChange={([v]) => set("nisa", v)}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0万</span><span>120万（積立投資枠上限）</span>
            </div>
          </div>

          {/* 積立年数（小規模 or iDeCo or NISA が有効な場合のみ表示） */}
          {(input.shoukibo > 0 || input.ideco > 0 || input.nisa > 0) && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>
                  積立年数（将来受取シミュレーション）
                  <InfoTip text="現在の掛金を何年間継続するかの想定。将来受取額の目安を計算します。" />
                </Label>
                <span className="font-bold tabular-nums">{input.horizonYears} 年</span>
              </div>
              <Slider
                min={5} max={40} step={1}
                value={[input.horizonYears]}
                onValueChange={([v]) => set("horizonYears", v)}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>5年</span><span>40年</span>
              </div>
            </div>
          )}

        </div>
      </section>
    </div>
  )
}
