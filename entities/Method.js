const Common = require('./Common')
const Annotation = require('../entities/Annotation')
const Param = require('../entities/Param')

const regExp = {
    METHOD_COMMENT: /((\/\/.*)|(\/\*[\s\S]*?\*\/))$/, // 方法注释
    METHOD_NAME: /\w+(?=\s*\()/, // 方法名
    RETURN: /\w+(<.*>)?$/, // 返回类型
    PARAM_STR: /(?<=\().*(?=\))/, //参数
    ANNOTATION: /(?<=^\s*)@\w+(\(.*\))?/, // 参数注解
    PARAM_TYPE: /(?<=^\s*)\w+(<.*>)?/, // 参数类型
    PARAM_NAME: /(?<=^\s*)\w+/, // 参数名
    SCOPE: /public|private|protected/, // 修饰符
    SEMICOLON: /(?<=^\s*),/, // 逗号  
}

class Method extends Common {
    constructor(param = {}) {
        super(param)
        this.returnType = null
        this.params = param.params || []
        this.paramStr = ''
    }

    resolveSignature() {
        let text = this.text
        // 方法注释
        let res = text.match(regExp.METHOD_COMMENT)
        if (res) {
            this.comment = res[0]
        }
        // 方法名
        res = text.match(regExp.METHOD_NAME)
        if(res) {
            this.name = res[0]
        }
        // 返回类型
        text = text.substring(0, res.index).trim()
        res = text.match(regExp.RETURN)
        if(res) {
            this.returnType = res[0]
        }
        if (regExp.SCOPE.test(this.returnType)) { // 构造函数
            this.returnType = this.name
        }
        // 参数
        this.paramStr = this.text.match(regExp.PARAM_STR)[0]
        if (this.paramStr) {
            const paramStr = this.paramStr
            this.rsvParamStr()
            this.paramStr = paramStr
        }
    }

    rsvParamStr() {

        let lastMatchRes = null
        const match = reg => {
            lastMatchRes = this.paramStr.match(reg)
            return lastMatchRes
        }
        const clean = () => {
            if (lastMatchRes) {
                this.paramStr = this.paramStr.substring(lastMatchRes.index + lastMatchRes[0].length)
            }
        }

        const param = new Param()

        let str = ''

        // 参数注解
        if (match(regExp.ANNOTATION)) {
            const annotation = new Annotation({
                text: lastMatchRes[0]
            })
            param.addAnnotation(annotation)
            str += lastMatchRes[0]
        }
        clean()

        // 参数类型
        if (match(regExp.PARAM_TYPE)) {
            param.setType(lastMatchRes[0])
            str += ' '
            str += lastMatchRes[0]
        }
        clean()

        // 参数名
        if (match(regExp.PARAM_NAME)) {
            param.setName(lastMatchRes[0])
            str += ' '
            str += lastMatchRes[0]
        }
        clean()

        // text
        param.setText(str)

        this.params.push(param)

        if (match(regExp.SEMICOLON)) {
            clean()
            return this.rsvParamStr()
        }
    }

    setBelong(belong) {
        super.setBelong(belong)
        this.optimizeType('returnType', this.belong)
        this.params.forEach(param => {
            param.setBelong(this)
        })
    }
}

module.exports = Method
