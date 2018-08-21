const Base = require('./Base')
const regExp = {
    NAME: /(?<=@)\w+/, //注解名
    STR_PARAM: /(?<=\(").*(?="\))/, //字符串参数
    KV_PARAM: /(?<=\().*(?=\))/, //键值对参数
}
class Annotation extends Base {
    constructor(param = {}) {
        super(param)
        this.name = this.text.match(regExp.NAME)[0]
        let paramMatchRes = this.text.match(regExp.STR_PARAM)
        if (paramMatchRes) {
            this.param = paramMatchRes[0]
        } else {
            paramMatchRes = this.text.match(regExp.KV_PARAM)
            if (paramMatchRes) {
                this.param = Object.create(null)
                let kvs = paramMatchRes[0]
                kvs = kvs.split(',')
                kvs.forEach(kv => {
                    kv = kv.split('=')
                    this.param[kv[0]] = kv[1]
                });
            }
        }

    }
}

module.exports = Annotation
