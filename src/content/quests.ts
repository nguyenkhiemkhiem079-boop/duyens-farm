export interface QuestObjective {
  id: string;
  descriptionVi: string;
  current: number;
  target: number;
  completed: boolean;
}

export interface QuestDefinition {
  fiction: boolean; // True for invented game-world scenes, never a real memory.
  id: string;
  titleVi: string;
  chapterNumber?: number;
  category: 'story' | 'mystery' | 'villager';
  descriptionVi: string;
  objectives: QuestObjective[];
  rewardCoins: number;
  rewardRelationship: number;
  journalPageIdToUnlock?: string;
  buildingTypeToUnlock?: string;
  isUnlocked: boolean;
  isCompleted: boolean;
}

export const INITIAL_QUESTS: Record<string, QuestDefinition> = {
  chapter_1: {
    id: 'chapter_1',
    fiction: false,
    chapterNumber: 1,
    titleVi: 'Chương 1: Quán Cà Phê Sách Ngày Đầu Gặp Gỡ',
    category: 'story',
    descriptionVi:
      'Lần giở lại trang hồi ức dịu dàng: Ngày đầu tiên Khim và Duyên hẹn hò tại quán cà phê sách [TODO: tên quán cà phê sách]. Khim trông hơi xuề xòa nhưng đã cố gắng chuẩn bị; hai người trò chuyện về đủ thứ trên đời. [TODO: xác nhận chi tiết buổi hẹn đầu]',
    objectives: [
      {
        id: 'obj_ch1_flashback',
        descriptionVi: 'Trải nghiệm hồi ức buổi hẹn đầu tiên cùng anh Khim',
        current: 0,
        target: 1,
        completed: false,
      },
    ],
    rewardCoins: 80,
    rewardRelationship: 25,
    journalPageIdToUnlock: 'page_chapter_1',
    buildingTypeToUnlock: 'book_cafe',
    isUnlocked: true,
    isCompleted: false,
  },

  chapter_2: {
    id: 'chapter_2',
    fiction: true,
    chapterNumber: 2,
    titleVi: 'Chương 2: Yêu Nhau & Vun Vén Tổ Ấm',
    category: 'story',
    descriptionVi:
      'Cùng nhau chăm sóc khu vườn xanh, ngắm nhìn ba chú mèo Mochi, Mon, Mây nô đùa và chế biến những mẻ nông sản thơm ngon đầu tiên.',
    objectives: [
      {
        id: 'obj_ch2_harvest',
        descriptionVi: 'Thu hoạch 3 loại rau củ bất kỳ cùng nhau',
        current: 0,
        target: 3,
        completed: false,
      },
      {
        id: 'obj_ch2_pet_cats',
        descriptionVi: 'Dành tình cảm vuốt ve bạn mèo Mochi',
        current: 0,
        target: 1,
        completed: false,
      },
      {
        id: 'obj_ch2_chat_khim',
        descriptionVi: 'Trò chuyện tâm sự cùng anh Khim',
        current: 0,
        target: 1,
        completed: false,
      },
    ],
    rewardCoins: 120,
    rewardRelationship: 30,
    journalPageIdToUnlock: 'page_chapter_2',
    isUnlocked: false, // Unlocked after Chapter 1
    isCompleted: false,
  },

  cat_mystery_mon: {
    id: 'cat_mystery_mon',
    fiction: true,
    titleVi: 'Vụ Án: Mèo Mon Ăn Vụng Chiếc Bánh Mì',
    category: 'mystery',
    descriptionVi:
      'Một chiếc bánh mì cà rốt vừa nướng thơm phức bỗng nhiên không cánh mà bay! Hãy tìm kiếm các manh mối trên đảo để tìm ra thủ phạm đáng yêu.',
    objectives: [
      {
        id: 'obj_clue_crumbs',
        descriptionVi: 'Kiểm tra vệt vụn bánh mì rơi vãi gần bậc thềm nhà',
        current: 0,
        target: 1,
        completed: false,
      },
      {
        id: 'obj_clue_pawprints',
        descriptionVi: 'Lần theo dấu chân mèo lấm bùn hướng về bãi cỏ',
        current: 0,
        target: 1,
        completed: false,
      },
      {
        id: 'obj_talk_mochi',
        descriptionVi: 'Hỏi thăm Mochi xem có thấy em Mon ở đâu không',
        current: 0,
        target: 1,
        completed: false,
      },
      {
        id: 'obj_catch_mon',
        descriptionVi: 'Tìm thấy Mon đang trốn và chọn lời tha thứ ấm áp',
        current: 0,
        target: 1,
        completed: false,
      },
    ],
    rewardCoins: 60,
    rewardRelationship: 15,
    journalPageIdToUnlock: 'page_mon_mystery',
    isUnlocked: true,
    isCompleted: false,
  },

  quest_lan_new_look: {
    id: 'quest_lan_new_look',
    fiction: true,
    titleVi: 'Nụ Cười Tự Tin Của Lan',
    category: 'villager',
    descriptionVi:
      'Bạn Lan đang rất bối rối trước buổi phỏng vấn. Hãy dùng ghế làm tóc chăm chút mái tóc mới thật đẹp cho Lan nhé!',
    objectives: [
      {
        id: 'obj_serve_lan',
        descriptionVi: 'Phục vụ tạo kiểu tóc cho bạn Lan tại ghế làm tóc',
        current: 0,
        target: 1,
        completed: false,
      },
    ],
    rewardCoins: 50,
    rewardRelationship: 15,
    journalPageIdToUnlock: 'page_salon_open',
    buildingTypeToUnlock: 'salon_building',
    isUnlocked: true,
    isCompleted: false,
  },
};
