export interface StoryDialogueNode {
  speaker: string;
  avatar: string;
  textVi: string;
  choices?: Array<{ textVi: string; outcomeVi?: string }>;
}

export interface StoryChapterData {
  fiction: boolean; // True for invented game-world scenes, never a real memory.
  id: string;
  chapterNumber: number;
  titleVi: string;
  subtitleVi: string;
  descriptionVi: string;
  dialogueSequence: StoryDialogueNode[];
  rewardCoins: number;
  rewardRelationship: number;
  journalPageId: string;
  unlockRequirementVi: string;
}

export const STORY_CHAPTERS: Record<string, StoryChapterData> = {
  chapter_1: {
    id: 'chapter_1',
    fiction: false,
    chapterNumber: 1,
    titleVi: 'Chương 1: Quán Cà Phê Sách Ngày Đầu Gặp Gỡ',
    subtitleVi: 'Hồi ức buổi hẹn hò đầu tiên ngọt ngào',
    descriptionVi:
      'Lần giở lại trang hồi ức dịu dàng: Ngày đầu tiên Khim và Duyên hẹn hò tại quán cà phê sách [TODO: tên quán cà phê sách].',
    unlockRequirementVi: 'Có sẵn từ đầu trò chơi dưới dạng hồi ức kỷ niệm.',
    dialogueSequence: [
      {
        speaker: 'Kỷ niệm đã xác nhận',
        avatar: '☕',
        textVi: 'Buổi hẹn đầu của Khim và Duyên ở một quán cà phê sách [TODO: xác nhận tên quán cà phê sách]. Khim trông hơi xuề xòa nhưng rõ ràng đã cố gắng chuẩn bị.',
      },
      {
        speaker: 'Kỷ niệm đã xác nhận',
        avatar: '💬',
        textVi: 'Hai người đã trò chuyện về đủ thứ trên đời. [TODO: xác nhận chi tiết buổi hẹn đầu]',
      },
    ],
    rewardCoins: 80,
    rewardRelationship: 25,
    journalPageId: 'page_chapter_1',
  },

  chapter_2: {
    id: 'chapter_2',
    fiction: true,
    chapterNumber: 2,
    titleVi: 'Chương 2: Yêu Nhau & Vun Vén Tổ Ấm',
    subtitleVi: 'Những ngày tháng bình yên bên vườn rau và ba bạn mèo',
    descriptionVi:
      'Cùng nhau chăm sóc khu vườn xanh, ngắm nhìn ba chú mèo Mochi, Mon, Mây nô đùa và chế biến những mẻ nông sản đầu tiên.',
    unlockRequirementVi: 'Hoàn thành Chương 1 và thu hoạch ít nhất 3 nông sản.',
    dialogueSequence: [
      {
        speaker: 'Khim',
        avatar: '👓',
        textVi: 'Duyên nhìn xem, cối xay gió anh thiết kế đang quay đều theo chiều gió kìa. Tiếng lúa mì xay rào rào nghe vui tai ghê!',
      },
      {
        speaker: 'Duyên',
        avatar: '🌸',
        textVi: 'Nhờ có anh phụ giúp bưng nước tưới cây mà luống cà rốt với lúa mì mới bội thu thế này đấy.',
      },
      {
        speaker: 'Khim',
        avatar: '👓',
        textVi: 'Nhìn Mochi lon ton bám theo chân Duyên, còn Mon thì rình rình trộm củ cải... cảm giác ngôi nhà nhỏ lúc nào cũng rộn rã tiếng cười.',
        choices: [
          { textVi: 'Mỗi ngày trôi qua bên anh và các bé mèo đều là một ngày hạnh phúc trọn vẹn.', outcomeVi: 'Khim nắm tay Duyên thật chặt.' },
          { textVi: 'Tối nay mình cùng nướng bánh mì cà rốt thưởng thức nhé anh!', outcomeVi: 'Khim cười tươi rạng rỡ.' },
        ],
      },
    ],
    rewardCoins: 120,
    rewardRelationship: 30,
    journalPageId: 'page_chapter_2',
  },

  chapter_3: {
    id: 'chapter_3',
    fiction: true,
    chapterNumber: 3,
    titleVi: 'Chương 3: Cơn Giông Bão & Sự Đồng Lòng',
    subtitleVi: 'Cùng nhau vượt qua thử thách thiên nhiên',
    descriptionVi:
      'Một cơn giông bất chợt ghé thăm đảo. Khim và Duyên cùng nhau sửa lại hàng rào và che chở cho luống rau xanh.',
    unlockRequirementVi: 'Hoàn thành Chương 2 và đạt Giai đoạn 2 của Ngôi Nhà Mơ Ước.',
    dialogueSequence: [
      {
        speaker: 'Khim',
        avatar: '👓',
        textVi: 'Gió giông lớn quá! Hàng rào góc đông nam bị bật một chốt gỗ rồi. Duyên ở trong hiên tránh mưa nhé, để anh ra đóng cọc lại!',
        choices: [
          { textVi: 'Không được, anh dầm mưa một mình sẽ cảm lạnh mất! Em mang áo mưa ra phụ anh giữ cọc!', outcomeVi: 'Hai vợ chồng cùng đội mưa giữ vững hàng rào.' },
          { textVi: 'Em gom ba bạn mèo vào chỗ ấm rồi bưng hộp dụng cụ ra phụ anh ngay đây!', outcomeVi: 'Sự phối hợp nhịp nhàng giúp công việc hoàn thành nhanh chóng.' },
        ],
      },
      {
        speaker: 'Duyên',
        avatar: '🌸',
        textVi: 'Được rồi! Hàng rào đã đóng chặt lại, cây cối cũng được che chắn an toàn rồi anh ơi.',
      },
      {
        speaker: 'Khim',
        avatar: '👓',
        textVi: 'Mưa tạnh rồi kìa... Cầu vồng hiện lên trên mặt hồ đẹp quá Duyên ơi. Có Duyên đồng hành bên cạnh, giông bão nào anh cũng không sợ nữa.',
      },
    ],
    rewardCoins: 150,
    rewardRelationship: 35,
    journalPageId: 'page_chapter_3',
  },

  chapter_4: {
    id: 'chapter_4',
    fiction: true,
    chapterNumber: 4,
    titleVi: 'Chương 4: Mái Nhà Chung Đong Đầy Hạnh Phúc',
    subtitleVi: 'Ngôi nhà hoàn thành & Bữa cơm sum họp gia đình',
    descriptionVi:
      'Ngôi Nhà Mơ Ước đã hoàn thành trọn vẹn. Ba mẹ hai bên ghé thăm nông trại, cả nhà cùng quây quần bên mâm cơm ấm cúng.',
    unlockRequirementVi: 'Hoàn thành toàn bộ 5 giai đoạn của Ngôi Nhà Mơ Ước.',
    dialogueSequence: [
      {
        speaker: 'Khim',
        avatar: '👓',
        textVi: 'Duyên ơi! Ba mẹ hai bên vừa cập bến phà rồi! Ngôi nhà mơ ước của chúng mình... cuối cùng cũng đã trọn vẹn từng viên ngói, từng góc bếp.',
      },
      {
        speaker: 'Ba Mẹ',
        avatar: '🏡',
        textVi: '[TODO: xác nhận lời ba mẹ trong Chương 4]',
      },
      {
        speaker: 'Duyên',
        avatar: '🌸',
        textVi: 'Mâm cơm nóng hổi với bánh mì tự nướng và rau củ tươi trong vườn đã sẵn sàng rồi. Con mời ba mẹ dùng cơm ạ!',
      },
      {
        speaker: 'Khim',
        avatar: '👓',
        textVi: 'Duyên à... anh có viết một bức thư tay đặc biệt gửi riêng cho Duyên... [TODO: lá thư Khim gửi Duyên]',
        choices: [
          { textVi: 'Em sẽ cất giữ bức thư này ở nơi trang trọng nhất trong cuốn nhật ký.', outcomeVi: 'Trang nhật ký cuối cùng được mở khóa với vô vàn yêu thương.' },
        ],
      },
    ],
    rewardCoins: 200,
    rewardRelationship: 50,
    journalPageId: 'page_chapter_4',
  },
};
