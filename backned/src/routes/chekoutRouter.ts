import { Router } from "express";
import { createCheckout } from "../controllers/chekoutController";

const router = Router();

router.post("/", createCheckout);

export default router;