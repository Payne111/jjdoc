const MdJson = require('../../entities/MdJson')
class ApiConvertor {
    constructor(param = {}) {
        this.apis = param.apis
        this.mdJsons = []
    }
    convert() {
        this.apis.forEach(api => {
            const mdJson = new MdJson({...api}).done()
            this.mdJsons.push(mdJson)
        })
        return this.mdJsons
        // console.log(this.mdJsons)
    }

}

module.exports = ApiConvertor