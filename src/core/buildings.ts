export type PlacedBuildingType =
  | 'windmill'
  | 'bakery'
  | 'juice_press'
  | 'gazebo'
  | 'lantern'
  | 'custom_plot'
  | 'salon_chair'
  | 'salon_building'
  | 'book_cafe';

export interface ProductionRecipe {
  id: string;
  nameVi: string;
  durationSeconds: number;
  input: Array<{ itemId: string; name: string; count: number }>;
  output: { itemId: string; name: string; count: number; value: number; description: string; emoji: string };
  description: string;
}

export interface BuildingDefinition {
  type: PlacedBuildingType;
  nameVi: string;
  descriptionVi: string;
  width: number; // cells in X (at rotation 0)
  depth: number; // cells in Z (at rotation 0)
  costCoins: number;
  buildDurationSeconds: number;
  category: 'production' | 'decoration' | 'farming';
  recipes?: ProductionRecipe[];
  iconEmoji: string;
}

export const BUILDING_DEFINITIONS: Record<PlacedBuildingType, BuildingDefinition> = {
  windmill: {
    type: 'windmill',
    nameVi: 'Cối Xay Gió Bình Yên',
    descriptionVi: 'Xay lúa mì thu hoạch thành bột mì thơm mịn để làm bánh.',
    width: 2,
    depth: 2,
    costCoins: 80,
    buildDurationSeconds: 10,
    category: 'production',
    iconEmoji: '🌀',
    recipes: [
      {
        id: 'flour_milling',
        nameVi: 'Xay Bột Mì Tươi',
        durationSeconds: 12,
        input: [{ itemId: 'crop_wheat', name: 'Lúa mì vàng', count: 2 }],
        output: {
          itemId: 'product_flour',
          name: 'Bao Bột Mì Trắng',
          count: 1,
          value: 55,
          description: 'Bột mì mịn màng thơm phức từ lúa mì tự trồng trên nông trại.',
          emoji: '🌾',
        },
        description: 'Dùng 2 bó lúa mì để xay ra 1 bao bột mì thơm ngon.',
      },
    ],
  },

  bakery: {
    type: 'bakery',
    nameVi: 'Lò Nướng Bánh Mộc',
    descriptionVi: 'Nướng những mẻ bánh mì cà rốt giòn rụm và bánh cà chua thơm lừng.',
    width: 2,
    depth: 2,
    costCoins: 120,
    buildDurationSeconds: 12,
    category: 'production',
    iconEmoji: '🥖',
    recipes: [
      {
        id: 'carrot_bread',
        nameVi: 'Bánh Mì Cà Rốt Giòn',
        durationSeconds: 15,
        input: [
          { itemId: 'product_flour', name: 'Bao Bột Mì', count: 1 },
          { itemId: 'crop_carrot', name: 'Cà rốt giòn ngọt', count: 1 },
        ],
        output: {
          itemId: 'product_carrot_bread',
          name: 'Bánh Mì Cà Rốt Nóng Hổi',
          count: 1,
          value: 90,
          description: 'Chiếc bánh mì vỏ vàng ruộm, ruột cam ngọt tự nhiên từ cà rốt.',
          emoji: '🥕🥖',
        },
        description: 'Kết hợp bột mì và cà rốt tươi ngon nướng chín vàng.',
      },
      {
        id: 'tomato_pie',
        nameVi: 'Bánh Tart Cà Chua Phô Mai',
        durationSeconds: 18,
        input: [
          { itemId: 'product_flour', name: 'Bao Bột Mì', count: 1 },
          { itemId: 'crop_tomato', name: 'Cà chua mọng nước', count: 2 },
        ],
        output: {
          itemId: 'product_tomato_pie',
          name: 'Bánh Tart Cà Chua Nướng',
          count: 1,
          value: 125,
          description: 'Bánh nướng ngập tràn vị chua ngọt thơm lừng đậm đà.',
          emoji: '🍅🥧',
        },
        description: 'Kết hợp bột mì và cà chua nướng giòn rụm.',
      },
    ],
  },

  juice_press: {
    type: 'juice_press',
    nameVi: 'Máy Ép Nước Quả & Mứt',
    descriptionVi: 'Ép các loại củ quả tươi thành những chai nước giải khát thanh mát.',
    width: 2,
    depth: 1,
    costCoins: 70,
    buildDurationSeconds: 8,
    category: 'production',
    iconEmoji: '🧃',
    recipes: [
      {
        id: 'carrot_juice',
        nameVi: 'Nước Ép Cà Rốt Nguyên Chất',
        durationSeconds: 10,
        input: [{ itemId: 'crop_carrot', name: 'Cà rốt giòn', count: 2 }],
        output: {
          itemId: 'product_carrot_juice',
          name: 'Chai Nước Ép Cà Rốt',
          count: 1,
          value: 48,
          description: 'Nước ép giàu vitamin, ngọt lành mát lịm.',
          emoji: '🥕🥤',
        },
        description: 'Ép 2 củ cà rốt tươi thành chai nước ép thơm mát.',
      },
      {
        id: 'tomato_sauce',
        nameVi: 'Sốt Cà Chua Đặc Biệt',
        durationSeconds: 10,
        input: [{ itemId: 'crop_tomato', name: 'Cà chua đỏ', count: 2 }],
        output: {
          itemId: 'product_tomato_sauce',
          name: 'Hũ Sốt Cà Chua Nấu Kỹ',
          count: 1,
          value: 70,
          description: 'Hũ sốt cà chua đậm đà cho những bữa cơm ấm cúng.',
          emoji: '🍅🥫',
        },
        description: 'Nấu cô đặc 2 quả cà chua thành hũ sốt thơm ngon.',
      },
    ],
  },

  gazebo: {
    type: 'gazebo',
    nameVi: 'Chòi Nghỉ Mát Hoa Hồng',
    descriptionVi: 'Góc nghỉ chân ngắm hoa thơ mộng do Khim tính toán góc đón nắng lý tưởng.',
    width: 2,
    depth: 2,
    costCoins: 50,
    buildDurationSeconds: 6,
    category: 'decoration',
    iconEmoji: '🏡',
  },

  lantern: {
    type: 'lantern',
    nameVi: 'Đèn Lồng Gỗ Ấm Cúng',
    descriptionVi: 'Cây đèn lồng gỗ thắp sáng ban đêm với ánh vàng dịu dàng.',
    width: 1,
    depth: 1,
    costCoins: 25,
    buildDurationSeconds: 3,
    category: 'decoration',
    iconEmoji: '🏮',
  },

  custom_plot: {
    type: 'custom_plot',
    nameVi: 'Luống Đất Mới Khai Hoang',
    descriptionVi: 'Mở rộng thêm một ô đất để Duyên thỏa sức gieo trồng thêm nhiều loại rau củ.',
    width: 1,
    depth: 1,
    costCoins: 20,
    buildDurationSeconds: 2,
    category: 'farming',
    iconEmoji: '🌱',
  },

  salon_chair: {
    type: 'salon_chair',
    nameVi: 'Ghế Làm Tóc Ngoài Trời',
    descriptionVi: 'Chiếc ghế đệm êm ái cùng gương gỗ để Duyên trổ tài làm đẹp cho dân làng và anh Khim.',
    width: 1,
    depth: 1,
    costCoins: 0,
    buildDurationSeconds: 1,
    category: 'production',
    iconEmoji: '🪑',
  },

  salon_building: {
    type: 'salon_building',
    nameVi: 'Tiệm Tóc Của Duyên [TODO: tên tiệm tóc của Duyên]',
    descriptionVi: 'Ngôi nhà tiệm tóc màu pastel xinh xắn với gương lớn, bồn gội thư giãn và kệ tinh dầu thơm mát.',
    width: 2,
    depth: 2,
    costCoins: 150,
    buildDurationSeconds: 15,
    category: 'production',
    iconEmoji: '✂️',
  },

  book_cafe: {
    type: 'book_cafe',
    nameVi: 'Quán Cà Phê Sách [TODO: tên quán cà phê sách]',
    descriptionVi: 'Góc cà phê sách thơ mộng gợi nhắc kỷ niệm buổi hẹn đầu tiên ngọt ngào của Duyên & Khim.',
    width: 2,
    depth: 2,
    costCoins: 160,
    buildDurationSeconds: 15,
    category: 'decoration',
    iconEmoji: '📚',
  },
};

export interface PlacedBuildingInstance {
  instanceId: string;
  type: PlacedBuildingType;
  originX: number; // grid X (min)
  originZ: number; // grid Z (min)
  rotationDeg: 0 | 90 | 180 | 270;
  isConstructed: boolean;
  constructionProgress: number; // 0 to 1
  activeRecipeId?: string;
  finishedRecipeId?: string;
  productionProgress?: number; // 0 to 1
  finishedProductCount?: number;
  plantedAtDay: number;
}
