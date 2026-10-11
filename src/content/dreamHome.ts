export interface DreamHomeBundle {
  fiction: boolean; // True for invented game-world scenes, never a real memory.
  id: string;
  stageTarget: number;
  nameVi: string;
  descriptionVi: string;
  requiredItem: { id: string; name: string; count: number; emoji: string };
  requiredCoins: number;
  storyUnlockVi: string;
}

export const DREAM_HOME_BUNDLES: DreamHomeBundle[] = [
  {
    id: 'bundle_foundation',
    fiction: true,
    stageTarget: 1,
    nameVi: 'Giai đoạn 1: Móng Nhà Kiên Cố',
    descriptionVi: 'Khim tính toán tải trọng móng bằng bê tông đá cuội và khung gỗ chịu lực vững chắc.',
    requiredItem: { id: 'crop_wheat', name: 'Lúa mì gia cố rơm bùn', count: 6, emoji: '🌾' },
    requiredCoins: 40,
    storyUnlockVi: 'Đặt nền móng tình yêu vững bền cho tương lai hai đứa.',
  },
  {
    id: 'bundle_walls',
    fiction: true,
    stageTarget: 2,
    nameVi: 'Giai đoạn 2: Tường Gỗ & Khung Cửa Sổ',
    descriptionVi: 'Dựng các bức tường gỗ sáng màu cách âm tốt và cửa sổ lớn đón trọn ánh nắng phương nam.',
    requiredItem: { id: 'crop_carrot', name: 'Nông sản bồi dưỡng thợ xây', count: 8, emoji: '🥕' },
    requiredCoins: 60,
    storyUnlockVi: 'Ngôi nhà bắt đầu thành hình với những ô cửa sổ lộng gió.',
  },
  {
    id: 'bundle_roof',
    fiction: true,
    stageTarget: 3,
    nameVi: 'Giai đoạn 3: Mái Ngói Đào Ấm Áp',
    descriptionVi: 'Lợp từng viên ngói đất nung màu hồng đào pastel che chở gia đình trước mọi cơn mưa nắng.',
    requiredItem: { id: 'product_flour', name: 'Bột mì trắng thơm', count: 4, emoji: '🌾' },
    requiredCoins: 80,
    storyUnlockVi: 'Mái ấm trọn vẹn che chở những giấc ngủ bình yên.',
  },
  {
    id: 'bundle_kitchen',
    fiction: true,
    stageTarget: 4,
    nameVi: 'Giai đoạn 4: Gian Bếp Thơm Lừng Của Duyên',
    descriptionVi: 'Lắp đặt bàn đá bếp rộng rãi, kệ đựng gia vị và lò nướng bánh để Duyên trổ tài nấu nướng.',
    requiredItem: { id: 'product_carrot_bread', name: 'Bánh mì nướng ăn mừng bếp mới', count: 3, emoji: '🥖' },
    requiredCoins: 100,
    storyUnlockVi: 'Căn bếp luôn đỏ lửa và ngập tràn mùi hương ngọt ngào.',
  },
  {
    id: 'bundle_parents_room',
    fiction: true,
    stageTarget: 5,
    nameVi: 'Giai đoạn 5: Gian Phòng Đón Ba Mẹ [TODO: Chi tiết phòng dành cho ba mẹ]',
    descriptionVi:
      'Căn phòng thoáng đãng nhìn ra vườn hoa do Khim và Duyên chăm chút chu đáo để đón ba mẹ lên chơi.',
    requiredItem: { id: 'product_carrot_juice', name: 'Nước ép thơm lành bồi bổ sức khỏe', count: 4, emoji: '🥤' },
    requiredCoins: 120,
    storyUnlockVi: 'Mở khóa Chương 4 — Mái Nhà Chung & Ngày ba mẹ đến thăm.',
  },
];
