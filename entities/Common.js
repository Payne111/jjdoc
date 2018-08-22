const Base = require('./Base')
const Package = require('../entities/Package')
const packagePool = require('../pools/package')
const emitter = require('../functions/emitter')
class Common extends Base {
    constructor(param = {}) {
        super(param)
        this.comment = param.comment
        this.annotations = param.annotations || []
    }

    setAnnotations(annotations) {
        this.annotations = annotations
    }

    addAnnotation(annotation) {
        this.annotations.push(annotation)
    }

    optimizeType(typeField) {
        const typeName = this[typeField]
        if (typeName == this.belong.name) { // 构造函数
            this[typeField] = this.belong
            return
        }
        const pool = this.findpackagePool(this.belong)
        if (pool) {
            const completeType = pool[typeName]
            if (completeType) {
                this[typeField] = completeType
                if (!packagePool.has(completeType)) {
                    packagePool.add(
                        completeType,
                        new Package({
                            name: completeType
                        })
                    )
                }
                emitter.on(completeType, (type) => {
                    this[typeField] = type
                })
            }
        }
    }

    findpackagePool(belong) {
        let pool = null
        if (belong) {
            pool = belong.packagePool
            if (!pool) {
                return this.findpackagePool()
            }
        }
        return pool
    }
}

module.exports = Common
