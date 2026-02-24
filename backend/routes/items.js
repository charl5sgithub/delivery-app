import express from "express";
import { supabase } from "../db/supabaseClient.js";

const router = express.Router();

// GET all items
router.get("/", async (req, res) => {
  const { data: dbItems, error } = await supabase.from("items").select("*").order("name", { ascending: true });
  if (error) return res.status(400).json({ error: error.message });

  // If some items don't have a category (legacy), we still apply the logic from before
  const processedItems = dbItems.map(item => {
    if (item.category) return item;

    const lowerName = item.name.toLowerCase();
    let category = "Fish";
    if (lowerName.includes("crab") || lowerName.includes("prawn") || lowerName.includes("squid") || lowerName.includes("cuttlefish")) {
      category = "Seafood";
    }
    return { ...item, category };
  });

  res.json(processedItems);
});

// GET single item
router.get("/:id", async (req, res) => {
  const { data, error } = await supabase.from("items").select("*").eq("id", req.params.id).single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// CREATE item
router.post("/", async (req, res) => {
  const { name, price, category, image } = req.body;
  if (!name || !price || !category || !image) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const { data, error } = await supabase.from("items").insert([{ name, price, category, image }]).select();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data[0]);
});

// UPDATE item
router.put("/:id", async (req, res) => {
  const { name, price, category, image } = req.body;
  if (!name || !price || !category || !image) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const { data, error } = await supabase.from("items").update({ name, price, category, image }).eq("id", req.params.id).select();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data[0]);
});

// DELETE item
router.delete("/:id", async (req, res) => {
  const { error } = await supabase.from("items").delete().eq("id", req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: "Item deleted successfully" });
});

// Insert multiple items (Bulk)
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
