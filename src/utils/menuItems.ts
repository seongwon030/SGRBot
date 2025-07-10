import { MenuItem } from "../types";

export const menuItems: MenuItem[] = [
  {
    id: "1",
    name: "치킨버거",
    name_en: "Chicken Burger",
    description: "바삭한 치킨 패티와 신선한 야채가 어우러진 치킨버거",
    price: 5500,
    category: "burger",
    image: "/chicken.png",
    available: true,
  },
  {
    id: "2",
    name: "비프버거",
    name_en: "Beef Burger",
    description: "두툼한 소고기 패티와 치즈가 어우러진 비프버거",
    price: 6000,
    category: "burger",
    image: "/beef.png",
    available: true,
  },
  {
    id: "3",
    name: "감자튀김",
    name_en: "French Fries",
    description: "바삭하게 튀긴 감자튀김",
    price: 2500,
    category: "side",
    image: "/favicon.ico",
    available: true,
  },
]; 