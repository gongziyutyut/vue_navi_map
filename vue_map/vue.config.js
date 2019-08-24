const CompressionPlugin = require('compression-webpack-plugin')
const IS_PROD = process.env.NODE_ENV === 'production'
const cdnDomain = 'http://pvm2crr1z.bkt.clouddn.com'
module.exports = {
  publicPath: IS_PROD ? cdnDomain : '/',
  chainWebpack: config => {
    // 对环境的配置，针对不同的环境，对应不同的baseUrl,
    // 以便axios请求地址不同
    // config参数指代的是webpack
    config.plugin('define').tap(args => {
      args[0]['process.env'].BASE_URL = JSON.stringify(process.env.BASE_URL)
      return args
    })
    // 以下模块为处理代码压缩
    if (process.env.NODE_ENV === 'production') {
      config.plugin('compression').use(CompressionPlugin, {
        asset: '[path].gz[query]',
        algorithm: 'gzip',
        // algorithm: 算法
        test: /\.(js|css)$/, // 处理匹配的文件
        threshold: 10240, // 只处理大于此大小的资源
        minRatio: 0.8, // 只有压缩得更好的资产才能处理这个比率。默认为0.8。
        cache: true // 缓存已解决的依赖项, 避免重新解析它们。
      }).tap(args => {})
    }
    // 配置webpack打包要忽略的文件，键为包名， 值为引入后自己定义的变量名
    /* var externals = {
      vue: 'Vue',
      axios: 'axios',
      'element-ui': 'ELEMENT',
      'vue-router': 'VueRouter',
      vuex: 'Vuex'
    }
    config.externals(externals)
    const cdn = {
      css: [
        // element-ui css
        '//unpkg.com/element-ui/lib/theme-chalk/index.css'
      ],
      js: [
        // vue
        '//cdn.bootcss.com/vue/2.6.10/vue.min.js',
        // vue-router
        '//cdn.staticfile.org/vue-router/3.0.2/vue-router.min.js',
        // vuex
        '//cdn.staticfile.org/vuex/3.1.0/vuex.min.js',
        // axios
        '//cdn.staticfile.org/axios/0.19.0-beta.1/axios.min.js',
        // element-ui js
        '//unpkg.com/element-ui/lib/index.js'
      ]
    }
    config.plugin('html')
      .tap(args => {
        args[0].cdn = cdn
        return args
      }) */
  }
}
