const ClassMember = require('../ClassMember')
/**
 * 参数
 */
class Param extends ClassMember {
    constructor(param = {}) {
        super(param)
    }

    setBelong(belong) {
        super.setBelong(belong)
        this.optimizeType(this.belong.belong)
    }
}

module.exports = Param
