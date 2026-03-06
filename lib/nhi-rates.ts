/**
 * 国民健康保険料 都道府県別料率（令和7年度・2025年度）
 *
 * ※ 都道府県単位保険料率（令和6年度統一後）の概算値です。
 *    実際の保険料は市区町村によって均等割が異なる場合があります。
 *    参考: 厚生労働省・各都道府県国民健康保険団体連合会の公表データ
 *
 * 計算式:
 *   NHI基礎所得 = max(0, 前年所得 - 430,000)  // 33万円 + 10万円控除
 *   医療分 = 基礎所得 × 所得割率 + 均等割 × 加入者数
 *   介護分（40-64歳）= 基礎所得 × 所得割率 + 均等割 × 40-64歳加入者数
 *   合計 = min(医療分 + 介護分, 上限)
 */

export interface NhiPrefectureRate {
  prefecture: string
  // 医療分 + 後期高齢者支援分 合算
  iryo: {
    shotokuRitsu: number  // 所得割率（小数）
    kintoWari: number     // 均等割（円/年/人）
    jogen: number         // 上限額（円/年）
  }
  // 介護分（40〜64歳のみ）
  kaigo: {
    shotokuRitsu: number
    kintoWari: number
    jogen: number
  }
}

/**
 * 令和7年度 都道府県別 国民健康保険料率（概算）
 * 医療分 + 後期高齢者支援分の合算
 * 上限額: 医療+支援=89万円、介護=18万円
 */
