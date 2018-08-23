class AnnoProduct {
    constructor(param = {}) {
        this.requestType = param.requestType // 请求类型
        this.subApiPath = param.subApiPath // 请求子路径
    }

    setRequestType(requestType) {
        this.requestType = requestType
    }

    setSubApiPath(subApiPath) {
        this.subApiPath = subApiPath
    }
}

module.exports = AnnoProduct
