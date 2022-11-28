const path = require('path');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const PugPlugin = require('pug-plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');

const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev;

module.exports = {
  //Подключаем точку входа "entry" и точку выхода "output"
  entry: {
    index: './src/index.pug', // output dist/index.html
    // about: './src/index.pug', // output dist/about.html
  },
  output: {
    path: isProd ? path.join(__dirname, 'build') : path.join(__dirname, 'dist'),
    filename: 'index.[contenthash].js',
    assetModuleFilename: path.join('images', '[name].[contenthash][ext]'),
  },
  // Мы создали объект module, для которого задали правило rules
  // для всех модулей (файлов) .js webpack применит плагин babel-loader
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /.pug$/,
        loader: PugPlugin.loader, // Pug loader
      },
      {
        test: /\.(scss|css)$/,
        use: [
          'css-loader',
          'postcss-loader',
          // 'group-css-media-queries-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.(png|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.svg$/,
        type: 'asset/resource',
        generator: {
          filename: path.join('icons', '[name].[contenthash][ext]'),
        },
      },
      {
        test: /\.(woff2?|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
    ],
  },
  // Плагины
  plugins: [
    // Стартует сервер без папки dist
    new FileManagerPlugin({
      events: {
        onStart: {
          delete: ['dist', 'build'],
        },
        onEnd: {
          copy: [
            {
              source: path.join('src', 'static', 'robots.txt'),
              destination: path.join(isProd ? 'build' : 'dist', 'robots.txt'),
            },
          ],
        },
      },
    }),
    new PugPlugin({
      pretty: isProd, // formatting HTML, should be used in development mode only
      extractCss: {
        // output filename of CSS files
        filename: 'assets/css/[name].[contenthash:8].css',
      },
    }),
  ],
  // Запуск сервера для разработки
  devServer: {
    watchFiles: path.join(__dirname, 'src'),
    port: 9000,
  },
  optimization: {
    minimizer: [
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: {
            plugins: [
              ['gifsicle', { interlaced: true }],
              ['jpegtran', { progressive: true }],
              ['optipng', { optimizationLevel: 5 }],
              ['svgo', { name: 'preset-default' }],
            ],
          },
        },
      }),
    ],
  },
};
