"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const models_1 = require("./models");
const router_1 = __importDefault(require("./router"));
const path_1 = __importDefault(require("path"));
const schedulerService_1 = __importDefault(require("./service/schedulerService"));
// sequelize
//   .sync({ alter: true })
//   // .sync({ force: false })
//   .catch((error) => {
//     console.error(error);
//   });
const app = express_1.default();
const morgan = require("morgan");
const nunjucks = require("nunjucks");
models_1.sequelize.sync({ force: false }).catch((error) => {
    console.error(error);
});
app.use(express_1.default.urlencoded());
app.use(express_1.default.json());
// Port Host
const PORT = parseInt(process.env.PORT, 10) || 8080;
const HOST = process.env.HOST || "localhost";
// allow cors
app.use(cors_1.default({
    credentials: true,
    origin: [
        "http://localhost:3000",
        "https://dev.opentogether-o2.com",
        "https://www.opentogether-o2.com",
    ],
}));
// route
app.use("/", router_1.default);
app.set("view engine", "ejs");
app.set("view", path_1.default.join(__dirname, "views"));
// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "production" ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render("error");
    // scheduler
    schedulerService_1.default.challengeOpen;
});
const server = app
    .listen(PORT, () => {
    console.log(`
    ################################################
    🛡️  Server listening on port: ${PORT} 🛡️
    ################################################
  `);
    models_1.sequelize
        // .sync({ alter: true })
        .authenticate()
        .then(() => __awaiter(void 0, void 0, void 0, function* () {
        console.log("MySQL Connected ...");
    }))
        .catch((err) => {
        console.log("TT : ", err);
    });
})
    .on("error", (err) => {
    console.error(err);
    process.exit(1);
});
server.timeout = 1000000;
//# sourceMappingURL=index.js.map