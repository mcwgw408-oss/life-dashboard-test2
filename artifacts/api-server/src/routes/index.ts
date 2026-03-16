import { Router, type IRouter } from "express";
import healthRouter from "./health";
import homeRouter from "./home";
import dailyRouter from "./daily";
import workRouter from "./work";
import consultingRouter from "./consulting";
import moneyRouter from "./money";
import healthTabRouter from "./healthTab";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/home", homeRouter);
router.use("/daily", dailyRouter);
router.use("/work", workRouter);
router.use("/consulting", consultingRouter);
router.use("/money", moneyRouter);
router.use("/health", healthTabRouter);

export default router;
