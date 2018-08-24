const Loader = require('./functions/loader')
const Resolver = require('./functions/resolver')
const ApiFactory = require('./functions/apiFactory')
const ApiConvertor = require('./functions/apiConvertor')
const utils = require('./utils')
const json2md = require("json2md")
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
        const apiConvertor = new ApiConvertor({ apis })
        const mdJsons = apiConvertor.convert()
        let id = 0
        mdJsons.forEach(json => {
            const md = json2md(json)
            id ++
            utils.writeFile(`/Users/pjf/Desktop/jm${id}.md`, md, function (err) {
                if (err) {
                    return console.error(err);
                }
                console.log("数据写入成功！");
            })
        })
    }, 100);
})


