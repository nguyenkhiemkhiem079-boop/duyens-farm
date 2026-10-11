export interface SalonCustomerRequest {
  fiction: boolean; // True for invented game-world scenes, never a real memory.
  id: string;
  customerName: string;
  avatar: string;
  dialogueIntro: string;
  requestedColor: { nameVi: string; hex: string };
  requestedStyle: 'wavy' | 'straight' | 'curly';
  targetLengthPercent: number; // e.g. 70 (cut ~30%)
  dialogueSatisfied: string;
  baseRewardCoins: number;
  tipCoins: number;
  expReward: number;
}

export const SALON_CUSTOMERS: SalonCustomerRequest[] = [
  {
    id: 'cust_lan',
    fiction: true,
    customerName: 'Bạn Lan Dịu Dàng',
    avatar: '🌸',
    dialogueIntro:
      'Chị Duyên ơi! Em sắp đi phỏng vấn việc làm mới. Chị giúp em cắt bớt phần đuôi chẻ ngọn, nhuộm màu Nâu Hạt Dẻ ấm áp và uốn lượn sóng nhẹ nhàng giúp em nhé!',
    requestedColor: { nameVi: 'Nâu Hạt Dẻ Ấm Áp', hex: '#6f4e37' },
    requestedStyle: 'wavy',
    targetLengthPercent: 75,
    dialogueSatisfied:
      'Ôi chị Duyên khéo tay quá! Tóc em vừa mềm vừa bồng bềnh, em tự tin hơn hẳn rồi. Em cảm ơn chị nhiều lắm!',
    baseRewardCoins: 45,
    tipCoins: 15,
    expReward: 30,
  },
  {
    id: 'cust_hoa',
    fiction: true,
    customerName: 'Cô Hoa Tạp Hóa',
    avatar: '🧺',
    dialogueIntro:
      'Duyên ơi! Mấy hôm nay bán hàng nắng quá, tóc cô xơ xác hết rồi. Cháu gội xả mát lạnh, tỉa bớt cho gọn nhẹ rồi uốn xoăn bồng bềnh quý phái giúp cô đi!',
    requestedColor: { nameVi: 'Đen Tuyền Tự Nhiên', hex: '#262626' },
    requestedStyle: 'curly',
    targetLengthPercent: 60,
    dialogueSatisfied:
      'Trời ơi mát mẻ nhẹ nhõm cái đầu ghê cháu ơi! Ai nhìn vào cũng tưởng cô trẻ ra cả chục tuổi đấy!',
    baseRewardCoins: 50,
    tipCoins: 20,
    expReward: 35,
  },
  {
    id: 'cust_khim',
    fiction: true,
    customerName: 'Anh Khim Thử Nghiệm',
    avatar: '👓',
    dialogueIntro:
      'Vợ yêu ơi! Tóc anh hơi dài rồi nè, Duyên cắt tỉa gọn gàng hai bên mai và gội đầu mát xa cho anh với nhé. Anh tin tưởng tay nghề bà xã 100%!',
    requestedColor: { nameVi: 'Nâu Tự Nhiên', hex: '#3b2f2f' },
    requestedStyle: 'straight',
    targetLengthPercent: 80,
    dialogueSatisfied:
      'Tay Duyên gội đầu êm ái quá anh suýt ngủ gật luôn! Đẹp trai chuẩn kỹ sư BIM rồi nè vợ ơi!',
    baseRewardCoins: 60,
    tipCoins: 25,
    expReward: 40,
  },
  {
    id: 'cust_minh',
    fiction: true,
    customerName: 'Minh Mê Sách',
    avatar: '📖',
    dialogueIntro:
      'Chào Duyên. Mình muốn một kiểu tóc gọn gàng, tự nhiên để khi đọc sách không bị tóc lòa xòa trước trán. Nhờ Duyên tạo kiểu giúp mình nhé.',
    requestedColor: { nameVi: 'Nâu Trầm Cổ Điển', hex: '#4a3728' },
    requestedStyle: 'straight',
    targetLengthPercent: 70,
    dialogueSatisfied:
      'Rất gọn gàng và tinh tế! Cảm ơn Duyên đã chăm sóc mái tóc chu đáo như vậy.',
    baseRewardCoins: 40,
    tipCoins: 15,
    expReward: 25,
  },
];

export const SALON_PALETTE_COLORS = [
  { nameVi: 'Nâu Hạt Dẻ', hex: '#6f4e37' },
  { nameVi: 'Đen Tuyền Tự Nhiên', hex: '#262626' },
  { nameVi: 'Hồng Đào Pastel', hex: '#f472b6' },
  { nameVi: 'Nâu Cam Caramel', hex: '#c2410c' },
  { nameVi: 'Nâu Trầm Cổ Điển', hex: '#4a3728' },
];
