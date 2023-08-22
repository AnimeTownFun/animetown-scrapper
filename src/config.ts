import dotenv from "dotenv";
dotenv.config();

let config = {
  GogoAnimeURL: "https://gogoanimehd.io/",
  PORT: process.env.PORT,
  SECRET: process.env.SECRET_KEY,
};

export default config;
