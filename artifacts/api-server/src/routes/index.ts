import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import postsRouter from "./posts";
import storageRouter from "./storage";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(postsRouter);
router.use(storageRouter);

export default router;
