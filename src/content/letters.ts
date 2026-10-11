export interface MailLetter {
  fiction: boolean; // True for invented game-world scenes, never a real memory.
  id: string;
  sender: string;
  senderRole: string;
  subject: string;
  contentVi: string;
  deliveryDay: number;
  reward?: {
    coins?: number;
    items?: Array<{ id: string; name: string; count: number }>;
  };
  isRead: boolean;
  isClaimed: boolean;
  isPlaceholder?: boolean;
}

export const INITIAL_LETTERS: MailLetter[] = [
  {
    id: 'letter_welcome',
    fiction: true,
    sender: 'Ban Quản Lý Thôn Bình Yên',
    senderRole: 'Đại diện dân làng',
    subject: 'Lời chào mừng nồng nhiệt gửi đến Duyên & Khim!',
    contentVi:
      'Gửi cô chủ nhỏ Duyên,\n\nCả làng Bình Yên vô cùng hân hoan khi hay tin hai vợ chồng bắt đầu gầy dựng nông trại trên hòn đảo xanh. Hộp thư này sẽ là cầu nối gắn kết bà con với khu vườn của Duyên. Kèm theo đây là chút vốn nhỏ chúc mừng gia đình luôn ấm êm, mùa màng bội thu!',
    deliveryDay: 1,
    reward: {
      coins: 50,
      items: [{ id: 'seed_wheat', name: 'Hạt giống lúa mì', count: 10 }],
    },
    isRead: false,
    isClaimed: false,
  },
  {
    id: 'letter_khim_note',
    fiction: true,
    sender: 'Khim Yêu Dấu',
    senderRole: 'Chồng & Kỹ sư BIM của Duyên',
    subject: 'Mảnh giấy nhỏ để trong túi áo Duyên 💌',
    contentVi:
      'Vợ ơi,\n\nSáng nay nhìn Duyên ra vườn tưới cây dưới ánh nắng sớm, anh thấy mình là người may mắn nhất thế gian. Đừng làm việc quá sức nhé, nhớ uống nước đầy đủ. Anh để dành mấy đồng xu ăn sáng tặng Duyên mua hạt giống mới nè. Yêu Duyên rất nhiều!',
    deliveryDay: 1,
    reward: {
      coins: 30,
    },
    isRead: false,
    isClaimed: false,
  },
  {
    id: 'letter_lan_hair',
    fiction: true,
    sender: 'Bạn Lan',
    senderRole: 'Khách hàng thân thiết',
    subject: 'Lời cảm ơn từ tận đáy lòng...',
    contentVi:
      'Chị Duyên ơi,\n\nTừ hôm được chị chăm chút mái tóc, em cảm giác như mình được tiếp thêm nguồn năng lượng mới vậy! Em tự tin cười nhiều hơn và ai cũng khen em rạng rỡ. Em gửi chị chút bột mì tự tay em xay để chị làm bánh thơm nhé!',
    deliveryDay: 2,
    reward: {
      items: [{ id: 'product_flour', name: 'Bột mì trắng', count: 2 }],
    },
    isRead: false,
    isClaimed: false,
  },
  {
    id: 'letter_family_placeholder',
    fiction: false,
    sender: 'Gia Đình & Ba Mẹ',
    senderRole: 'Người thân yêu',
    subject: '[TODO: Thư gửi từ gia đình và người thân]',
    contentVi:
      '[TODO: xác nhận nội dung thư ba mẹ gửi Duyên và Khim]',
    deliveryDay: 3,
    reward: {
      coins: 100,
    },
    isRead: false,
    isClaimed: false,
    isPlaceholder: true,
  },
];
