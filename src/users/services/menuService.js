import { db } from "../../firebaseConfig.js";
import { 
  collection, 
  getDocs, 
  query, 
  orderBy,
  where 
} from "firebase/firestore";

export const getMenuItems = async () => {
  try {
    const menuCollection = collection(db, "menus");
    const menuQuery = query(menuCollection, orderBy("name"));
    const snapshot = await getDocs(menuQuery);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching menu items:", error);
    throw error;
  }
};

export const getCategories = async () => {
  try {
    const menuCollection = collection(db, "menus");
    const snapshot = await getDocs(menuCollection);
    
    const categories = ["All"];
    snapshot.docs.forEach(doc => {
      const category = doc.data().category;
      if (category && !categories.includes(category)) {
        categories.push(category);
      }
    });
    
    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return ["All"];
  }
};