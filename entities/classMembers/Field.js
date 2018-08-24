const ClassMember = require('../ClassMember')
const Comment = require('./Comment')

const regExp = {
    COMMENT: /((\/\/.*)|(\/\*[\s\S]*?\*\/))/, // 注释
    VALUE: /(?<==\s*)[^\s]+\s*(?=;)/, //字段值
    NAME: /\w+$/, // 字段名
    TYPE: /\w+(<.*>)?$/, // 类型
}
/**
 * 字段
 */
class Field extends ClassMember {
    constructor(param = {}) {
        super(param)
        this.value = param.value || null
    }

    parseSignature() {
        let text = this.text
        // 注释
        let res = text.match(regExp.COMMENT)
        if (res) {
            if (this.comment) {
                this.comment.setText(res[0])
            } else {
                this.comment = new Comment({
                    text: res[0]
                })
            }
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

        //类型名
        text = text.substring(0, res.index).trim()
        res = text.match(regExp.TYPE)
        this.typeName = res[0]
    }

    setBelong(belong) {
        super.setBelong(belong)
        this.optimizeType(this.belong)
    }


}

module.exports = Field
