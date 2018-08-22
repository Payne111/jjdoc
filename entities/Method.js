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
}

let lastMatchRes = null
let paramStr = null
const params = []
const match = reg => {
    lastMatchRes = paramStr.match(reg)
    return lastMatchRes
}

/**
 * 解析参数
 */
const iterateParam = () => {
    const param = new Param()
    // 参数注解
    if (match(regExp.ANNOTATION)) {
        const annotation = new Annotation({
            text: lastMatchRes[0]
        })
        param.addAnnotation(annotation)
    }
    clean()

    // 参数类型
    if (match(regExp.PARAM_TYPE)) {
        param.setType(lastMatchRes[0])
    }
    clean()

    // 参数名
    if (match(regExp.PARAM_NAME)) {
        param.setName(lastMatchRes[0])
    }
    clean()

    if (lastMatchRes) {
        params.push(param)
        iterateParam()
    }
}

const clean = () => {
    if (lastMatchRes) {
        paramStr = paramStr.substring(lastMatchRes.index + lastMatchRes[0].length)
    }
}

class Method extends Common {
    constructor(param = {}) {
        super(param)
        this.returnType = null
        this.params = null
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
        this.name = res[0]
        // 返回类型
        text = text.substring(0, res.index).trim()
        res = text.match(regExp.RETURN)
        this.returnType = res[0]
        if (regExp.SCOPE.test(this.returnType)) { // 构造函数
            this.returnType = this.name
        }
        // 参数
        paramStr = this.text.match(regExp.PARAM_STR)[0]
        iterateParam()
        this.params = params
    }

    setBelong(belong) {
        super.setBelong(belong)
        this.optimizeType('returnType')
        this.params.forEach(param => {
            param.setBelong(this)
        })
    }
}

module.exports = Method
