import { Router } from "express";
import { checkAuthStatus } from "../controllers/auth_controller.js";

const router = Router();

router.get("/status", checkAuthStatus);

export default router;
