const Vue = require('vue')
// 引入express
const express = require('express')
const fs = require('fs')

const { createBundleRenderer } = require('vue-server-renderer')
const setupDevServer = require('./build/setup-dev-server')

const server = express()
// express.static处理物理磁盘文件
server.use('/dist', express.static('./dist'))

// 判断是否是开发模式
const isProd = process.env.NODE_ENV === 'production'

let renderer
let onReady // 返回一个promise对象，方便以后调用
if (isProd) {
    // 引入 vue-server-renderer
    const serverBundle = require('./dist/vue-ssr-server-bundle.json')
    const clientManifest = require('./dist/vue-ssr-client-manifest.json')
    const template = fs.readFileSync('./index.template.html', 'utf-8')
    const renderer = createBundleRenderer(serverBundle, {
        template,
        clientManifest
    })
}   else {
    // 等待构建 => 重新生成renderer
    onReady = setupDevServer(server, (serverBundle, template, clientManifest) => {
        renderer = createBundleRenderer(serverBundle, {
            template,
            clientManifest
        })
    })
}

const render = async (req, res) => {
    try {
        const html = await renderer.renderToString({
            title: 'Hello, SSR', 
            url: req.url
        })
        res.send(html)
    }   catch(err) {
        res.status(500).end('Internal Server Error.')
    }
} 

// 服务端路由为 * ，意味着所有路由都会进入
server.get('*', isProd ? 
render 
: async (req, res) => {
    // 等待有了renderer渲染器后，调用render渲染
    await onReady
    render(req, res)
})

server.listen(3000, () => console.log('place is http://localhost:3000'))


