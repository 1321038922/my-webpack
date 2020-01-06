var webpack = require('webpack');
var path = require('path');
var glob = require('glob');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var MiniCssExtractPlugin = require("mini-css-extract-plugin");
var FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
var TransferWebpackPlugin = require('transfer-webpack-plugin');
var portfinder = require('portfinder');
var UglifyJSPlugin = require('uglifyjs-webpack-plugin')
// var CleanWebpackPlugin = require('clean-webpack-plugin');
// var ports = fs.readFileSync('./port.json', 'utf8');
var hostAddress = 'localhost'
// ports = JSON.parse(ports);
portfinder.basePort = "3123";
// portfinder.getPort(function (err, port) {
// 	ports.data.port = port;
// 	ports = JSON.stringify(ports, null, 4);
// 	fs.writeFileSync('./port.json', ports);
// 	portfinder.basePort = ports
// });
// ///////////////////获取本机ip///////////////////////
// function getIPAdress() {
// 	var interfaces = os.networkInterfaces();
// 	for (var devName in interfaces) {
// 		var iface = interfaces[devName];
// 		for (var i = 0; i < iface.length; i++) {
// 			var alias = iface[i];
// 			if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
// 				return alias.address;
// 			}
// 		}
// 	}
// }
// var host = getIPAdress();
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
		eArr.push(name);
		// eArr.push('babel-polyfill');
		entry[n] = eArr;
	})
	return entry;
}
//动态生成html
//获取html-webpack-plugin参数的方法
var getHtmlConfig = function (name, chunks) {
	return {
		template: `./src/pages/${name}.html`,
		filename: `${name}.html`,
		inject: true,
		hash: false,
		chunks: [name]
	}
}
module.exports = {
	entry: getEntry(),
	output: {
		path: path.resolve(__dirname, 'devdist'),
		filename: `js/[name]-bundle.js`,
		// publicPath: '',
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
							presets: ['@babel/preset-env',],
							plugins: ['@babel/transform-runtime']
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
							// autoprefixer({
							// 	browsers: ['ie >= 8', 'Firefox >= 20', 'Safari >= 5', 'Android >= 4', 'Ios >= 6', 'last 4 version']
							// })
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
						plugins: [
							// autoprefixer({
							// 	browsers: ['ie >= 8', 'Firefox >= 20', 'Safari >= 5', 'Android >= 4', 'Ios >= 6', 'last 4 version']
							// })
						]
					}
				}, "sass-loader"]
			},
			{
				test: /\.(png|jpg|jpeg|gif|svg)$/,
				use: [
					{
						loader: 'url-loader',
						options: {
							name: "[hash:12]-[name].[ext]",
							// fallback: 'file-loader',
							outputPath: "../image/" // 定义输出的图片路径
						}
					},
				]
			},
			{
				test: /\.(woff|woff2|eot|ttf|otf)$/,
				use: [
					{
						loader: 'url-loader',
						options: {
							outputPath: 'font/'
						}
					}
				]
			},
		]
	},
	mode: "development",
	performance: {
		hints: false
	},
	//插件
	plugins: [
		// new CleanWebpackPlugin(),
		new MiniCssExtractPlugin({
			filename: `css/[name].css`
		}),
		new webpack.ProvidePlugin({
			$: "jquery",
			jQuery: "jquery",
			jquery: "jquery",
			"window.jQuery": "jquery"
		}),
		new FriendlyErrorsWebpackPlugin({
			compilationSuccessInfo: {
				messages: [`You application is running here http://${hostAddress}:${portfinder.basePort}`]
			}
		}),
		new UglifyJSPlugin({
			uglifyOptions: {
				compress: {
					properties: false,
					ie8: true
				}
			}
		}),
		new TransferWebpackPlugin([
			{
				from: 'static',
				to: 'static'
			},
		], path.resolve(__dirname, "src"))
		// new webpack.HotModuleReplacementPlugin(),
		// new webpack.NamedModulesPlugin()
	],
	devServer: {
		// contentBase: path.resolve(__dirname, 'devdist'), //最好设置成绝对路径
		historyApiFallback: false,
		clientLogLevel: 'warning',
		compress: true,
		// lazy: false,
		// openPage: 'pages',
		quiet: true,
		hot: true,
		// hotOnly: true,
		inline: true,
		stats: 'errors-only',
		host: hostAddress,
		port: portfinder.basePort,
		watchContentBase: true,
		overlay: true,
		open: true,
		// proxy: {
		// 	"/api": "http://localhost:3000"
		// }
	}
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