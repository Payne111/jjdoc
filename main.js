const Loader = require('./functions/loader')
const Parser = require('./functions/parser')
const ApiFactory = require('./functions/apiFactory')
const ApiConvertor = require('./functions/apiConvertor')
const utils = require('./utils')
const json2md = require("json2md")
const loader = new Loader()
loader.load('com.ggj.life.mini.web.AddressController').then(text => {
    if (utils.isErr(text)) {
        return
    }

    const parser = new Parser({
        text
    })
    const clazz = parser.parse()
    setTimeout(() => {
        // console.log(clazz)
        const apiFactory = new ApiFactory({
            material: clazz
        })
        const apis = apiFactory.produce()
        // apis.forEach(api => {
        //     // console.log(api)
        // })
        const apiConvertor = new ApiConvertor({ apis })
        const mdJsons = apiConvertor.convert()
        let id = 1
        let md = ''
        mdJsons.forEach(json => {
            md += json2md(json)
            // id ++
            utils.writeFile(`/Users/pjf/Desktop/jm${id}.md`, md, function (err) {
                if (err) {
                    return console.error(err);
                }
                console.log("数据写入成功！");
            })
        })
        
    }, 100);
})


