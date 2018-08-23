const Base = require('./Base')
const regExp = {
    NAME: /(?<=@)\w+/, //注解名
    STR_PARAM: /(?<=\(").*(?="\))/, //字符串参数
    KV_PARAM: /(?<=\().*(?=\))/, //键值对参数
    QUOTATION: /"/, //引号
    STR: /(?<="\s*).*(?=\s*")/, //字符串
}
class Annotation extends Base {
    constructor(param = {}) {
        super(param)
        this.name = this.text.match(regExp.NAME)[0]
        let paramMatchRes = this.text.match(regExp.STR_PARAM)
        if (paramMatchRes) {
            this.param = paramMatchRes[0].trim().replace(/"/g, '').trim()
        } else {
            paramMatchRes = this.text.match(regExp.KV_PARAM)
            if (paramMatchRes) {
                this.param = Object.create(null)
                let kvs = paramMatchRes[0]
                kvs = kvs.split(',')
                kvs.forEach(kv => {
                    kv = kv.split('=')
                    const k = kv[0].trim()
                    let v = kv[1]
                    if (regExp.QUOTATION.test(v)) {
                        v = v.match(regExp.STR)[0]
                    }
                    v = v.trim().replace(/"/g, '').trim()
                    this.param[k] = v
                });
            }
        }

    }
}

module.exports = Annotation
