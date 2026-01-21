import express from "express";
import { supabase } from "../db/supabaseClient.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const { data, error } = await supabase.from("items").select("*");
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
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
