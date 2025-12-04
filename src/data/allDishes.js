import jollofImg from "../assets/jollof2.jpg";
import egusiImg from "../assets/egusi.jpg";
import suyaImg from "../assets/suya.jpg";
import pepperSoupImg from "../assets/pepper-soup.jpeg";
import moimoiImg from "../assets/moimoi.jpg";
import yamPorridgeImg from "../assets/yam-porridge.jpg";

const allDishes = [
  {
    id: 1,
    name: "Jollof Rice",
    description: "Classic West African rice with tomatoes, spices, and peppers.",
    price: 3000,
    image: jollofImg,
    rating: 5,
    stock: 10,
    category: "Full Meal"
  },
  {
    id: 2,
    name: "Egusi Soup",
    description: "Melon seed soup with assorted meats and vegetables.",
    price: 4000,
    image: egusiImg,
    rating: 4,
    stock: 8,
    category: "Soup"
  },
  {
    id: 3,
    name: "Suya",
    description: "Spicy Nigerian beef skewers grilled to perfection.",
    price: 2500,
    image: suyaImg,
    rating: 5,
    stock: 5,
    category: "Protein"
  },
  {
    id: 4,
    name: "Pepper Soup",
    description: "Spicy broth with tender meat cuts, perfect for spice lovers.",
    price: 3500,
    image: pepperSoupImg,
    rating: 4,
    stock: 12,
    category: "Soup"
  },
  {
    id: 5,
    name: "Moi Moi",
    description: "Steamed bean pudding with a soft, rich texture.",
    price: 2000,
    image: moimoiImg,
    rating: 3,
    stock: 15,
    category: "Full Meal"
  },
  {
    id: 6,
    name: "Yam Porridge",
    description: "Creamy yam porridge with palm oil and vegetables.",
    price: 3000,
    image: yamPorridgeImg,
    rating: 4,
    stock: 9,
    category: "Full Meal"
  },
];

export default allDishes;