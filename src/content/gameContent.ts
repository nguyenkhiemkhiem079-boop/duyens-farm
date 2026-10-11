/**
 * Game content and Vietnamese dialogue strings.
 * Explicit placeholders are retained for unconfirmed personal lore.
 */

export const GAME_LORE_PLACEHOLDERS = {
  salonName: '[TODO: Tên salon làm đẹp yêu thích của Duyên]',
  sharedMemory: '[TODO: xác nhận kỷ niệm riêng của Khim và Duyên]',
  familyLetters: '[TODO: Thư gửi từ gia đình và người thân]',
  khimFinalLetter: '[TODO: Bức thư tay chân thành cuối cùng Khim viết riêng cho Duyên]',
  mayUnconfirmedPersonality: '[TODO: Tính cách chi tiết và kỷ niệm tuổi thơ của bé mèo Mây chưa được xác nhận đầy đủ]',
};

export const GAME_FICTION_LABEL = 'Chuyện hư cấu trong game — lời thoại và hoạt động không phải ký ức ngoài đời.';

export const KHIM_DIALOGUES = [
  {
    text: 'Chào Duyên yêu dấu! Hôm nay trời nắng đẹp ghê. Duyên tưới cây xong chưa, để anh phụ bưng nước nhé?',
    bimJoke: false,
    fiction: true,
  },
  {
    text: 'Anh vừa dùng Revit kiểm tra cao độ luống hoa của Duyên rồi — độ dốc thoát nước chuẩn chỉ LOD 400 không chê vào đâu được!',
    bimJoke: true,
    fiction: true,
  },
  {
    text: 'Nhìn Duyên chăm nông trại vui tươi thế này, bao nhiêu file IFC bị lỗi giao cắt (clash detection) ở công ty anh cũng thấy nhẹ tênh.',
    bimJoke: true,
    fiction: true,
  },
  {
    text: 'Anh thiết kế ngôi nhà nhỏ này chịu tải bằng tình yêu thương vô hạn đấy, bảo hành trọn đời luôn!',
    bimJoke: false,
    fiction: true,
  },
  {
    text: 'Duyên có mệt không? Nếu mỏi lưng thì về hiên nhà ngồi nghỉ ngơi một lát nhé, năng lượng sẽ hồi phục ngay mà.',
    bimJoke: false,
    fiction: true,
  },
  {
    text: 'Mô hình BIM nông trại này không có tham số nào đo đếm được sự đáng yêu của Duyên cả — nó vượt ngưỡng tối đa rồi!',
    bimJoke: true,
    fiction: true,
  },
];

export const KHIM_GIFT_REACTIONS: Record<string, string> = {
  carrot: 'Ôi cà rốt giòn ngọt Duyên tự tay trồng! Anh sẽ để dành luộc chấm kho quẹt nhé, cảm ơn bà xã tuyệt vời!',
  wheat: 'Bông lúa mì vàng óng thơm quá! Cảm giác như mùa vàng bội thu đong đầy hạnh phúc vậy.',
  tomato: 'Quả cà chua mọng nước xinh xắn như nụ cười của Duyên vậy. Anh thích lắm!',
  default: 'Món quà Duyên tặng, dù là gì anh cũng trân trọng giữ gìn hết!',
};

export const CAT_DIALOGUES = {
  fiction: true,
  mochi: {
    name: 'Mochi',
    title: 'Mèo Mochi đốm bò sữa hiền lành',
    petRequest: 'Mochi đang dụi dụi vào chân bạn, muốn được xoa đầu và gãi cằm đó!',
    petSuccess: 'Mochi rừ rừ thỏa mãn, áp sát chiếc mũi hồng ươn ướt vào lòng bàn tay Duyên.',
    dailyDone: 'Mochi đã no nê tình cảm rồi, đang lim dim sưởi nắng ấm áp.',
  },
  mon: {
    name: 'Mon',
    title: 'Mèo Mon nghịch ngợm lí lắc',
    stealAlert: 'Ối! Chú mèo Mon vừa tinh nghịch vồ lấy một món trong giỏ của Duyên rồi chạy biến!',
    catchSuccess: 'Duyên đã nhẹ nhàng bắt kịp Mon và gãi tai chú! Mon vui vẻ trả lại món đồ nguyên vẹn.',
    returnNight: 'Sáng nay dậy, Duyên thấy Mon đã ngoan ngoãn đặt lại món đồ bị giấu ở bậc cửa.',
    idle: 'Mon đang ngọ nguậy chiếc đuôi, ngắm nghía mấy chú bướm bay lượn.',
  },
  may: {
    name: 'Mây',
    title: 'Mèo Mây trắng muốt bình yên',
    descPlaceholder: GAME_LORE_PLACEHOLDERS.mayUnconfirmedPersonality,
    sitQuiet: 'Mây ngồi yên lặng như một đám mây xốp trắng, đôi mắt tròn xoe ngắm nhìn khu vườn.',
    foundGift: 'Mây vừa để lại một chiếc hộp quà xinh xắn trên thảm cỏ cho Duyên!',
    claimedGift: 'Duyên mở quà của Mây: Nhận được cỏ mèo may mắn và tiền xu ấm áp!',
    alreadyClaimedToday: 'Mây đã tặng quà cho Duyên hôm nay rồi. Mây đang ngoan ngoãn cuộn tròn ngủ.',
  },
};

export const ONBOARDING_TUTORIAL_STEPS = [
  {
    title: 'Chào mừng Duyên đến với Nông Trại Yêu Thương!',
    body: 'Đây là món quà đặc biệt Khim tự tay xây dựng tặng riêng cho Duyên. Hãy cùng tận hưởng những ngày bình yên bên vườn rau và ba bạn mèo đáng yêu.',
  },
  {
    title: 'Cách di chuyển và quan sát',
    body: '• Nhấp chuột vào bất cứ đâu trên đảo để Duyên đi tới đó (hoặc dùng phím W-A-S-D).\n• Giữ chuột phải và kéo để xoay góc nhìn.\n• Cuộn chuột giữa để phóng to / thu nhỏ khung cảnh.',
  },
  {
    title: 'Trồng trọt và Thu hoạch',
    body: '1. Chọn Túi Hạt Giống ở thanh công cụ bên dưới rồi nhấp vào ô đất trống để gieo.\n2. Chọn Bình Tưới để tưới nước cho cây mỗi ngày.\n3. Khi cây chín mọng, nhấp vào cây để thu hoạch về giỏ đồ!',
  },
  {
    title: 'Bán hàng & Chăm sóc gia đình nhỏ',
    body: '• Đem nông sản đến Quầy Nông Sản ở góc đông nam để bán lấy tiền xu.\n• Nhấp vào anh Khim để trò chuyện hoặc tặng nông sản.\n• Ghé vuốt ve Mochi, rượt bắt đùa vui với Mon, và nhận quà bất ngờ từ bé Mây!',
  },
];
