// src/lib/weather.ts
/* 💡 気象データ処理・野球コンテキスト変換ユーティリティ */

/**
 * Open-Meteo API からのレスポンス構造
 */
export interface OpenMeteoResponse {
  current: {
    temperature_2m: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
  };
}

/**
 * アプリ内で使用する整理された天気データの型
 */
export interface WeatherDisplayData {
  temp: number;
  weatherText: string;
  windDirection: string;
  windDegree: number;
  windSpeed: number;
}

/**
 * 💡 風向角度(0-360)を野球の現場で伝わりやすい16方位の日本語に変換する
 * 投手や外野手が「どっちから風が来ているか」を判断する基準
 */
export function getWindDirectionLabel(degree: number): string {
  const directions = [
    "北", "北北東", "北東", "東北東", "東", "東南東", "南東", "南南東",
    "南", "南南西", "南西", "西南西", "西", "西北西", "北西", "北北西"
  ];
  // 360度を16分割（22.5度ずつ）してインデックスを算出
  const index = Math.round(degree / 22.5) % 16;
  return directions[index];
}

/**
 * 💡 WMO（世界気象機関）の天気コードを日本語の名称に変換する
 */
export function getWMOWeatherText(code: number): string {
  const weatherMap: Record<number, string> = {
    0: "快晴",
    1: "晴れ",
    2: "時々曇り",
    3: "曇り",
    45: "霧",
    48: "着氷性の霧",
    51: "軽度の霧雨",
    53: "霧雨",
    55: "強い霧雨",
    61: "小雨",
    63: "雨",
    65: "強い雨",
    71: "小雪",
    73: "雪",
    75: "大雪",
    80: "にわか雨",
    81: "強いにわか雨",
    82: "激しいにわか雨",
    95: "雷雨",
  };

  return weatherMap[code] || "不明";
}
