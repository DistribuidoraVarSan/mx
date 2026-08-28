import { Router, type IRouter } from "express";
import healthRouter from "./health";
import assistantRouter from "./assistant";
import newsletterRouter from "./newsletter";
import sessionsRouter from "./sessions";
import authEmailsRouter from "./auth-emails";
import twoFactorRouter from "./two-factor";
import accountRouter from "./account";
import supportRouter from "./support";

const router: IRouter = Router();

router.use(healthRouter);
router.use(assistantRouter);
router.use(newsletterRouter);
router.use(sessionsRouter);
router.use(authEmailsRouter);
router.use(twoFactorRouter);
router.use(accountRouter);
router.use(supportRouter);
export default router;
