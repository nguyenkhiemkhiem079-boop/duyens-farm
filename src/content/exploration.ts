export interface ExplorationZoneInfo {
  fiction: boolean; // True for invented game-world scenes, never a real memory.
  id: 'forest' | 'lake' | 'flower_hill' | 'cave';
  nameVi: string;
  iconEmoji: string;
  descriptionVi: string;
  activities: Array<{
    id: string;
    nameVi: string;
    descriptionVi: string;
    energyCost: number;
    rewards: Array<{ itemId: string; name: string; count: number; value: number }>;
  }>;
}

export const EXPLORATION_ZONES: Record<string, ExplorationZoneInfo> = {
  forest: {
    id: 'forest',
    fiction: true,
    nameVi: 'Khu Rừng Thơm Mát',
    iconEmoji: '🌲',
    descriptionVi: 'Cánh rừng sồi rợp bóng mát, róc rách tiếng suối reo và ngập tràn nấm rừng tươi ngon.',
    activities: [
      {
        id: 'forage_mushroom',
        nameVi: 'Hái Nấm Hương Rừng',
        descriptionVi: 'Lần theo gốc cây mục để tìm những tai nấm hương thơm lừng.',
        energyCost: 4,
        rewards: [{ itemId: 'item_mushroom', name: 'Nấm hương rừng', count: 2, value: 25 }],
      },
      {
        id: 'gather_herbs',
        nameVi: 'Thu Hái Thảo Mộc Thơm',
        descriptionVi: 'Những ngọn bạc hà và cỏ ngọt rừng mang hương vị the mát dễ chịu.',
        energyCost: 3,
        rewards: [{ itemId: 'item_herb', name: 'Bó thảo mộc rừng', count: 2, value: 20 }],
      },
    ],
  },

  lake: {
    id: 'lake',
    fiction: true,
    nameVi: 'Bờ Hồ Gió Lộng',
    iconEmoji: '🌊',
    descriptionVi: 'Mặt hồ phẳng lặng như gương soi bóng mây trời, nơi lý tưởng để ngồi câu cá thư thái.',
    activities: [
      {
        id: 'fish_lake',
        nameVi: 'Thong Thả Buông Cần Câu',
        descriptionVi: 'Nhẹ nhàng thả mồi câu, kiên nhẫn đợi cá đớp mồi mà không hề có áp lực thời gian.',
        energyCost: 5,
        rewards: [{ itemId: 'item_fish_lake', name: 'Cá suối tươi óng ánh', count: 1, value: 35 }],
      },
      {
        id: 'collect_shells',
        nameVi: 'Nhặt Vỏ Ốc Bờ Hồ',
        descriptionVi: 'Những chiếc vỏ ốc nhỏ nhắn lấp lánh như ngọc trai được sóng dạt vào bờ.',
        energyCost: 2,
        rewards: [{ itemId: 'item_shell', name: 'Vỏ ốc xinh xắn', count: 3, value: 15 }],
      },
    ],
  },

  flower_hill: {
    id: 'flower_hill',
    fiction: true,
    nameVi: 'Đồi Hoa Gió Thổi',
    iconEmoji: '💐',
    descriptionVi: 'Triền đồi ngút ngàn hoa dại rực rỡ sắc màu, phóng tầm mắt ngắm trọn hòn đảo nhỏ.',
    activities: [
      {
        id: 'pick_flowers',
        nameVi: 'Hái Bó Hoa Dại Tươi',
        descriptionVi: 'Cắm một lọ hoa đồng nội đặt ở góc bàn ăn cho thêm phần ấm cúng.',
        energyCost: 3,
        rewards: [{ itemId: 'item_wildflowers', name: 'Bó hoa đồng nội', count: 2, value: 20 }],
      },
      {
        id: 'rest_viewpoint',
        nameVi: 'Ngồi Ngắm Mây Trời & Hồi Sức',
        descriptionVi: 'Hít căng lồng ngực bầu không khí trong lành, cảm nhận niềm bình an sâu lắng.',
        energyCost: 0,
        rewards: [],
      },
    ],
  },

  cave: {
    id: 'cave',
    fiction: true,
    nameVi: 'Hang Đá Pha Lê Nhỏ',
    iconEmoji: '💎',
    descriptionVi: 'Hang đá tự nhiên lung linh ánh sáng thạch anh, nơi ẩn chứa những viên đá cuội lấp lánh.',
    activities: [
      {
        id: 'gather_stones',
        nameVi: 'Thu Thập Đá Cuội Đẹp',
        descriptionVi: 'Những viên đá cuội tròn nhẵn để lát lối đi sân vườn hoặc gia cố móng nhà.',
        energyCost: 4,
        rewards: [{ itemId: 'item_stone', name: 'Đá cuội sân vườn', count: 3, value: 18 }],
      },
    ],
  },
};
