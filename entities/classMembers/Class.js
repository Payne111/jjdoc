const ClassMember = require('../ClassMember')
const Comment = require('./Comment')

const regExp = {
    NAME: /(?<=\s+(class|interface|enum)\s+)\w+/, // 类名
    SUPER: /(?<=\s+(extends|implements)\s+)\w+/, // 父类
    COMMENT: /((\/\/.*)|(\/\*[\s\S]*?\*\/))/, // 注释
}
class Class extends ClassMember {
    constructor(param = {}) {
        super(param)
        this.packageName = param.packageName || null
        this.superClass = param.superClass || null
        this.methods = param.methods || []
        this.fields = param.fields || []
        this.innerClassPool = param.innerClassPool || {}
        this.packagePool = param.packagePool || {}
        this.depPool = param.depPool || {}
    }

    parseSignature() {
        this.name = this.text.match(regExp.NAME)[0]
        // 注释
        let res = this.text.match(regExp.COMMENT)
        if (res) {
            if (this.comment) {
                this.comment.setText(res[0])
            } else {
                this.comment = new Comment({
                    text: res[0]
                })
            }
        }
        // 父类
        res = this.text.match(regExp.SUPER)
        if (res) {
            this.superClass = res[0]
            this.optimizeType(this)
        }
    }

    setPackageName(packageName) {
        this.packageName = packageName
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
