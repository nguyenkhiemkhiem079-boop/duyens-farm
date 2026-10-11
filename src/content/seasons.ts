import { SeasonType, WeatherType } from '../core/types';

export interface SeasonInfo {
  fiction: boolean; // True for invented game-world scenes, never a real memory.
  id: SeasonType;
  nameVi: string;
  iconEmoji: string;
  grassColor: number;
  skyColor: number;
  descriptionVi: string;
  festivalDay: number;
  festivalNameVi: string;
  festivalDescriptionVi: string;
  familyLetterTemplate: string;
}

export const SEASONS_DATA: Record<SeasonType, SeasonInfo> = {
  spring: {
    id: 'spring',
    fiction: true,
    nameVi: 'Mùa Xuân',
    iconEmoji: '🌸',
    grassColor: 0xa8d5ba, // fresh sage green
    skyColor: 0xbde0fe,
    descriptionVi: 'Trăm hoa đua nở, vạn vật đâm chồi, không khí mát lành dễ chịu.',
    festivalDay: 15,
    festivalNameVi: 'Lễ Hội Hoa Xuân Thôn Xanh',
    festivalDescriptionVi: 'Dân làng tụ họp trang hoàng nông trại bằng những vòng hoa thơm và trao nhau lời chúc tốt lành.',
    familyLetterTemplate: '[TODO: thư ba mẹ — mùa xuân: Lời chúc tết và dặn dò đầu năm]',
  },
  summer: {
    id: 'summer',
    fiction: true,
    nameVi: 'Mùa Hạ',
    iconEmoji: '☀️',
    grassColor: 0x86efac, // bright sunlit green
    skyColor: 0x93c5fd,
    descriptionVi: 'Ánh nắng vàng rực rỡ, cây cối lớn nhanh như thổi, bầu trời cao xanh thẳm.',
    festivalDay: 20,
    festivalNameVi: 'Đêm Câu Cá & Ngắm Pháo Hoa Bên Hồ',
    festivalDescriptionVi: 'Buổi tối lộng gió bên bờ hồ tĩnh lặng, cùng nhau buông cần và ngắm những đốm pháo hoa rực rỡ.',
    familyLetterTemplate: '[TODO: thư ba mẹ — mùa hạ: Lời hỏi thăm vụ mùa và nhắc nhở uống nước mát]',
  },
  autumn: {
    id: 'autumn',
    fiction: true,
    nameVi: 'Mùa Thu',
    iconEmoji: '🍁',
    grassColor: 0xfcd34d, // golden amber grass
    skyColor: 0xfbcfe8,
    descriptionVi: 'Gió thu heo may nhè nhẹ, lá vàng rơi êm đềm, mùa của những mẻ bánh nướng thơm lừng.',
    festivalDay: 18,
    festivalNameVi: 'Triển Lãm Nông Sản Mùa Vàng Bội Thu',
    festivalDescriptionVi: 'Trưng bày những củ cà rốt to nhất, bông lúa mì trĩu hạt và những hũ mứt thơm phức.',
    familyLetterTemplate: '[TODO: thư ba mẹ — mùa thu: Lời gửi gắm tình thương và quà quê]',
  },
  winter: {
    id: 'winter',
    fiction: true,
    nameVi: 'Mùa Đông',
    iconEmoji: '❄️',
    grassColor: 0xe2e8f0, // frosty soft snow white-gray
    skyColor: 0x94a3b8,
    descriptionVi: 'Màn sương bạc bồng bềnh, bông tuyết bay lất phất, cả nhà quây quần bên bếp lửa hồng.',
    festivalDay: 25,
    festivalNameVi: 'Ngày Hội Nấu Bánh Chưng & Sum Vầy',
    festivalDescriptionVi: 'Cùng gói bánh nướng bánh bên bếp lửa bập bùng, chia sẻ kỷ niệm và lắng nghe tiếng cười giòn tan.',
    familyLetterTemplate: '[TODO: thư ba mẹ — mùa đông: Lời hẹn sum vầy cuối năm]',
  },
};

/**
 * Weather probability distribution per season.
 */
export const WEATHER_PROBABILITIES: Record<SeasonType, Record<WeatherType, number>> = {
  spring: { sunny: 0.6, rainy: 0.25, foggy: 0.15, stormy: 0.0, snowy: 0.0 },
  summer: { sunny: 0.6, rainy: 0.2, stormy: 0.15, foggy: 0.05, snowy: 0.0 },
  autumn: { sunny: 0.55, foggy: 0.25, rainy: 0.15, stormy: 0.05, snowy: 0.0 },
  winter: { sunny: 0.45, snowy: 0.35, foggy: 0.15, rainy: 0.05, stormy: 0.0 },
};

export function rollDailyWeather(season: SeasonType, day: number): WeatherType {
  // Deterministic seed based on day and season so reload NEVER rerolls weather!
  const seed = (day * 9301 + 49297) % 233280;
  const rand = seed / 233280;

  const probs = WEATHER_PROBABILITIES[season];
  let cumulative = 0;
  for (const [wType, p] of Object.entries(probs) as Array<[WeatherType, number]>) {
    cumulative += p;
    if (rand <= cumulative) {
      return wType;
    }
  }
  return 'sunny';
}
