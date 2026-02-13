import express from "express";
import { supabase } from "../db/supabaseClient.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const { data: dbItems, error } = await supabase.from("items").select("*");
  if (error) return res.status(400).json({ error: error.message });

  // 1. Process DB items (Fish/Seafood)
  const processedFishItems = dbItems.map(item => {
    const lowerName = item.name.toLowerCase();
    let category = "fish";
    if (lowerName.includes("crab") || lowerName.includes("prawn") || lowerName.includes("squid") || lowerName.includes("cuttlefish")) {
      category = "seafood";
    }
    return { ...item, category };
  });

  // 2. Mock Data for other categories
  const mockChicken = [
    { id: 1001, name: "Whole Chicken", price: 12.00, image: "https://cdn.pixabay.com/photo/2010/12/13/10/05/chicken-2230_1280.jpg", category: "chicken" },
    { id: 1002, name: "Chicken Breast (1kg)", price: 14.00, image: "https://cdn.pixabay.com/photo/2022/06/07/21/04/chicken-breast-7249266_1280.jpg", category: "chicken" },
    { id: 1003, name: "Chicken Drumsticks", price: 10.00, image: "https://media.istockphoto.com/id/1127393486/photo/raw-chicken-legs-on-white-background-isolated.jpg?s=612x612&w=0&k=20&c=0sryXhU05gH6Y465XQGjsqGDZ3tVDqF_5Wc00YWE0l8=", category: "chicken" }
  ];

  const mockGoat = [
    { id: 2001, name: "Goat Curry Cut (1kg)", price: 22.00, image: "https://media.istockphoto.com/id/486548773/photo/raw-meat.jpg?s=612x612&w=0&k=20&c=L_qgYBya0O-j6A6GjQwbZ1o53wE8-sN5rU53UjA0V9E=", category: "goat" },
    { id: 2002, name: "Mutton Chops", price: 25.00, image: "https://media.istockphoto.com/id/515236166/photo/raw-lamb-chops.jpg?s=612x612&w=0&k=20&c=GgQY-o6KzDqMhT_3Kz5Z8Abe0wE3y0yH8V6Jqj5t2Sg=", category: "goat" }
  ];

  const mockGrocery = [
    { id: 3001, name: "Basmati Rice (5kg)", price: 15.00, image: "https://cdn.pixabay.com/photo/2016/02/29/05/46/brown-rice-1227656_1280.jpg", category: "grocery" },
    { id: 3002, name: "Sunflower Oil (1L)", price: 5.00, image: "https://cdn.pixabay.com/photo/2015/10/02/15/59/olive-oil-968657_1280.jpg", category: "grocery" },
    { id: 3003, name: "Fresh Tomatoes (1kg)", price: 3.00, image: "https://cdn.pixabay.com/photo/2011/03/16/16/01/tomatoes-5356_1280.jpg", category: "grocery" }
  ];

  // 3. Combine
  const allItems = [...processedFishItems, ...mockChicken, ...mockGoat, ...mockGrocery];

  res.json(allItems);
});

// Insert multiple items
router.post("/bulk", async (req, res) => {
  const items = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: "Expected an array of items" });
  }

  const { data, error } = await supabase.from("items").insert(items).select();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: `Successfully inserted ${data.length} items`, data });
});

// Delete all items (use with caution)
router.delete("/all", async (req, res) => {
  const { error } = await supabase.from("items").delete().neq("id", 0);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: "All items deleted successfully" });
});

export default router;
