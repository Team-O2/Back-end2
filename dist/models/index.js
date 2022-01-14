"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Comment = exports.User = exports.Scrap = exports.Post = exports.Like = exports.Generation = exports.Concert = exports.Challenge = exports.Badge = exports.Admin = exports.sequelize = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = __importDefault(require("./User"));
exports.User = User_1.default;
const Admin_1 = __importDefault(require("./Admin"));
exports.Admin = Admin_1.default;
const Badge_1 = __importDefault(require("./Badge"));
exports.Badge = Badge_1.default;
const Challenge_1 = __importDefault(require("./Challenge"));
exports.Challenge = Challenge_1.default;
const Concert_1 = __importDefault(require("./Concert"));
exports.Concert = Concert_1.default;
const Generation_1 = __importDefault(require("./Generation"));
exports.Generation = Generation_1.default;
const Like_1 = __importDefault(require("./Like"));
exports.Like = Like_1.default;
const Post_1 = __importDefault(require("./Post"));
exports.Post = Post_1.default;
const Scrap_1 = __importDefault(require("./Scrap"));
exports.Scrap = Scrap_1.default;
const Comment_1 = __importDefault(require("./Comment"));
exports.Comment = Comment_1.default;
const db = {};
dotenv_1.default.config();
exports.sequelize = new sequelize_typescript_1.Sequelize(
// config.development.database,
// config.development.username,
// config.development.password,
{
    host: process.env.DB_HOST || "localhost",
    database: process.env.DB_DBNAME,
    dialect: "mysql",
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    logging: false,
    timezone: "+09:00",
});
exports.sequelize.addModels([
    Admin_1.default,
    Badge_1.default,
    Challenge_1.default,
    Concert_1.default,
    Generation_1.default,
    Like_1.default,
    Post_1.default,
    Scrap_1.default,
    User_1.default,
    Comment_1.default,
]);
exports.default = exports.sequelize;
//# sourceMappingURL=index.js.map