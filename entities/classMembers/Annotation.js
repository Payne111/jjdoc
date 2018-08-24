const ClassMember = require('../ClassMember')
const regExp = {
    NAME: /(?<=@)\w+/, // 注解名
    STR_PARAM: /(?<=\(").*(?="\))/, // 字符串参数
    KV_PARAM: /(?<=\().*(?=\))/, // 键值对参数
    QUOTATION: /"/, // 引号
    STR: /(?<="\s*).*(?=\s*")/, // 字符串
}
/**
 * 注解
 */
class Annotation extends ClassMember {
    constructor(param = {}) {
        super(param)
        this.params = param.params || []
        this.parseSignature()
    }

    parseSignature() {
        // 名字
        this.name = this.text.match(regExp.NAME)[0]
        // 参数
        let paramMatchRes = this.text.match(regExp.STR_PARAM)
        if (paramMatchRes) { // 字符串参数
            const param = new AnnoParam({
                value: paramMatchRes[0].trim().replace(/"/g, '').trim()
            })
            this.params.push(param)
        } else { // 键值对参数
            paramMatchRes = this.text.match(regExp.KV_PARAM)
            if (paramMatchRes) {
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
                    const param = new AnnoParam({
                        name: k,
                        value: v
                    })
                    this.params.push(param)
                });
            }
        }
    }
}

class AnnoParam {
    constructor(param = {}) {
        this.name = param.name || null
        this.value = param.value || null
    }
}

module.exports = Annotation
