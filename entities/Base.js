class Base {
    constructor(param = {}) {
        this.text = param.text
        this.name = param.name
        this.belong = param.belong
    }

    setName(name) {
        this.name = name
    }

    setText(text) {
        this.text = text
    }

    setBelong(belong) {
        this.belong = belong
    }
}

module.exports = Base