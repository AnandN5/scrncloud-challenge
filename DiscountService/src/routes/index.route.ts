// This is the main entry point for the routes in the DiscountService application.
import { Router } from "express";
import discountRoutes from "./discount.routes";
const router = Router();

router.use("/discounts", discountRoutes);

export default router;