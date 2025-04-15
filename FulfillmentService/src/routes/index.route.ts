// This is the main entry point for the routes in the DiscountService application.
import { Router } from "express";
import discountRoutes from "./fulfillment.routes";
const router = Router();

router.use("/fulfillments", discountRoutes);

export default router;