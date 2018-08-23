const Loader = require('./functions/loader')
const Resolver = require('./functions/resolver')
const ApiFactory = require('./functions/apiFactory')
const utils = require('./utils')
const loader = new Loader()
loader.load('com.ggj.life.mini.web.ImgController').then(text => {
    if (utils.isErr(text)) {
        return
    }
    
    const resolver = new Resolver({
        text
    })
    const clazz = resolver.resolve()
    setTimeout(() => {
        // console.log(clazz)
        const apiFactory = new ApiFactory({
            material: clazz
        })
        const apis = apiFactory.produce()
        apis.forEach(api => {
            console.log(api)
            api.params.forEach(param => {
                // console.log(param)

                // for (let key in param.type) {
                //     console.log(key, param.type[key])
                // }
            })
            // console.log('============')
        })
    }, 100);
})


