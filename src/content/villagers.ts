export interface VillagerSchedule {
  morning: { x: number; z: number; activityVi: string };
  daytime: { x: number; z: number; activityVi: string };
  evening: { x: number; z: number; activityVi: string };
}

export interface VillagerDefinition {
  fiction: boolean; // True for invented game-world scenes, never a real memory.
  id: string;
  nameVi: string;
  roleVi: string;
  avatarEmoji: string;
  descriptionVi: string;
  schedule: VillagerSchedule;
  favoriteItems: string[];
  introDialogue: string;
  chatDialogues: string[];
  giftResponses: {
    favorite: string;
    normal: string;
  };
  questId?: string;
}

export const VILLAGERS: Record<string, VillagerDefinition> = {
  ong_bay: {
    id: 'ong_bay',
    fiction: true,
    nameVi: 'Bác Bảy Thợ Mộc',
    roleVi: 'Thợ mộc lành nghề làng bên',
    avatarEmoji: '🪵',
    descriptionVi: 'Người thợ mộc già đôn hậu, luôn mang theo chiếc bào gỗ và nụ cười hiền từ.',
    schedule: {
      morning: { x: 7.5, z: 2.5, activityVi: 'Ghé xem quầy nông sản và kiểm tra kết cấu gỗ' },
      daytime: { x: 9.0, z: 6.5, activityVi: 'Nghỉ chân dưới bóng râm gần kho thóc' },
      evening: { x: 6.5, z: 1.5, activityVi: 'Đi dạo hóng gió ven đảo' },
    },
    favoriteItems: ['crop_wheat', 'product_flour'],
    introDialogue: 'Chào cháu Duyên! Bác nghe Khim tấm tắc khen hòn đảo nhỏ này suốt. Gỗ làm giàn ở đây chắc chắn lắm đấy!',
    chatDialogues: [
      'Gỗ lim hay gỗ xoan thì cũng cần được giữ khô ráo. Nông trại của cháu thoát nước tốt thật.',
      'Bác thích những công trình chắc chắn và ấm cúng; cần góp ý về gỗ thì cứ hỏi bác nhé!',
      'Cần bác chỉ cách gia cố chuồng mèo hay chòi nghỉ thì cứ bảo bác nhé!',
    ],
    giftResponses: {
      favorite: 'Bó lúa mì vàng óng đẹp quá! Cảm ơn cháu gái khéo tay nhé, bác quý lắm!',
      normal: 'Món quà tươi ngon của vườn nhà! Bác Bảy xin nhận với tất cả tấm lòng.',
    },
    questId: 'quest_ong_bay_wood',
  },

  co_hoa: {
    id: 'co_hoa',
    fiction: true,
    nameVi: 'Cô Hoa Tạp Hóa',
    roleVi: 'Chủ tiệm bách hóa đầu thôn',
    avatarEmoji: '🧺',
    descriptionVi: 'Người phụ nữ xởi lởi, vui vẻ, luôn biết mọi câu chuyện thú vị quanh làng.',
    schedule: {
      morning: { x: 8.5, z: 3.5, activityVi: 'Đứng chọn nông sản tươi tại quầy hàng' },
      daytime: { x: 4.5, z: 1.5, activityVi: 'Ngắm nghía luống cà chua mọng nước' },
      evening: { x: 7.0, z: 4.0, activityVi: 'Trò chuyện rôm rả với hàng xóm' },
    },
    favoriteItems: ['crop_tomato', 'product_tomato_sauce'],
    introDialogue: 'Duyên ơi! Cà chua với cà rốt của cháu trồng ngọt lịm, mấy bà trong làng cứ hỏi cô suốt đấy!',
    chatDialogues: [
      'Bán hàng tạp hóa vui nhất là được ngắm người ta rạng rỡ khi tìm được món đồ mình cần.',
      'Duyên và Khim cùng chăm sóc nông trại vui quá, cô chúc hai cháu luôn yêu thương nhau nhé!',
      'Hôm nào rảnh cô chở thêm ít hạt giống hoa cúc sang cho cháu trồng quanh hiên nhé.',
    ],
    giftResponses: {
      favorite: 'Cà chua đỏ au mọng nước! Cô sẽ nấu một nồi súp thật thơm đãi cả nhà!',
      normal: 'Nông sản sạch của cháu Duyên là nhất rồi, cô cảm ơn nhiều nha!',
    },
    questId: 'quest_co_hoa_supplies',
  },

  ban_lan: {
    id: 'ban_lan',
    fiction: true,
    nameVi: 'Bạn Lan Dịu Dàng',
    roleVi: 'Cô gái đang tìm kiếm sự tự tin',
    avatarEmoji: '🌸',
    descriptionVi: 'Cô gái trẻ hiền lành, đang ấp ủ ước mơ thay đổi kiểu tóc để tự tin bắt đầu công việc mới.',
    schedule: {
      morning: { x: 3.0, z: 6.0, activityVi: 'Ngồi ngắm hoa gần hiên nhà Duyên' },
      daytime: { x: 1.5, z: 3.5, activityVi: 'Đứng ngập ngừng nhìn chiếc ghế làm tóc' },
      evening: { x: 5.5, z: 6.5, activityVi: 'Đi dạo bên bờ thảm cỏ' },
    },
    favoriteItems: ['crop_carrot', 'product_carrot_juice'],
    introDialogue: 'Chào chị Duyên... Em nghe nói chị là nhà tạo mẫu tóc tài năng lắm. Em muốn đổi kiểu tóc để tự tin hơn...',
    chatDialogues: [
      'Em sắp có buổi phỏng vấn quan trọng... Cứ nhìn vào gương là em lại thấy hồi hộp.',
      'Mái tóc của chị Duyên mượt mà thật đấy, chị có bí quyết gì chăm sóc không ạ?',
      'Em thích không khí bình yên ở nông trại này quá, cảm giác nhẹ nhõm hẳn đi.',
    ],
    giftResponses: {
      favorite: 'Nước ép cà rốt ngọt dịu thanh mát! Uống vào em thấy tỉnh táo và vui vẻ hẳn lên!',
      normal: 'Em cảm ơn chị Duyên thật nhiều, chị lúc nào cũng ấm áp với mọi người.',
    },
    questId: 'quest_lan_new_look',
  },

  minh_sach: {
    id: 'minh_sach',
    fiction: true,
    nameVi: 'Minh Mê Sách',
    roleVi: 'Độc giả yêu sách & thiên nhiên',
    avatarEmoji: '📖',
    descriptionVi: 'Chàng trai điềm tĩnh, tay luôn cầm một cuốn sách văn học và thích những góc yên tĩnh.',
    schedule: {
      morning: { x: 1.5, z: 7.5, activityVi: 'Ngồi đọc sách dưới hiên nhà' },
      daytime: { x: 6.0, z: 6.0, activityVi: 'Tản bộ ngắm các chú mèo sưởi nắng' },
      evening: { x: 3.5, z: 1.5, activityVi: 'Đọc thơ bên luống lúa mì' },
    },
    favoriteItems: ['product_flour', 'product_carrot_bread'],
    introDialogue: 'Chào bạn Duyên. Góc vườn này yên tĩnh thật, đọc sách ở đây cảm giác từng trang chữ đều có hương thơm đồng nội.',
    chatDialogues: [
      'Một cuốn sách hay giống như một vụ mùa tốt tươi — đều cần sự kiên nhẫn bồi đắp.',
      'Mình nghe nói trước đây bạn và anh Khim có một kỷ niệm thật đẹp tại quán cà phê sách...',
      'Bé mèo Mochi vừa nãy nằm cạnh chân mình ngủ ngoan lắm, làm mình không nỡ đứng dậy.',
    ],
    giftResponses: {
      favorite: 'Bánh mì cà rốt thơm phức! Vừa nhâm nhi vừa đọc sách thì không còn gì tuyệt bằng.',
      normal: 'Món quà thanh nhã quá, cảm ơn Duyên rất nhiều!',
    },
    questId: 'quest_minh_book_cafe',
  },
};
