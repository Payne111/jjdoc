const Common = require('./Common')
const regExp = {
    VALUE: /(?<==\s*)[^\s]+\s*(?=;)/, //字段值
    TYPE: /\w+/, // 类型
    NAME: /\w+/, // 字段名
    COMMENT: /((\/\/.*)|(\/\*[\s\S]*?\*\/))/, // 注释
}
class Field extends Common {
    constructor(param = {}) {
        super(param)
        this.type = param.type
        this.value = param.value
    }

    resolveSignature() {
        let text = this.text
        // 值
        let res = text.match(regExp.VALUE)
        if (res) {
            this.value = res[0]
        }
        // 注释
        res = text.match(regExp.COMMENT)
        if (res) {
           this.comment = res[0]
        }
        text = text.split('=')[0]
        //类型
        res = text.match(regExp.TYPE)
        this.type = res[0]
        
        // 字段名
        text = text.substring(res.index + res[0].length)
        this.name = text.match(regExp.NAME)[0]
    }

}

module.exports = Field
