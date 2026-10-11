export interface DeliveryOrderItem {
  itemId: string;
  name: string;
  count: number;
  emoji: string;
}

export interface DeliveryOrder {
  id: string;
  customerName: string;
  customerTitle: string;
  customerAvatar: string;
  dialogueVi: string;
  items: DeliveryOrderItem[];
  rewardCoins: number;
  rewardRelationship: number;
  rewardEnergy: number;
  isFulfilled: boolean;
  dayCreated: number;
}

export const POSSIBLE_CUSTOMERS = [
  {
    name: 'Bác Ba Thợ Mộc',
    title: 'Thợ lành nghề thôn quê',
    avatar: '🪵',
    dialogue: 'Dạo này xẻ gỗ bận rộn quá, bác cần ít củ quả tươi tẩm bổ sức lực!',
  },
  {
    name: 'Dì Năm Bếp Trưởng',
    title: 'Chủ tiệm bánh mì thơm',
    avatar: '👩‍🍳',
    dialogue: 'Bột mì và nông sản từ nông trại của Duyên luôn làm ra những mẻ bánh ngon nhất!',
  },
  {
    name: 'Anh Khim Yêu Dấu',
    title: 'Kỹ sư BIM kiêm bạn đời',
    avatar: '👓',
    dialogue: 'Anh mang đơn hàng này bồi dưỡng cho cả đội thiết kế nhé, ai cũng khen Duyên khéo tay!',
  },
  {
    name: 'Hội Mèo Mochi & Mon',
    title: 'Khách hàng VIP 4 chân',
    avatar: '🐾',
    dialogue: 'Meo meo! Tụi em gom được ít xu đổi lấy cà rốt ngọt và bánh nướng thơm lừng đây!',
  },
  {
    name: 'Quán Nước Cây Đa',
    title: 'Quán nước giải khát đầu làng',
    avatar: '🧃',
    dialogue: 'Trời nắng chang chang, khách ghé quán ai cũng thèm nước ép tươi ngon từ nông trại.',
  },
];

export function generateDeliveryOrder(day: number, idSuffix: number): DeliveryOrder {
  const customer = POSSIBLE_CUSTOMERS[Math.floor(Math.random() * POSSIBLE_CUSTOMERS.length)];

  // Pools of potential items
  const pools = [
    { itemId: 'crop_carrot', name: 'Cà rốt giòn ngọt', emoji: '🥕', min: 2, max: 4, coinVal: 18 },
    { itemId: 'crop_wheat', name: 'Lúa mì vàng', emoji: '🌾', min: 2, max: 4, coinVal: 22 },
    { itemId: 'crop_tomato', name: 'Cà chua chín mọng', emoji: '🍅', min: 2, max: 4, coinVal: 30 },
    { itemId: 'product_flour', name: 'Bột mì trắng', emoji: '🌾', min: 1, max: 2, coinVal: 65 },
    { itemId: 'product_carrot_bread', name: 'Bánh mì cà rốt', emoji: '🥖', min: 1, max: 2, coinVal: 110 },
    { itemId: 'product_carrot_juice', name: 'Chai nước ép cà rốt', emoji: '🧃', min: 1, max: 2, coinVal: 60 },
  ];

  // Pick 1 to 2 random item types
  const countTypes = Math.random() < 0.6 ? 1 : 2;
  const pickedPools = [...pools].sort(() => Math.random() - 0.5).slice(0, countTypes);

  const items: DeliveryOrderItem[] = [];
  let totalCoins = 0;

  pickedPools.forEach(pool => {
    const qty = Math.floor(Math.random() * (pool.max - pool.min + 1)) + pool.min;
    items.push({
      itemId: pool.itemId,
      name: pool.name,
      count: qty,
      emoji: pool.emoji,
    });
    totalCoins += qty * pool.coinVal;
  });

  // 25% bonus for order fulfillment
  totalCoins = Math.round(totalCoins * 1.25);

  return {
    id: `order_${day}_${idSuffix}_${Date.now() % 10000}`,
    customerName: customer.name,
    customerTitle: customer.title,
    customerAvatar: customer.avatar,
    dialogueVi: customer.dialogue,
    items,
    rewardCoins: totalCoins,
    rewardRelationship: 10,
    rewardEnergy: 15,
    isFulfilled: false,
    dayCreated: day,
  };
}
