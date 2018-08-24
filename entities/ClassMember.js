const Package = require('../entities/Package')
const packagePool = require('../pools/package')
const failedPool = require('../pools/failed')
const emitter = require('../functions/emitter')
class ClassMember {
    constructor(param = {}) {
        this.text = param.text || null // 原始文本
        this.name = param.name || null // 名字
        this.typeName = param.typeName || null // 类型
        this.typePackageName = param.typePackageName || null // 类型包名
        this.typeStruct = param.typeStruct || null // 类型结构
        this.comment = param.comment || null // 注释
        this.annotations = param.annotations || [] // 注解
        this.belong = param.belong || null // 归属
    }

    setText(text) {
        this.text = text
    }

    setName(name) {
        this.name = name
    }

    setTypeName(typeName) {
        this.typeName = typeName
    }

    setTypePackageName(typePackageName) {
        this.typePackageName = typePackageName
    }

    setTypeStruct(typeStruct) {
        this.typeStruct = typeStruct
    }

    setComment(comment) {
        this.comment = comment
    }

    setAnnotations(annotations) {
        this.annotations = annotations
    }

    addAnnotation(annotation) {
        this.annotations.push(annotation)
    }

    setBelong(belong) {
        this.belong = belong
    }

    /**
     * 完善类型信息
     * @param {*} belong 
     */
    optimizeType(belong, typeNameField = 'typeName', typePackageNameField = 'typePackageName', typeStructField = 'typeStruct') {
        const typeName = this[typeNameField] // 类型名
        if (this.belong) {
            if (typeName == this.belong.name) { // 构造函数
                this[typeStructField] = this.belong
                return
            }
        }
        const pool = this.findPackagePool(belong)
        if (pool) {
            const packageName = pool[typeName] // 包名
            if (packageName) {
                this[typePackageNameField] = packageName
                // 扔到包池，等待解析
                if (!packagePool.has(packageName) && !failedPool.has(packageName)) {
                    packagePool.add(
                        packageName,
                        new Package({
                            name: packageName
                        })
                    )
                }
                emitter.on(packageName, struct => {
                    this[typeStructField] = struct
                })
            }
        }
    }

    findPackagePool(belong) {
        let pool = null
        if (belong) {
            pool = belong.packagePool
            if (!pool) {
                pool = this.findPackagePool(belong.belong)
            }
        }
        return pool
    }
}

module.exports = ClassMember