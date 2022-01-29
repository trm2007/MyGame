const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: "/src/index.js",
    output: {
        path: __dirname + "/dist",
        filename: "script.js",
        clean: true,
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: "My Game",
            // Load a custom template
            template: "/assets/index.html",
            hash: true,
        }),
        new CopyPlugin({
            patterns: [
                {
                    from: "assets/css/*.css",
                    to: "css/[name][ext]",
                },
            ],
        }),
    ],
};
