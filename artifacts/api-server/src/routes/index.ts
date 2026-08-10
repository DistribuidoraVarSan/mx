import { Router, type IRouter } from "express";
import healthRouter from "./health";
import assistantRouter from "./assistant";
import newsletterRouter from "./newsletter";

const router: IRouter = Router();

router.use(healthRouter);
router.use(assistantRouter);
router.use(newsletterRouter);

export default router;
