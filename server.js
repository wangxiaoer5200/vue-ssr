const Vue = require('vue')
// 引入express
const express = require('express')
const fs = require('fs')

const { createBundleRenderer } = require('vue-server-renderer')

const server = express()
// express.static处理物理磁盘文件
server.use('/dist', express.static('./dist'))

const serverBundle = require('./dist/vue-ssr-server-bundle.json')
const clientManifest = require('./dist/vue-ssr-client-manifest.json')
const template = fs.readFileSync('./index.template.html', 'utf-8')
const renderer = createBundleRenderer(serverBundle, {
    template,
    clientManifest
})

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

server.get('*', render)

server.listen(3000, () => console.log('place is http://localhost:3000'))


