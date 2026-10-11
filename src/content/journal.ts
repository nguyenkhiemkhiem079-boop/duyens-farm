export interface JournalPage {
  fiction: boolean; // True for invented game-world scenes, never a real memory.
  id: string;
  titleVi: string;
  dateTag: string;
  iconEmoji: string;
  storyVi: string;
  quoteVi: string;
  unlocked: boolean;
  unlockedHintVi: string;
}

export const INITIAL_JOURNAL_PAGES: JournalPage[] = [
  {
    id: 'page_farm_begin',
    fiction: true,
    titleVi: 'Hòn Đảo Bình Yên Của Hai Đứa',
    dateTag: 'Khởi đầu',
    iconEmoji: '🏡',
    storyVi:
      'Khim đã bí mật thiết kế một mô hình 3D hoàn chỉnh, đo đạc từng góc đón nắng, tính toán từng luống hoa rồi dựng nên hòn đảo nông trại ấm cúng này để tặng Duyên. Ba chú mèo Mochi, Mon và Mây cũng có riêng những góc nằm sưởi nắng êm đềm.',
    quoteVi: '“Hạnh phúc đôi khi chỉ giản dị như một sớm mai cùng nhau ra vườn đón gió trong veo.”',
    unlocked: true,
    unlockedHintVi: 'Tự động mở khóa khi đặt chân lên hòn đảo.',
  },
  {
    id: 'page_chapter_1',
    fiction: false,
    titleVi: 'Buổi Hẹn Đầu Tiên Tại Quán Cà Phê Sách',
    dateTag: 'Kỷ niệm Chương 1',
    iconEmoji: '☕',
    storyVi:
      'Buổi hẹn đầu diễn ra tại quán cà phê sách [TODO: xác nhận tên quán cà phê sách]. Khim trông hơi xuề xòa nhưng rõ ràng đã cố gắng chuẩn bị. Khim và Duyên trò chuyện về đủ thứ trên đời. [TODO: xác nhận chi tiết buổi hẹn đầu]',
    quoteVi: '[TODO: xác nhận lời nhắn cho trang kỷ niệm buổi hẹn đầu]',
    unlocked: false,
    unlockedHintVi: 'Hoàn thành hồi ức Chương 1 — Quán cà phê sách.',
  },
  {
    id: 'page_chapter_2',
    fiction: true,
    titleVi: 'Cùng Nhau Chăm Sóc Khu Vườn',
    dateTag: 'Kỷ niệm Chương 2',
    iconEmoji: '🌱',
    storyVi:
      'Những ngày tháng yêu nhau đẹp như bản vẽ hoàn mỹ. Duyên gieo từng hạt mầm xanh, Khim mang nước tưới và tính toán kết cấu cối xay gió, còn ba chú mèo thì chạy lăng xăng quanh chân. Từng góc nhỏ trên nông trại đều thấm đẫm tình yêu thương và sự đồng hành bền bỉ.',
    quoteVi: '“Khu vườn đẹp nhất không phải vì đất đai màu mỡ, mà vì luôn có người cùng ta vun vén mỗi ngày.”',
    unlocked: false,
    unlockedHintVi: 'Hoàn thành Chương 2 — Yêu nhau.',
  },
  {
    id: 'page_mon_mystery',
    fiction: true,
    titleVi: 'Vụ Án Chiếc Bánh Mì Bị Giấu Của Mon',
    dateTag: 'Chuyện về ba chú mèo',
    iconEmoji: '🐱',
    storyVi:
      'Chiếc bánh mì cà rốt thơm phức vừa nướng xong bỗng dưng biến mất! Theo dấu những vụn bánh vàng ruộm và vết chân mèo xinh xắn, Duyên đã bắt quả tang Mon đang nằm cuộn tròn bên góc tường, còn Mochi thì đứng chắn trước mặt như muốn biện hộ giúp em. Ai mà nỡ phạt một chú mèo đáng yêu như thế cơ chứ!',
    quoteVi: '“Những trò nghịch ngợm ngốc nghếch của Mon làm căn nhà lúc nào cũng rộn vang tiếng cười.”',
    unlocked: false,
    unlockedHintVi: 'Giải quyết vụ án Mon ăn vụng cùng các manh mối trên đảo.',
  },
  {
    id: 'page_salon_open',
    fiction: true,
    titleVi: 'Tiệm Tóc Của Duyên — Nụ Cười Rạng Rỡ',
    dateTag: 'Ước mơ của Duyên',
    iconEmoji: '✂️',
    storyVi:
      'Dưới bàn tay khéo léo của Duyên, chiếc ghế làm tóc ngoài trời đã mang lại niềm vui và sự tự tin mới cho bao người hàng xóm. Từ bạn Lan rụt rè đến cô Hoa hay cười, ai bước ra khỏi tiệm tóc [TODO: tên tiệm tóc của Duyên] cũng đều ánh lên nụ cười rạng rỡ và ánh mắt lấp lánh yêu đời.',
    quoteVi: '“Làm đẹp cho mái tóc cũng là gieo thêm niềm vui và sự tự tin vào cuộc đời người khác.”',
    unlocked: false,
    unlockedHintVi: 'Phục vụ khách hàng tại ghế làm tóc của Duyên.',
  },
  {
    id: 'page_final_letter_locked',
    fiction: false,
    titleVi: '[TODO: Bức Thư Tình Cuối Cùng Của Khim]',
    dateTag: 'Gửi Duyên',
    iconEmoji: '💖',
    storyVi:
      '[TODO: Bức thư tay chân thành cuối cùng Khim viết riêng cho Duyên ghi lại trọn vẹn hành trình yêu thương và lời hứa bên nhau trọn đời.]',
    quoteVi: '[TODO: xác nhận lời nhắn trong thư cuối của Khim]',
    unlocked: false,
    unlockedHintVi: 'Mở khóa khi đạt cấp độ thân thiết và mở rộng toàn bộ nông trại.',
  },
];
