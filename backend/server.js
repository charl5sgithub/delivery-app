import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { supabase } from "./services/supabase.js";
import { stripe } from "./services/stripe.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Sample endpoint
app.get("/api/products", async (req, res) => {
  const { data, error } = await supabase.from("products").select("*");
  if (error) return res.status(500).json({ error });
  res.json(data);
});

app.get("/", (_, res) => res.send("Backend running 🚀"));
app.listen(8080, () => console.log("Server on http://localhost:8080"));
