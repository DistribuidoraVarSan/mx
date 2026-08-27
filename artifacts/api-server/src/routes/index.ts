import { Router, type IRouter } from "express";
import healthRouter from "./health";
import assistantRouter from "./assistant";
import newsletterRouter from "./newsletter";
import sessionsRouter from "./sessions";

const router: IRouter = Router();

router.use(healthRouter);
router.use(assistantRouter);
router.use(newsletterRouter);
router.use(sessionsRouter);

export default router;
