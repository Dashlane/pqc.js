const path = require('path');
const webpack = require('webpack');

module.exports = (env) => {
    return {
        mode: 'production',
        entry: './dist/kem.js',
        output: {
            path: path.resolve(__dirname),
            filename: (env.outputFileName || 'pqc-kem') + '.js',
            library: {
                type: 'module'
            },
        },
        experiments: {
            topLevelAwait: true,
            outputModule: true,
        },
        optimization: {
            minimize: true,
        },
        plugins: [
            new webpack.ProvidePlugin({
                process: 'process/browser.js',
            })
        ],
        module: {
            rules: [
                {
                    use: [{
                        loader: 'webpack-strip-block',
                        options: {
                            start: 'nodeblock:start',
                            end: 'nodeblock:end'
                        }
                    }]
                },
                {
                    test: /\.js$/,
                    use: [{
                        loader: 'string-replace-loader',
                        options: {
                            search: 'import.meta.url',
                            replace: '\'\''
                        }
                    }, {
                        loader: 'string-replace-loader',
                        options: {
                            search: 'document.baseURI',
                            replace: 'undefined'
                        }
                    }]
                },
                {
                    test: /\.wasm$/,
                    type: 'javascript/auto',
                    loader: 'file-loader',
                    options: {
                        name: (env.outputFileName || 'pqc-kem') + '.[ext]',
                        esModule: false,
                    }
                },
            ],
        },
        resolve: {
            fallback: {
                "module": false, // Explicitly handle `module` resolution
                "fs": false,
                "path": false,
            },
            extensions: ['.js', '.json', '.wasm'],  // Ensure webpack resolves these extensions
        },
        stats: {
            errorDetails: true
        }
    };
};
