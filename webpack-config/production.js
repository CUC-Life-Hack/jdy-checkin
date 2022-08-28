import path from 'path';
import url from 'url';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import userscript from './userscript.js';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
	mode: 'production',
	entry: path.resolve(__dirname, '../src/main.js'),
	output: {
		path: path.resolve(__dirname, '../dist'),
		filename: 'main.js'
	},
	module: {
		rules: [{
			test: /\.(css|s[ac]ss)/,
			use: ['style-loader', 'css-loader', 'sass-loader']
		}]
	},
	plugins: [userscript, new CleanWebpackPlugin()]
};
