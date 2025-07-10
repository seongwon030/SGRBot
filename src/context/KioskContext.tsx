import React, { createContext, useContext, useReducer, ReactNode } from "react";
import {
  AppState,
  KioskMode,
  MenuItem,
  Category,
  CartItem,
  Order,
} from "../types";

// 액션 타입 정의
type Action =
  | { type: "SET_MODE"; payload: KioskMode }
  | { type: "ADD_MENU_ITEM"; payload: MenuItem }
  | { type: "UPDATE_MENU_ITEM"; payload: MenuItem }
  | { type: "DELETE_MENU_ITEM"; payload: string }
  | { type: "ADD_CATEGORY"; payload: Category }
  | { type: "UPDATE_CATEGORY"; payload: Category }
  | { type: "DELETE_CATEGORY"; payload: string }
  | { type: "ADD_TO_CART"; payload: { menuItem: MenuItem; quantity: number } }
  | { type: "REMOVE_FROM_CART"; payload: string }
  | {
      type: "UPDATE_CART_ITEM";
      payload: { menuItemId: string; quantity: number };
    }
  | { type: "CLEAR_CART" }
  | { type: "SET_VOICE_MODE"; payload: boolean }
  | { type: "CREATE_ORDER"; payload: Order }
  | { type: "CLEAR_ORDER" };

// 초기 상태
const initialState: AppState = {
  mode: "customer",
  categories: [
    { id: "1", name: "메인 메뉴", order: 1 },
    { id: "2", name: "사이드 메뉴", order: 2 },
    { id: "3", name: "음료", order: 3 },
    { id: "4", name: "디저트", order: 4 },
  ],
  menuItems: [
    {
      id: "1",
      name: "치킨버거",
      name_en: "Chicken Burger",
      description: "바삭한 치킨 패티와 신선한 야채가 들어간 버거",
      price: 8500,
      category: "1",
      available: true,
      image: "/chicken.png",
    },
    {
      id: "2",
      name: "비프버거",
      name_en: "Beef Burger",
      description: "100% 순쇠고기 패티로 만든 클래식 버거",
      price: 9500,
      category: "1",
      available: true,
      image: "/beef.png",
    },
    {
      id: "3",
      name: "감자튀김",
      name_en: "French Fries",
      description: "바삭하고 고소한 감자튀김",
      price: 3500,
      category: "2",
      available: true,
      image: "/potato.png",
    },
    {
      id: "4",
      name: "콜라",
      name_en: "Cola",
      description: "시원한 탄산음료",
      price: 2000,
      category: "3",
      available: true,
      image: "/cola.png",
    },
  ],
  cart: [],
  currentOrder: null,
  isVoiceMode: false,
};

// 리듀서 함수
const kioskReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case "SET_MODE":
      return { ...state, mode: action.payload };

    case "ADD_MENU_ITEM":
      return {
        ...state,
        menuItems: [...state.menuItems, action.payload],
      };

    case "UPDATE_MENU_ITEM":
      return {
        ...state,
        menuItems: state.menuItems.map((item) =>
          item.id === action.payload.id ? action.payload : item
        ),
      };

    case "DELETE_MENU_ITEM":
      return {
        ...state,
        menuItems: state.menuItems.filter((item) => item.id !== action.payload),
      };

    case "ADD_CATEGORY":
      return {
        ...state,
        categories: [...state.categories, action.payload],
      };

    case "UPDATE_CATEGORY":
      return {
        ...state,
        categories: state.categories.map((cat) =>
          cat.id === action.payload.id ? action.payload : cat
        ),
      };

    case "DELETE_CATEGORY":
      return {
        ...state,
        categories: state.categories.filter((cat) => cat.id !== action.payload),
        menuItems: state.menuItems.filter(
          (item) => item.category !== action.payload
        ),
      };

    case "ADD_TO_CART":
      const existingItemIndex = state.cart.findIndex(
        (item) => item.menuItem.id === action.payload.menuItem.id
      );

      if (existingItemIndex >= 0) {
        const updatedCart = [...state.cart];
        updatedCart[existingItemIndex].quantity += action.payload.quantity;
        return { ...state, cart: updatedCart };
      } else {
        return {
          ...state,
          cart: [
            ...state.cart,
            {
              menuItem: action.payload.menuItem,
              quantity: action.payload.quantity,
            },
          ],
        };
      }

    case "REMOVE_FROM_CART":
      return {
        ...state,
        cart: state.cart.filter((item) => item.menuItem.id !== action.payload),
      };

    case "UPDATE_CART_ITEM":
      return {
        ...state,
        cart: state.cart
          .map((item) =>
            item.menuItem.id === action.payload.menuItemId
              ? { ...item, quantity: action.payload.quantity }
              : item
          )
          .filter((item) => item.quantity > 0),
      };

    case "CLEAR_CART":
      return { ...state, cart: [] };

    case "SET_VOICE_MODE":
      return { ...state, isVoiceMode: action.payload };

    case "CREATE_ORDER":
      return { ...state, currentOrder: action.payload, cart: [] };

    case "CLEAR_ORDER":
      return { ...state, currentOrder: null };

    default:
      return state;
  }
};

// Context 생성
const KioskContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

// localStorage 키
const STORAGE_KEY = "kiosk-system-data";

// localStorage에서 초기 상태 로드
const loadInitialState = (): AppState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsedState = JSON.parse(saved);
      // 기본값과 병합하여 누락된 필드 방지
      return {
        ...initialState,
        ...parsedState,
        // 현재 세션 상태는 초기화
        mode: "customer",
        cart: [],
        currentOrder: null,
        isVoiceMode: false,
      };
    }
  } catch (error) {
    console.warn("저장된 데이터를 불러오는데 실패했습니다:", error);
  }
  return initialState;
};

// localStorage에 상태 저장
const saveState = (state: AppState) => {
  try {
    // 메뉴와 카테고리만 저장 (세션 데이터는 제외)
    const dataToSave = {
      categories: state.categories,
      menuItems: state.menuItems,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  } catch (error) {
    console.warn("데이터 저장에 실패했습니다:", error);
  }
};

// Provider 컴포넌트
export const KioskProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(kioskReducer, loadInitialState());

  // 상태 변경 시 localStorage에 저장
  React.useEffect(() => {
    saveState(state);
  }, [state.menuItems, state.categories]);

  return (
    <KioskContext.Provider value={{ state, dispatch }}>
      {children}
    </KioskContext.Provider>
  );
};

// Custom Hook
export const useKiosk = () => {
  const context = useContext(KioskContext);
  if (!context) {
    throw new Error("useKiosk must be used within a KioskProvider");
  }
  return context;
};
