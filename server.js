//#region 功能載入區塊
const http = require("http");
/** 載入 mongoose 套件 */
const mongoose = require('mongoose');
/** 載入 全域變數套件 */
const dotenv = require('dotenv');
// 全域變數套件設定
dotenv.config({ path: "./config.env" })

// 資源庫
const libs = require('./libs');
// 回應控制
const { successHandler, errorHandler } = require('./responseHandler');
// Posts model
const Posts = require('./models/posts');
//#endregion

//#region 連接資料庫
// 遠端連線字串
const connectString = process.env.DATABASE.replace(
    '<password>',
    process.env.DATABASE_PASSWORD
)
// 連線字串
mongoose.connect(connectString)
    .then(() => {
        console.log('資料庫連線成功')
    })
//#endregion

const requestListener = async (req, res) => {
    const { headers, message } = libs
    const { url, method } = req

    let body = '';
    req.on('data', (chunk) => {
        body += chunk;
    })
    if (url === '/posts' && method === 'GET') {
        const allPosts = await Posts.find();
        successHandler(res, allPosts);
        res.end();
    } else if (url === '/posts' && method === 'POST') {
        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                if (data.content) {
                    const newPost = await Posts.create({
                        name: data.name,
                        content: data.content,
                        tags: data.tags,
                        type: data.type
                    })
                    successHandler(res, newPost);
                } else {
                    handleError(res);
                }
            } catch (err) {
                handleError(res, err);
            }
        })
    } else if (method === "OPTIONS") {
        res.writeHead(200, headers)
        res.end()
    } else {
        errorHandler(res, 404, message[404])
    }
}

const server = http.createServer(requestListener);
server.listen(process.env.PORT);   