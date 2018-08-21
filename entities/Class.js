const Common = require('./Common')
const regExp = {
    NAME: /(?<=\s+class\s+)\b[a-zA-Z]+\b/, // 类名
    SUPER: /(?<=\s+extends\s+)\b[a-zA-Z]+\b/, // 父类
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
        this.packageNamePool = param.packageNamePool || {}
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
        }
    }

    addPackage(className, packageName) {
        this.packageNamePool[className] = packageName
    }

    addInnerClass(clazz) {
        this.innerClassPool[clazz.name] = clazz
        this.setBelong(clazz)
    }

    addMethod(method) {
        this.methods.push(method)
        this.setBelong(method)
    }

    addField(field) {
        this.fields.push(field)
        this.setBelong(field)
    }

    setBelong(member) {
        member.belong = this
    }
}

module.exports = Class
