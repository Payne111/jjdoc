const Common = require('./Common')
const regExp = {
    NAME: /(?<=\s+(class|interface|enum)\s+)\w+/, // 类名
    SUPER: /(?<=\s+(extends|implements)\s+)\w+/, // 父类
    COMMENT: /((\/\/.*)|(\/\*[\s\S]*?\*\/))/, // 注释
}
class Class extends Common {
    constructor(param = {}) {
        super(param)
        this.superClass = param.superClass
        this.methods = param.methods || []
        this.fields = param.fields || []
        this.innerClassPool = param.innerClassPool || {}
        this.responsibility = param.responsibility
        this.packagePool = param.packagePool || {}
        this.depPool = param.depPool || {}
    }

    resolveSignature() {
        this.name = this.text.match(regExp.NAME)[0]
        // 注释
        let res = this.text.match(regExp.COMMENT)
        if (res) {
            this.comment = res[0]
        }
        res = this.text.match(regExp.SUPER)
        if (res) {
            this.superClass = res[0]
            this.optimizeType('superClass', this)
        }
    }

    addPackage(className, packageName) {
        this.packagePool[className] = packageName
    }

    addInnerClass(clazz) {
        this.innerClassPool[clazz.name] = clazz
        clazz.setBelong(this)
    }

    addMethod(method) {
        this.methods.push(method)
        method.setBelong(this)
    }

    addField(field) {
        this.fields.push(field)
        field.setBelong(this)
    }

}

module.exports = Class
