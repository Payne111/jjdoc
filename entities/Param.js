const Common = require('./Common')
class Param extends Common {
    constructor(param = {}) {
        super(param)
        this.type = param.type
    }

    setType(type) {
        this.type = type
    }
}

module.exports = Param
