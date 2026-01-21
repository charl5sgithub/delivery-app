import express from "express";
import { supabase } from "../db/supabaseClient.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("customers")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
