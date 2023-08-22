import app from "./app";
import chalk from "chalk";
import config from "./config";

app.listen(config.PORT, () => {
  console.log(
    chalk.green("API SUCCESS"),
    `Server is running on the PORT ${config.PORT}`
  );
  console.log(chalk.underline.bold.yellow(`http://localhost:${config.PORT}`));
});
