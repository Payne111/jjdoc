const Common = require('./Common')
const Annotation = require('../entities/Annotation')
const Param = require('../entities/Param')

const regExp = {
    NAME: /\w+(?=\s*\()/, // 方法名
    RETURN: /(?<=(public|private|protected)?\s*(static)?\s*)([A-Z]\w+(<.*>)?)/, // 返回类型
    PARAM_STR: /(?<=\().*(?=\))/, //参数
    ANNOTATION: /(?<=^\s*)@\w+(\(.*\))?/, // 注解
    COMMENT: /((\/\/.*)|(\/\*[\s\S]*?\*\/))/, // 注释
    PARAM_TYPE: /(?<=^\s*)[A-Z]\w+/, // 参数类型
    PARAM_NAME: /(?<=^\s*)\w+/, // 参数名

}

let lastMatchRes = null
let paramStr = null
const params = []
const match = reg => {
    lastMatchRes = paramStr.match(reg)
    return lastMatchRes
}

const iterate = () => {
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
        iterate()
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
        // 注释
        let res = this.text.match(regExp.COMMENT)
        if (res) {
            this.comment = res[0]
        }
        this.name = this.text.match(regExp.NAME)[0]
        this.returnType = this.text.match(regExp.RETURN)[0]
        paramStr = this.text.match(regExp.PARAM_STR)[0]
        iterate()
        this.params = params
    }
}

module.exports = Method
