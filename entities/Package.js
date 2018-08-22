const emitter = require('../functions/emitter')
class Package {
    constructor(param =  {}) {
        this.name = param.name
        this.struct = param.struct
    }

    setStruct(struct) {
        this.struct = struct
        emitter.emit(this.name, this.struct)
    }
}

module.exports = Package