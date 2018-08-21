const loader = require('./functions/loader')
const Resolver = require('./functions/resolver')

loader.load('com.ggj.life.mini.web.CartController').then(text => {
    const resolver = new Resolver({
        text
    })
    const clazz = resolver.resolve()
    console.dir(clazz.methods)
})