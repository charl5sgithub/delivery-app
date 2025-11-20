import express from "express";
import { supabase } from "../db/supabaseClient.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { userId, items, total } = req.body;
  const { data, error } = await supabase
    .from("orders")
    .insert([{ userId, items, total, status: "pending" }]);
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

export default router;
