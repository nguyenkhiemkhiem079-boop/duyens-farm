import type { FriendId } from './garden';

export interface MemoryPage {
  id: string;
  title: string;
  caption: string;
  icon: string;
  fiction: boolean;
  harvests: number;
  friend?: FriendId;
  coins?: number;
  paragraphs: string[];
}

// Only confirmed relationship facts from the author's prompt. No invented quotations.
export const MEMORIES: readonly MemoryPage[] = [
  {
    id: 'first-date', title: 'Một buổi hẹn, rất nhiều chuyện', caption: '01 · Quán cà phê sách',
    icon: '☕', fiction: false, harvests: 12,
    paragraphs: [
      'Buổi hẹn đầu của Khim và Duyên diễn ra tại một quán cà phê sách. Khim trông hơi xuề xòa, nhưng rõ ràng đã cố gắng chuẩn bị.',
      'Hai người trò chuyện về đủ thứ trên đời.',
      '[TODO: xác nhận tên quán cà phê sách và chi tiết buổi hẹn đầu]',
    ],
  },
  {
    id: 'together', title: 'Cùng nhau lớn lên', caption: '02 · Những ngày bên nhau',
    icon: '🌱', fiction: false, harvests: 24,
    paragraphs: [
      'Khim và Duyên đã cùng nhau trải qua niềm vui, nỗi buồn, những lần giận dỗi và cả những cuộc cãi vã.',
      'Duyên làm nghề tóc, Khim là kỹ sư BIM. Hai người là vợ chồng và yêu thương nhau.',
      '[TODO: xác nhận một kỷ niệm hai người đã cùng vượt qua]',
    ],
  },
  {
    id: 'three-cats', title: 'Nhà mình có ba bé mèo', caption: '03 · Mochi, Mon và Mây',
    icon: '🐾', fiction: false, harvests: 36,
    paragraphs: [
      'Mochi có bộ lông bò sữa và là bé được Duyên cưng nhất. Mon nghịch ngợm, hay ăn vụng, là bạn thân của Mochi. Mây có bộ lông trắng.',
      '[TODO: xác nhận một kỷ niệm của hai bạn với ba bé mèo]',
    ],
  },
  {
    id: 'our-home', title: 'Đủ chỗ cho yêu thương', caption: '04 · Ước mơ của hai đứa',
    icon: '🏡', fiction: false, harvests: 48,
    paragraphs: [
      'Ước mơ chung của Khim và Duyên là mua một căn nhà, đón ba mẹ từ quê lên sống cùng.',
      'Khu vườn trong game là cách tượng trưng cho việc cùng nhau vun vén ước mơ ấy. Đây không phải một sự kiện đã xảy ra ngoài đời.',
      '[TODO: lá thư Khim gửi Duyên]',
    ],
  },
];
