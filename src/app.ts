import express, { Request, Response } from "express";
import morgan from "morgan";
import cors from "cors";
import v1Router from "./routes";

const app = express();

app.use(morgan("dev"));
app.use(cors());
app.use("/api/v1", v1Router);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    status: 200,
    message: "AnimeTown API is working properly! 🎉✨",
    messages: ["AnimeTown", "API", "is", "working", "properly!", "🎉✨"],
  });
});

export default app;
