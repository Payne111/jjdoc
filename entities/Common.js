const Base = require('./Base')
class Common extends Base {
    constructor(param = {}) {
        super(param)
        this.comment = param.comment
        this.annotations = param.annotations || []
        this.type = param.type
    }

    setAnnotations(annotations) {
        this.annotations = annotations
    }

    addAnnotation(annotation) {
        this.annotations.push(annotation)
    }
}

module.exports = Common
