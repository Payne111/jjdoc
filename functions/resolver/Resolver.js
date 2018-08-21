const regExp = require('./regExp')
const Class = require('../../entities/Class')
const Comment = require('../../entities/Comment')
const Annotation = require('../../entities/Annotation')
const Method = require('../../entities/Method')
const Field = require('../../entities/Field')

class Resolver {
    constructor(param = {}) {
        this.text = param.text
        this.lastMatchRes = null
        this.clazz = null
        this.hasClazzMatched = false
        this.oldEntity = null
        this.currEntity = null
        this.complete = false
    }

    resolve() {
        this.preproccess()
        this.rsvPackageName()
        this.iterate()
        return this.clazz
    }

    preproccess() {
        this.lastMatchRes = this.text.match(regExp.PACKAGE)
        this.clean()
    }

    rsvPackageName() {
        this.currEntity = Object.create(null)
        this.currEntity.packageNamePool = Object.create(null)
        const regObj = new RegExp(regExp.DEP_PACKAGE_NAME)
        let res
        while ((res = regObj.exec(this.text)) !== null) {
            const packageName = res[0].replace(';', '')
            const className = getClassName(packageName)
            this.currEntity.packageNamePool[className] = packageName
            this.lastMatchRes = res
        }
        this.clean()
        // console.log(this.text)
    }

    iterate() {
        if (!this.currEntity) {
            this.currEntity = Object.create(null)
        }
        if (this.match(regExp.COMMENT)) { // 注释
            this.setCurrEntityMember('comment', () => {
                return new Comment({
                    text: this.lastMatchRes[0]
                })
            })

        } else if (this.match(regExp.ANNOTATION)) { //注解
            this.setCurrEntityMember('annotations', () => {
                const annotation = new Annotation({
                    text: this.lastMatchRes[0]
                })
                return annotation
            }, true)

        } else if (this.match(regExp.CLASS_SIGNATURE)) { // 类
            if (this.hasClazzMatched) { // 内部类
                const endIndex = this.matchPairs()
                const resolver = new Resolver({
                    text: this.text.substring(this.lastMatchRes.index, endIndex + 1)
                })
                const clazz = resolver.resolve()
                this.clazz.addInnerClass(clazz)
                this.lastMatchRes[0] = '}'
                this.lastMatchRes.index = endIndex

            } else { // 外部类
                this.hasClazzMatched = true
                this.clazz = new Class({
                    text: this.lastMatchRes[0],
                    ...this.currEntity
                })
                this.clazz.resolveSignature()
                this.currEntity = null
            }
        } else if (this.match(regExp.METHOD_SIGNATURE)) { // 方法
            const method = new Method({
                text: this.lastMatchRes[0],
                ...this.currEntity
            })
            method.resolveSignature()
            this.clazz.addMethod(method)
            this.currEntity = null

            const endIndex = this.matchPairs()
            this.lastMatchRes[0] = '}'
            this.lastMatchRes.index = endIndex

        } else if (this.match(regExp.FIELD_SIGNATURE)) { // 字段
            const field = new Field({
                text: this.lastMatchRes[0],
                ...this.currEntity
            })
            field.resolveSignature()
            this.clazz.addField(field)
            this.currEntity = null
        }

        this.clean()
        if (this.lastMatchRes) {
            this.iterate()
        }
    }

    setCurrEntityMember(memberName, cb, isArray) {
        const instant = cb()
        let member = this.currEntity[memberName]
        if (!member && isArray) {
            member = []
        }
        if (isArray) {
            member.push(instant)
        } else {
            member = instant
        }
        this.currEntity[memberName] = member
    }

    match(reg) {
        this.lastMatchRes = this.text.match(reg)
        return this.lastMatchRes
    }

    matchPairs() {
        const reg = new RegExp(regExp.PAIR) // 必须新建一个正则对象
        let leftCount = 0
        let rightCount = 0
        let res = null
        const condition1 = () => {
            return leftCount == 0 && rightCount == 0
        }
        const condition2 = () => {
            return leftCount !== rightCount
        }
        const condition3 = () => {
            res = reg.exec(this.text)
            return res != null
        }
        function assert() {
            return (condition1() || condition2()) && condition3()
        }

        while (assert()) {
            if (regExp.BLOCK_END.test(res[0])) {
                rightCount++
            } else {
                leftCount++
            }
        }
        return res.index
    }

    clean() {
        if (this.lastMatchRes) {
            this.text = this.text.substring(this.lastMatchRes.index + this.lastMatchRes[0].length)
        }
    }
}

module.exports = Resolver

function getClassName(packageName) {
    const arr = packageName.split('.')
    return arr[arr.length - 1]
}