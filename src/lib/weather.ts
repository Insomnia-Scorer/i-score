// filepath: src/lib/weather.ts
/* 💡 気象データ処理・野球コンテキスト変換ユーティリティ */

export interface OpenMeteoResponse {
  current: {
    temperature_2m: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
  };
}

/**
 * 💡 緯度経度から市区町村名を取得する
 */
export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&accept-language=ja`
    );
    if (res.ok) {
      const data = await res.json();
      const addr = data.address;
      
      // 日本の住所体系に合わせた抽出
      const prefecture = addr.province || addr.state || addr.region || "";
      const city = addr.city || addr.town || addr.village || addr.suburb || addr.ward || "";
      const district = addr.city_district || ""; // 区など
      
      const fullName = `${prefecture}${city}${district}`;
      return fullName || "現在地を特定できません";
    }
    return "現在地";
  } catch (e) {
    return "現在地";
  }
}

/**
 * 💡 風向角度を野球で伝わりやすい16方位に変換
 */
export function getWindDirectionLabel(degree: number): string {
  const directions = ["北", "北北東", "北東", "東北東", "東", "東南東", "南東", "南南東", "南", "南南西", "南西", "西南西", "西", "西北西", "北西", "北北西"];
  const index = Math.round(degree / 22.5) % 16;
  return directions[index];
}

/**
 * 💡 天気コードを日本語に変換
 */
export function getWMOWeatherText(code: number): string {
  const weatherMap: Record<number, string> = {
    0: "快晴", 1: "晴れ", 2: "晴れ", 3: "曇り", 45: "霧", 48: "霧",
    51: "霧雨", 61: "小雨", 63: "雨", 80: "にわか雨", 95: "雷雨"
  };
  return weatherMap[code] || "不明";
}
