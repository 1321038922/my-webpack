var webpack = require('webpack');
var path = require('path');
var glob = require('glob');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var MiniCssExtractPlugin = require("mini-css-extract-plugin");
// var TransferWebpackPlugin = require('transfer-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
var UglifyJSPlugin = require('uglifyjs-webpack-plugin')
var CopyWebpackPlugin = require('copy-webpack-plugin')
// var autoprefixer = require('autoprefixer');
//动态添加入口
function getEntry() {
	var entry = {};
	//读取src目录所有page入口
	glob.sync('./src/js/**/*.js').forEach(function (name) {
		var start = name.indexOf('src/') + 4;
		var end = name.length - 3;
		var eArr = [];
		var n = name.slice(start, end);
		n = n.split('/')[1];
		eArr.push('babel-polyfill');
		eArr.push(name);
		entry[n] = eArr;
	})
	console.log(entry);
	
	return entry;

}
//动态生成html
//获取html-webpack-plugin参数的方法
var getHtmlConfig = function (name, chunks) {
	return {
		template: `./src/pages/${name}.html`,
		filename: `pages/${name}.html`,
		inject: true,
		hash: false,
		// chunks: [name, 'vendor'],
		chunks: [name],
		minify: {
			removeComments: true, // 是否删除html注释
			collapseWhitespace: false, // 是否折叠有助于文档树中文本节点的空白
			removeAttributeQuotes: false // 尽可能删除属性周围的引号
		},
	}
}
module.exports = {
	mode: "production",
	entry: getEntry(),
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: `js/[name]-[hash:12]-bundle.js`,
		publicPath: '../'
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				include: /src/,
				use: [
					{
						loader: 'babel-loader',
						options: {
							presets: ['@babel/preset-env'],
							plugins: [
								['@babel/transform-runtime'],
								['@babel/plugin-transform-modules-commonjs']
							]
						}
					}
				]
			},
			{
				test: /\.css$/,
				//use:['style-loader','css-loader','postcss-loader']//css不分离写法
				//css分离写法
				use: [MiniCssExtractPlugin.loader, "css-loader", {
					loader: "postcss-loader",
					options: {
						plugins: [
						]
					}
				}]
			},
			{
				test: /\.scss$/,
				//use:['style-loader','css-loader','sass-loader','postcss-loader']//css不分离写法
				//css分离写法
				use: [MiniCssExtractPlugin.loader, "css-loader", {
					loader: "postcss-loader",
					options: {
					}
				}, "sass-loader"]
			},
			{ 
				test: /\.(woff|woff2|svg|eot|ttf)\??.*$/, 
				use: [
					{
						loader: 'file-loader',
						options: {
							// limit: 1024,
							name: "[name]-[hash:12].[ext]",
							outputPath: "font/" // 定义字体路径
						}
					},
				]
			},
			{
				test: /\.(png|jpg|jpeg|gif|svg)$/,
				use: [
					{
						loader: 'url-loader',
						options: {
							limit: 10240,
							name: "[name]-[hash:12].[ext]",
							outputPath: "image/" // 定义输出的图片路径
						}
					},
				]
			}
		]
	},
	performance: {
		hints: false
	},
	//插件  
	plugins: [
		new FriendlyErrorsWebpackPlugin(),
		new CleanWebpackPlugin(),
		new MiniCssExtractPlugin({
			filename: `css/[name]-[hash:12].css`
		}),
		new webpack.ProvidePlugin({
			$: "jquery",
			jQuery: "jquery",
			jquery: "jquery",
			"window.jQuery": "jquery"
		}),
		new CopyWebpackPlugin([
			{
				from: path.resolve(__dirname, './src/static'),
				to: 'static',
				ignore: ['.*']
			}
		]),
	],
	optimization: {
		minimizer: [
			new UglifyJSPlugin({
				sourceMap: true,
				uglifyOptions: {
					ie8: true,
					compress: {
							drop_console: true
					}
				},
				// chunkFilter: (chunk) => {
				//   // Exclude uglification for the `vendor` chunk
				//   // if (chunk.name === 'vendor') {
				//     // return false;
				//   // }
				// 	return true
				// }
			})
		],
		// splitChunks: {
		// 	cacheGroups: {
		// 		//打包公共模块
		// 		commons: {
		// 			chunks: 'initial', //initial表示提取入口文件的公共部分
		// 			minChunks: 2, //表示提取公共部分最少的文件数
		// 			minSize: 0, //表示提取公共部分最小的大小
		// 			name: 'vendor' //提取出来的文件命名
		// 		}
		// 	}
		// }
	},
}
//配置页面
var entryObj = getEntry();
var htmlArray = [];
Object.keys(entryObj).forEach(function (element) {
	htmlArray.push({
		_html: element,
		title: '',
		chunks: [element]
	})
})
//自动生成html模板
htmlArray.forEach(function (element) {
	module.exports.plugins.push(new HtmlWebpackPlugin(getHtmlConfig(element._html, element.chunks)));
})
