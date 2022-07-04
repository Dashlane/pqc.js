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
                    loader: 'string-replace-loader',
                    options: {
                        search: 'import.meta.url',
                        replace: '\'\''
                    }
                },
                {
                    loader: 'string-replace-loader',
                    options: {
                        search: 'document.baseURI',
                        replace: 'undefined'
                    }
                },
                // Default WebAssembly loader cannot be used https://github.com/webpack/webpack/issues/15566
                {
                    test: /\.wasm$/,
                    // Force using legacy assets loader https://github.com/webpack/webpack/issues/6725
                    type: 'javascript/auto',
                    loader: 'file-loader',
                    options: {
                        name: (env.outputFileName || 'pqc-kem') + '.[ext]',
                        esModule: false,
                    }
                },
            ],
        },
    };
};
