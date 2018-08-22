const Common = require('./Common')
class Param extends Common {
    constructor(param = {}) {
        super(param)
        this.type = param.type
    }

    setType(type) {
        this.type = type
    }

    setBelong(belong) {
        super.setBelong(belong)
        this.optimizeType('type', this.belong.belong)
    }
}

module.exports = Param
