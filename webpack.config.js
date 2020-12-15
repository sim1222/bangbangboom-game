const path = require("path");

module.exports = {
    mode: "production",
    entry: path.join(__dirname, "/build/main.js"),
    output: {
        filename: "bangbangboom-game.js",
        path: path.join(__dirname, "/dist")
    },
    resolve: {
        extensions: [".ts", ".js"]
    }
}