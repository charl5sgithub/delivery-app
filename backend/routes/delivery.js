
import express from "express";
import { getDeliveryRoute, updateDriverLocation } from "../controllers/deliveryController.js";

const router = express.Router();

router.get("/route", getDeliveryRoute);
router.post("/location", updateDriverLocation);

export default router;
