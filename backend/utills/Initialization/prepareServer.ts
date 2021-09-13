import express, { Express } from "express";
import helmet from "helmet";
import dotenv from "dotenv";
import cors from "cors";
import rateLimit from "express-rate-limit";
import crawlerRoutes from "../../routes/CrawlerRoutes";
import connectionWithMongo from "../../Database/connection";
import authRoutes from "../../routes/AuthRoutes";
import dailyCrawlingRoutes from "../../routes/DailyCrawlingRoutes";
import userRoutes from "../../routes/UserRoutes";
import crawlerConfiguration from "../../routes/CrawlingConfigurationRoutes";
import DataAnalysticResource from "../../routes/DataAnalysticRoutes";
import filesRoutes from "../../routes/SavedFilesRoutes";
import paymentController from "../../routes/PaymentRoutes";
import bodyParser from "body-parser";

//zmienić
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
});

export default function initServer(): Express {
  const app = express();

  prepareServer(app);

  startServer(app);

  return app;
}

async function prepareServer(server: express.Application): Promise<void> {
  const corsOptions: cors.CorsOptions = {
    origin: process.env.API_URL,
    optionsSuccessStatus: 200,
    methods: "POST",
  };
  dotenv.config();

  server.use(cors());
  server.use(
    (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ): void => {
      if (req.url === "/payment/api/v1/webhook") {
        bodyParser.raw({ type: "application/json" })(req, res, next);
      } else {
        bodyParser.json()(req, res, next);
      }
    }
  );

  server.use(limiter);
  server.use(helmet());

  connectionWithMongo();
  preapareRoutes(server);
}

function preapareRoutes(server: express.Application): void {
  server.use("/api/data", DataAnalysticResource.router);
  server.use("/api/crawler", crawlerRoutes.router);
  server.use("/api/auth", authRoutes.router);
  server.use("/api/user", userRoutes.router);
  server.use("/api/dailyCrawling", dailyCrawlingRoutes.router);
  server.use("/api/crawlerConfig", crawlerConfiguration.router);
  server.use("/api/savedFiles", filesRoutes.router);
  server.use("/api/payment", paymentController.router);
}

function startServer(server: express.Application): void {
  server.listen(process.env.PORT, () => {
    console.log("Server woke up", process.env.PORT);
  });
}