export const NHI_RATES: NhiPrefectureRate[] = [
  { prefecture: "北海道",    iryo: { shotokuRitsu: 0.1005, kintoWari: 35800, jogen: 890000 }, kaigo: { shotokuRitsu: 0.0240, kintoWari: 12600, jogen: 180000 } },
  { prefecture: "青森県",    iryo: { shotokuRitsu: 0.1040, kintoWari: 33200, jogen: 890000 }, kaigo: { shotokuRitsu: 0.0240, kintoWari: 12200, jogen: 180000 } },
  { prefecture: "岩手県",    iryo: { shotokuRitsu: 0.0990, kintoWari: 34500, jogen: 890000 }, kaigo: { shotokuRitsu: 0.0230, kintoWari: 11800, jogen: 180000 } },
  { prefecture: "宮城県",    iryo: { shotokuRitsu: 0.0940, kintoWari: 37200, jogen: 890000 }, kaigo: { shotokuRitsu: 0.0230, kintoWari: 13000, jogen: 180000 } },
  { prefecture: "秋田県",    iryo: { shotokuRitsu: 0.1060, kintoWari: 32800, jogen: 890000 }, kaigo: { shotokuRitsu: 0.0250, kintoWari: 12000, jogen: 180000 } },
  { prefecture: "山形県",    iryo: { shotokuRitsu: 0.0990, kintoWari: 34600, jogen: 890000 }, kaigo: { shotokuRitsu: 0.0235, kintoWari: 12400, jogen: 180000 } },
  { prefecture: "福島県",    iryo: { shotokuRitsu: 0.0970, kintoWari: 35100, jogen: 890000 }, kaigo: { shotokuRitsu: 0.0235, kintoWari: 12600, jogen: 180000 } },
  { prefecture: "茨城県",    iryo: { shotokuRitsu: 0.0880, kintoWari: 43200, jogen: 890000 }, kaigo: { shotokuRitsu: 0.0215, kintoWari: 14800, jogen: 180000 } },
  { prefecture: "栃木県",    iryo: { shotokuRitsu: 0.0890, kintoWari: 41600, jogen: 890000 }, kaigo: { shotokuRitsu: 0.0220, kintoWari: 14200, jogen: 180000 } },
  { prefecture: "群馬県",    iryo: { shotokuRitsu: 0.0870, kintoWari: 43800, jogen: 890000 }, kaigo: { shotokuRitsu: 0.0215, kintoWari: 14600, jogen: 180000 } },
  { prefecture: "埼玉県",    iryo: { shotokuRitsu: 0.0850, kintoWari: 45500, jogen: 890000 }, kaigo: { shotokuRitsu: 0.0210, kintoWari: 15200, jogen: 180000 } },
  { prefecture: "千葉県",    iryo: { shotokuRitsu: 0.0865, kintoWari: 44800, jogen: 890000 }, kaigo: { shotokuRitsu: 0.0215, kintoWari: 15000, jogen: 180000 } },
  { prefecture: "東京都",    iryo: { shotokuRitsu: 0.0772, kintoWari: 47000, jogen: 890000 }, kaigo: { shotokuRitsu: 0.0203, kintoWari: 15600, jogen: 180000 } },
  { prefecture: "神奈川県",  iryo: { shotokuRitsu: 0.0900, kintoWari: 40200, jogen: 890000 }, kaigo: { shotokuRitsu: 0.0225, kintoWari: 14000, jogen: 180000 } },
  { prefecture: "新潟県",    iryo: { shotokuRitsu: 0.0950, kintoWari: 38200, jogen: 890000 }, kaigo: { shotokuRitsu: 0.0230, kintoWari: 13200, jogen: 180000 } },
  { prefecture: "富山県",    iryo: { shotokuRitsu: 0.0920, kintoWari: 40000, jogen: 890000 }, kaigo: { shotokuRitsu: 0.0230, kintoWari: 13800, jogen: 180000 } },
  { prefecture: "石川県",    iryo: { shotokuRitsu: 0.0930, kintoWari: 39600, jogen: 890000 }, kaigo: { shotokuRitsu: 0.0230, kintoWari: 13600, jogen: 180000 } },
  { prefecture: "福井県",    iryo: { shotokuRitsu: 0.0920, kintoWari: 40800, jogen: 890000 }, kaigo: { shotokuRitsu: 0.0225, kintoWari: 14000, jogen: 180000 } },
  { prefecture: "山梨県",    iryo: { shotokuRitsu: 0.0940, kintoWari: 38600, jogen: 890000 }, kaigo: { shotokuRitsu: 0.0230, kintoWari: 13200, jogen: 180000 } },
  { prefecture: "長野県",    iryo: { shotokuRitsu: 0.0890, kintoWari: 41800, jogen: 890000 }, kaigo: { shotokuRitsu: 0.0220, kintoWari: 14200, jogen: 180000 } },
  { prefecture: "静岡県",    iryo: { shotokuRitsu: 0.0880, kintoWari: 42400, jogen: 890000 }, kaigo: { shotokuRitsu: 0.0220, kintoWari: 14600, jogen: 180000 } },
  { prefecture: "愛知県",    iryo: { shotokuRitsu: 0.0870, kintoWari: 43200, jogen: 890000 }, kaigo: { shotokuRitsu: 0.0215, kintoWari: 15000, jogen: 180000 } },
  { prefecture: "三重県",    iryo: { shotokuRitsu: 0.0920, kintoWari: 40600, jogen: 890000 }, kaigo: { shotokuRitsu: 0.0225, kintoWari: 13800, jogen: 180000 } },
  { prefecture: "滋賀県",    iryo: { shotokuRitsu: 0.0890, kintoWari: 42600, jogen: 890000 }, kaigo: { shotokuRitsu: 0.0220, kintoWari: 14400, jogen: 180000 } },
  { prefecture: "京都府",    iryo: { shotokuRitsu: 0.0940, kintoWari: 39800, jogen: 890000 }, kaigo: { shotokuRitsu: 0.0235, kintoWari: 13600, jogen: 180000 } },
  { prefecture: "大阪府",    iryo: { shotokuRitsu: 0.0970, kintoWari: 36000, jogen: 890000 }, kaigo: { shotokuRitsu: 0.0240, kintoWari: 12800, jogen: 180000 } },
  { prefecture: "兵庫県",    iryo: { shotokuRitsu: 0.0920, kintoWari: 40400, jogen: 890000 }, kaigo: { shotokuRitsu: 0.0230, kintoWari: 13800, jogen: 180000 } },
  { prefecture: "奈良県",    iryo: { shotokuRitsu: 0.0950, kintoWari: 38200, jogen: 890000 }, kaigo: { shotokuRitsu: 0.0235, kintoWari: 13000, jogen: 180000 } },
  { prefecture: "和歌山県",  iryo: { shotokuRitsu: 0.0980, kintoWari: 36400, jogen: 890000 }, kaigo: { shotokuRitsu: 0.0240, kintoWari: 12600, jogen: 180000 } },
  { prefecture: "鳥取県",    iryo: { shotokuRitsu: 0.1000, kintoWari: 34200, jogen: 890000 }, kaigo: { shotokuRitsu: 0.0240, kintoWari: 12000, jogen: 180000 } },
  { prefecture: "島根県",    iryo: { shotokuRitsu: 0.0990, kintoWari: 35400, jogen: 890000 }, kaigo: { shotokuRitsu: 0.0240, kintoWari: 12400, jogen: 180000 } },
  { prefecture: "岡山県",    iryo: { shotokuRitsu: 0.0950, kintoWari: 38600, jogen: 890000 }, kaigo: { shotokuRitsu: 0.0235, kintoWari: 13200, jogen: 180000 } },
  { prefecture: "広島県",    iryo: { shotokuRitsu: 0.0920, kintoWari: 41200, jogen: 890000 }, kaigo: { shotokuRitsu: 0.0230, kintoWari: 14200, jogen: 180000 } },
  { prefecture: "山口県",    iryo: { shotokuRitsu: 0.0980, kintoWari: 36800, jogen: 890000 }, kaigo: { shotokuRitsu: 0.0240, kintoWari: 12800, jogen: 180000 } },
  { prefecture: "徳島県",    iryo: { shotokuRitsu: 0.1010, kintoWari: 34600, jogen: 890000 }, kaigo: { shotokuRitsu: 0.0245, kintoWari: 12200, jogen: 180000 } },
  { prefecture: "香川県",    iryo: { shotokuRitsu: 0.0980, kintoWari: 36200, jogen: 890000 }, kaigo: { shotokuRitsu: 0.0240, kintoWari: 12600, jogen: 180000 } },
  { prefecture: "愛媛県",    iryo: { shotokuRitsu: 0.1000, kintoWari: 35000, jogen: 890000 }, kaigo: { shotokuRitsu: 0.0240, kintoWari: 12200, jogen: 180000 } },
  { prefecture: "高知県",    iryo: { shotokuRitsu: 0.1040, kintoWari: 32600, jogen: 890000 }, kaigo: { shotokuRitsu: 0.0250, kintoWari: 11800, jogen: 180000 } },
  { prefecture: "福岡県",    iryo: { shotokuRitsu: 0.0970, kintoWari: 37400, jogen: 890000 }, kaigo: { shotokuRitsu: 0.0240, kintoWari: 13000, jogen: 180000 } },
  { prefecture: "佐賀県",    iryo: { shotokuRitsu: 0.1010, kintoWari: 33800, jogen: 890000 }, kaigo: { shotokuRitsu: 0.0245, kintoWari: 12000, jogen: 180000 } },
  { prefecture: "長崎県",    iryo: { shotokuRitsu: 0.1030, kintoWari: 32800, jogen: 890000 }, kaigo: { shotokuRitsu: 0.0250, kintoWari: 11800, jogen: 180000 } },
  { prefecture: "熊本県",    iryo: { shotokuRitsu: 0.1010, kintoWari: 34200, jogen: 890000 }, kaigo: { shotokuRitsu: 0.0245, kintoWari: 12200, jogen: 180000 } },
  { prefecture: "大分県",    iryo: { shotokuRitsu: 0.0990, kintoWari: 35600, jogen: 890000 }, kaigo: { shotokuRitsu: 0.0240, kintoWari: 12400, jogen: 180000 } },
  { prefecture: "宮崎県",    iryo: { shotokuRitsu: 0.1020, kintoWari: 33400, jogen: 890000 }, kaigo: { shotokuRitsu: 0.0245, kintoWari: 11800, jogen: 180000 } },
  { prefecture: "鹿児島県",  iryo: { shotokuRitsu: 0.1030, kintoWari: 33000, jogen: 890000 }, kaigo: { shotokuRitsu: 0.0250, kintoWari: 12000, jogen: 180000 } },
  { prefecture: "沖縄県",    iryo: { shotokuRitsu: 0.1060, kintoWari: 31800, jogen: 890000 }, kaigo: { shotokuRitsu: 0.0255, kintoWari: 11600, jogen: 180000 } },
]

export function getNhiRates(prefecture: string): NhiPrefectureRate {
  return NHI_RATES.find(r => r.prefecture === prefecture) ?? NHI_RATES[12] // default: 東京都
}

export const PREFECTURE_LIST = NHI_RATES.map(r => r.prefecture)
