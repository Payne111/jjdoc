const ClassMember = require('../ClassMember')
/**
 * 参数
 */
class Param extends ClassMember {
    constructor(param = {}) {
        super(param)
        this.required = true // 必传

    }

    setRequired(required) {
        this.required = required
    }

    setBelong(belong) {
        super.setBelong(belong)
        this.optimizeType(this.belong.belong)
    }
}

module.exports = Param
