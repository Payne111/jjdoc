const loader = require('./functions/loader')
const Resolver = require('./functions/resolver')

loader.load('com.ggj.life.mini.interceptor.AuthInterceptor').then(text => {
    const resolver = new Resolver({
        text
    })
    const clazz = resolver.resolve()
    setTimeout(() => {
        console.log(clazz)
    }, 100);
})


