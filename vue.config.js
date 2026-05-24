const webpack = require("webpack");
const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
    .BundleAnalyzerPlugin;
const CURRENT_TIMESTAMP = new Date().getTime();
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
const smp = new SpeedMeasurePlugin();
const HtmlWebpackPlugin = require('html-webpack-plugin');
const fs = require('fs');
const ejs = require('ejs');
const CompressionPlugin = require("compression-webpack-plugin")
const BrotliPlugin = require('brotli-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin");
const cacheList = [];
const {watchHC2, replaceViteDist, safeBuildHC2} = require('./scripts/hc2Support/watchAndBuild');

const mode = process.argv.includes('--mode') && process.argv[process.argv.indexOf('--mode') + 1];

// serve 명령어인지 build 명령어인지 구별
const isServeMode = process.env.npm_lifecycle_script && process.env.npm_lifecycle_script.indexOf(' serve') >= 0;

console.log('isServeMode:', isServeMode, ', NODE_ENV:', process.env.NODE_ENV);

module.exports = {
  productionSourceMap: isServeMode,
  pluginOptions: {
    i18n: {
      locale: 'ko',
      fallbackLocale: 'ko',
      localeDir: 'locales',
      enableInSFC: false
    }
  },
  chainWebpack: (config) => {
    if (process.env.NODE_ENV === 'production') {
      config.module.rules.delete('eslint');
    }
    config.plugins.delete('prefetch')

    // Sass deprecation warnings 끄기 - 모든 sass-loader에 적용
    const sassLoaderOptions =
    {
      sassOptions: {
        silenceDeprecations: ['legacy-js-api', 'import', 'global-builtin'],
        quietDeps: true,
        // 모든 warning을 무시
        // logger: {
        //   warn: function(message) {
        //     return;
        //   }
        // }
      }
    };

    // const sassLoaderOptions = {} // 경고를 보고 싶다면

    // scss, sass 파일들에 대한 sass-loader 설정
    ['scss', 'sass'].forEach(rule => {
      ['vue-modules', 'vue', 'normal-modules', 'normal'].forEach(oneOf => {
        try {
          config.module
            .rule(rule)
            .oneOf(oneOf)
            .use('sass-loader')
            .tap(options => Object.assign(options || {}, sassLoaderOptions));
        } catch (e) {
          // oneOf가 존재하지 않는 경우 무시
        }
      });
    });
    config.module
        .rule('vue')
        .use('cache-loader')
        .loader('cache-loader')
        .options({
          cacheDirectory: path.resolve(__dirname, 'node_modules/.cache/cache-loader')
        }).end()
        .use('thread-loader')
        .loader('thread-loader')
        .end()

    config.module
        .rule('js')
        .use('cache-loader')
        .loader('cache-loader')
        .options({
          cacheDirectory: path.resolve(__dirname, 'node_modules/.cache/cache-loader')
        }).end()
        .use('thread-loader')
        .loader('thread-loader')
        .end()

    config.module
      .rule('babel')
      .test(/\.m?js$/)
      .exclude
      .add(filepath => {
        return /node_modules/.test(filepath) && !/node_modules[/\\](@sentry|@firebase|firebase)/.test(filepath);
      })
      .end()
      .use('babel-loader')
      .loader('babel-loader')
      .options({
        presets: ['@babel/preset-env'],
        plugins: ['@babel/plugin-proposal-optional-chaining']
      })

    config.module
      .rule('mjs')
      .test(/\.mjs$/)
      .type('javascript/auto')
      .include
      .add(/node_modules/)
      .end()

    config.module
        .rule('scss')
        .oneOf('vue')
        .use('cache-loader')
        .loader('cache-loader')
        .options({
          cacheDirectory: path.resolve(__dirname, 'node_modules/.cache/sass-loader')
        })
        .end()
        .use('thread-loader')
        .loader('thread-loader')
        .end()
        .use('sass-loader')
        .loader('sass-loader')
        .end();
  },
  configureWebpack: smp.wrap(config => {

    if (isServeMode) {
      config.devtool = 'eval-cheap-source-map'; // 'source-map' <= 상세 줄보기 할 수 있는 모드
    } else {
      config.devtool = false;
    }

    return {
      devServer: {
        disableHostCheck: true,
        headers: {
          'Cross-Origin-Embedder-Policy': 'credentialless',
          'Cross-Origin-Opener-Policy': 'same-origin',
        },
        before: (app) => {
          watchHC2(mode);

          const cacheTargets = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'scripts/postBuild/cacheTargets.json')));

          app.use((req, res, next) => {
            if (process.argv.includes('--accesslog')) {
              console.log(`${req.method} ${req.url} => ${res.statusCode}`);
            }
            next();
          });

          app.get('/files/cachelist.json', (req, res) => {
            res.json([...cacheTargets.defaultList,
              ...[...cacheTargets.onBuild.filter(e => e.file.startsWith('/files')), ...cacheList].map(e => ({
                url: `${req.protocol}://${req.get('host')}${e.file}`,
                hash: e.file
              })),
              {
                url: `${req.protocol}://${req.get('host')}/index.html`,
                hash: `${req.protocol}://${req.get('host')}/index.html`,
                alias: [
                  `${req.protocol}://${req.get('host')}/[a-zA-Z0-9_/-]+[a-zA-Z0-9]$`
                ],
                'content-type': "text/html"
              }
            ]);
          });
        }
      },
      plugins: [
        new webpack.ProvidePlugin({
          $: 'jquery',
          jQuery: 'jquery',
          'window.jQuery': 'jquery',
        }),
        new BundleAnalyzerPlugin({
          analyzerMode: 'disabled'
        }),
        new HtmlWebpackPlugin({
          templateContent: () =>
              ejs.render(
                  replaceViteDist(
                      fs.readFileSync(
                          path.resolve(__dirname, 'public', 'index.html'), 'utf-8'))
                  , process.env)
        }),
        new HtmlWebpackPlugin({
          template: 'public/mobile-static/help/faq/index.html',
          filename: 'mobile-static/help/faq/index.html',
          inject: false,
          templateParameters: (compilation, assets, assetTags, options) => {
            return {
              compilation: compilation,
              webpackConfig: compilation.options,
              htmlWebpackPlugin: {
                tags: assetTags,
                files: assets,
                options: {
                  jsAssets: assets.js,
                  ...options
                }
              },
            };
          }
        }),
        {
          apply: compiler =>
              compiler.hooks.beforeRun.tapPromise('BeforeRunPlugin', () =>
                  safeBuildHC2(mode))
        },
        {
          apply: compiler =>
              compiler.hooks.afterEmit.tap('AfterEmitPlugin', (compilation) => {
                const assets = compilation.getAssets();
                cacheList.splice(0, cacheList.length);
                cacheList.push(...assets.filter(asset => asset.name.startsWith('app.')
                    && asset.name.endsWith('.js')).map(asset => ({file: `/${asset.name}`})));
              })
        },
        {
          apply: compiler => {
            if (process.env.npm_lifecycle_script.indexOf(' serve') >= 0) return;
            compiler.hooks.afterEmit.tap('AfterEmitPlugin', () => {
              const destIndex = process.argv.indexOf('--dest');
              require('./scripts/postBuild/buildCacheList')({
                outputDir: path.resolve(__dirname, destIndex !== -1 ? process.argv[destIndex + 1] : 'dist'),
                urlPrefix: process.env.VUE_APP_BASE_UI_URI,
                outputFile: '/files/cachelist.json'
              });
            });
          }
        },
        ...(isServeMode ? [] : [
          new CompressionPlugin({
                algorithm: "gzip",
                threshold: 10240, // 10kb
                minRatio: 0.8,
          }),
          new BrotliPlugin({
            threshold: 10240,
            minRatio: 0.8
          })
        ]),
      ],
      resolve: {
        alias: {
          '@': path.join(__dirname, 'src'),
          'src': path.join(__dirname, 'src'),
          '@hiclass/core': path.join(__dirname, 'packages/hiclass-core/src/index.ts'),
        }
      },
      output: {
        filename: '[name].[hash]' + `.${CURRENT_TIMESTAMP}` + '.bundle.js'
      },
      optimization: {
        minimizer:
            isServeMode ? [] : [new TerserPlugin()]
      },
    };
  }),
  transpileDependencies: [
    'vue-html2pdf'
    // 'pdfjs-dist'를 여기서 제거합니다.
  ]
}
