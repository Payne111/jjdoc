const Class = require('../../entities/classMembers/Class')
const Method = require('../../entities/classMembers/Method')
const Field = require('../../entities/classMembers/Field')
const Annotation = require('../../entities/classMembers/Annotation')
const Comment = require('../../entities/classMembers/Comment')

const packagePool = require('../../pools/package')
const depPool = require('../../pools/dep')
const failedPool = require('../../pools/failed')

const Loader = require('../../functions/loader')
const utils = require('../../utils')
const regExp = require('./regExp')

class Resolver {
    constructor(param = {}) {
        this.text = param.text
        this.lastMatchRes = null // 最新匹配结果
        this.outerClass = null
        this.hasOuterClassMatched = false // 外部类已经匹配了
        this.memberCache = null
        this.complete = false
    }

    resolve() {
        this.parseOutClassPackage()
        this.parseImports()
        this.parseClassBody()
        this.processPackagePool()
        return this.outerClass
    }

    parseOutClassPackage() {
        this.lastMatchRes = this.text.match(regExp.PACKAGE)
        if (this.lastMatchRes) { // 内部类没有包名
            this.memberCache = Object.create(null)
            const text = this.lastMatchRes[0]
            const packageName = text.match(regExp.CLASS_PACKAGE)[0]
            this.memberCache.packageName = packageName
        }
        this.clean()
    }

    parseImports() {
        if (this.memberCache) { // 有包名，是外部类
            this.memberCache.packagePool = Object.create(null)
            const regObj = new RegExp(regExp.DEP_PACKAGE_NAME)
            let res
            while ((res = regObj.exec(this.text)) !== null) {
                const packageName = res[0].replace(';', '')
                const className = getClassName(packageName)
                this.memberCache.packagePool[className] = packageName
                this.lastMatchRes = res
            }
            this.clean()
        }
    }

    /**
     * 解析类体
     */
    parseClassBody() {
        if (!this.memberCache) {
            this.memberCache = Object.create(null)
        }
        if (this.match(regExp.COMMENT)) { // 注释
            this.add2Cache('comment', () => {
                return new Comment({
                    text: this.lastMatchRes[0]
                })
            })

        } else if (this.match(regExp.ANNOTATION)) { //注解
            this.add2Cache('annotations', () => {
                return new Annotation({
                    text: this.lastMatchRes[0]
                })
            }, true)

        } else if (this.match(regExp.CLASS_SIGNATURE)) { // 类
            if (this.hasOuterClassMatched) { // 内部类
                const endIndex = this.matchPairs()
                const resolver = new Resolver({
                    text: this.text.substring(this.lastMatchRes.index, endIndex + 1)
                })
                const clazz = resolver.resolve()
                this.outerClass.addInnerClass(clazz)
                this.lastMatchRes[0] = '}'
                this.lastMatchRes.index = endIndex
            } else { // 外部类
                this.hasOuterClassMatched = true
                this.outerClass = new Class({
                    text: this.lastMatchRes[0],
                    ...this.memberCache
                })
                this.outerClass.parseSignature()
                this.outerClass.setPackageName(this.memberCache.packageName + '.' + this.outerClass.name)
                this.memberCache = null
            }
        } else if (this.match(regExp.METHOD_SIGNATURE)) { // 方法
            const method = new Method({
                text: this.lastMatchRes[0],
                ...this.memberCache
            })
            method.parseSignature()
            this.outerClass.addMethod(method)
            this.memberCache = null

            const endIndex = this.matchPairs()
            if (endIndex) {
                this.lastMatchRes[0] = '}'
                this.lastMatchRes.index = endIndex
            }

        } else if (this.match(regExp.FIELD_SIGNATURE)) { // 字段
            const field = new Field({
                text: this.lastMatchRes[0],
                ...this.memberCache
            })
            field.parseSignature()
            this.outerClass.addField(field)
            this.memberCache = null
        }

        this.clean()
        if (this.lastMatchRes) {
            this.parseClassBody()
        }
    }

    /**
     * 解析全局包池
     */
    processPackagePool() {
        rsv()
        function rsv() {
            const names = Object.keys(packagePool.getPool())
            const name = names.pop()
            if (name) {
                const pkg = packagePool.get(name)
                packagePool.delete(name)
                const loader = new Loader()
                loader.load(name).then(text => {
                    if (utils.isErr(text)) {
                        failedPool.add(name)
                        return rsv()
                    }
                    let clazz = depPool[name]
                    if (!clazz) {
                        const resolver = new Resolver({
                            text
                        })
                        clazz = resolver.resolve()
                        depPool[name] = clazz
                    }
                    if (!pkg.struct) {
                        pkg.setStruct(clazz)
                    }
                    rsv()
                })
            }
        }
    }

    /**
     * 添加注释或注解
     * @param {String} name
     * @param {Function} cb 
     * @param {Boolean} isArray 
     */
    add2Cache(name, cb, isArray) {
        const instant = cb()
        let member = this.memberCache[name]
        if (!member && isArray) {
            member = []
        }
        if (isArray) {
            member.push(instant)
        } else {
            member = instant
        }
        this.memberCache[name] = member
    }

    /**
     * 匹配并缓存匹配结果
     * @param {RegExp} reg 
     */
    match(reg) {
        this.lastMatchRes = this.text.match(reg)
        return this.lastMatchRes
    }

    /**
     * 匹配成对花括号
     */
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
        if (res) {
            res = res.index
        }
        return res
    }

    /**
     * 清除上一次匹配的结果
     */
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