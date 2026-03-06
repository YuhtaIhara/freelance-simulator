"use client"

import { useState, useMemo } from "react"
import { SimulatorForm } from "@/components/SimulatorForm"
import { ResultCard } from "@/components/ResultCard"
import { calculate, SimulatorInput } from "@/lib/calculations"

const DEFAULT_INPUT: SimulatorInput = {
  monthlyRate: 700_000,
  workingMonths: 12,
  prefecture: "東京都",
  age40plus: false,
  dependents: 0,
  ctMode: "exclusive",
  taxType: "exempt",
  expenses: 0,
  aoiro: 650_000,
  shoukibo: 0,
  ideco: 0,
  nisa: 0,
  horizonYears: 20,
  pensionReceiveYears: 20,
  spouseDeduction: false,
}

export default function Home() {
  const [input, setInput] = useState<SimulatorInput>(DEFAULT_INPUT)
  const result = useMemo(() => calculate(input), [input])

  return (
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold">フリーランスシミュレーター</h1>
            <p className="text-xs text-muted-foreground">令和7年度（2025年度）版 · 個人事業主向け</p>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
          {/* 左: 入力フォーム */}
          <div>
            <div className="bg-card border rounded-lg p-5">
              <SimulatorForm input={input} onChange={setInput} />
            </div>
          </div>

          {/* 右: 結果 */}
          <div>
            <ResultCard
              result={result}
              workingMonths={input.workingMonths}
            />
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-muted-foreground py-6 border-t mt-8">
        <p>© 2025 フリーランスシミュレーター · 計算結果はあくまで概算です</p>
      </footer>
    </div>
  )
}
