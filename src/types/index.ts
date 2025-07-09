// 메뉴 아이템 타입
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
}

// 카테고리 타입
export interface Category {
  id: string;
  name: string;
  order: number;
}

// 장바구니 아이템 타입
export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
}

// 주문 타입
export interface Order {
  id: string;
  items: CartItem[];
  totalAmount: number;
  orderTime: Date;
  status: "pending" | "preparing" | "ready" | "completed";
  paymentMethod: "card" | "cash" | "digital";
}

// 키오스크 모드 타입
export type KioskMode = "customer" | "admin";

// 음성 인식 관련 타입
export interface VoiceCommand {
  intent: "add_item" | "remove_item" | "show_menu" | "checkout" | "help";
  entity?: string;
  quantity?: number;
  confidence?: number;
}

// 앱 상태 타입
export interface AppState {
  mode: KioskMode;
  categories: Category[];
  menuItems: MenuItem[];
  cart: CartItem[];
  currentOrder: Order | null;
  isVoiceMode: boolean;
}
