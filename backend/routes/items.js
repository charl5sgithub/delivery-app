import express from "express";
import { supabase } from "../db/supabaseClient.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const { data, error } = await supabase.from("items").select("*");
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

export default router;
