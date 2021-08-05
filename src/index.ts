import express from "express";
import config from "./config";
import cors from "cors";
import { sequelize } from "./models";

const path = require("path");
const app = express();
const morgan = require("morgan");
const nunjucks = require("nunjucks");

sequelize.sync({ force: false }).catch((error) => {
  console.error(error);
});

app.use(express.urlencoded());
app.use(express.json());

// Port Host
const PORT: number = parseInt(process.env.PORT as string, 10) || 8080;
const HOST: string = process.env.HOST || "localhost";

// allow cors
app.use(
  cors({
    credentials: true,
    origin: [
      "http://localhost:3000",
      "https://dev.opentogether-o2.com",
      "https://www.opentogether-o2.com",
    ],
  })
);

// route
// app.use('/', router);

// app.use("/auth", require("./controller/auth"));
// app.use("/challenge", require("./controller/challenge"));
// app.use("/admin", require("./controller/admin"));
// app.use("/concert", require("./controller/concert"));
// app.use("/user", require("./controller/user"));
// app.use("/notice", require("./controller/notice"));

// scheduler
// import { challengeOpen } from "./service/schedulerService";

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "production" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");

  // scheduler
  // challengeOpen;
});

const server = app
  .listen(PORT, () => {
    console.log(
      `
    ################################################
    🛡️  Server listening on port: ${PORT} 🛡️
    ################################################
  `
    );
    sequelize
      .authenticate()
      .then(async () => {
        console.log("MySQL Connected ...");
      })
      .catch((e) => {
        console.log("TT : ", e);
      });
  })
  .on("error", (err) => {
    console.error(err);
    process.exit(1);
  });

server.timeout = 1000000;