const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: {
        index: "/src/World3D/index.js",
        game2: "/src/Game2/index.js",
    },
    output: {
        path: __dirname + "/dist",
        filename: "[id]_script.js",
        clean: true,
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: "World3D",
            // Load a custom template
            template: "/assets/index.html",
            chunks: ['index'],
            hash: true,
        }),
        new HtmlWebpackPlugin({
            title: "Flappy Bird!",
            // Load a custom template
            template: "/assets/game2.html",
            filename: "game2.html",
            chunks: ['game2'],
            hash: true,
        }),        
        new CopyPlugin({
            patterns: [
                {
                    from: "assets/css/*.css",
                    to: "css/[name][ext]",
                },
                {
                    from: "assets/img/*.*",
                    to: "img/[name][ext]",
                },
                {
                    from: "assets/audio/*.*",
                    to: "audio/[name][ext]",
                },
            ],
        }),
    ],
};
