const Common = require('./Common')
const regExp = {
    COMMENT: /((\/\/.*)|(\/\*[\s\S]*?\*\/))/, // 注释
    VALUE: /(?<==\s*)[^\s]+\s*(?=;)/, //字段值
    NAME: /\w+$/, // 字段名
    TYPE: /\w+(<.*>)?$/, // 类型
}
class Field extends Common {
    constructor(param = {}) {
        super(param)
        this.type = param.type
        this.value = param.value
    }

    resolveSignature() {
        let text = this.text
        // 注释
        let res = text.match(regExp.COMMENT)
        if (res) {
            this.comment = res[0]
            text = text.substring(0, res.index).trim()
        }
        // 值
        res = text.match(regExp.VALUE)
        if (res) {
            this.value = res[0]
        }
        text = text.split('=')[0].replace(';', '').trim()

        // 字段名
        res = text.match(regExp.NAME)
        this.name = res[0]

        //类型
        text = text.substring(0, res.index).trim()
        res = text.match(regExp.TYPE)
        this.type = res[0]
    }

    setBelong(belong) {
        super.setBelong(belong)
        this.optimizeType('type')
    }


}

module.exports = Field
