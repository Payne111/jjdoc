class Api {
    constructor(param = {}) {
        this.comment = param.comment // 注释
        this.apiPath = param.apiPath // 接口路径
        this.params = param.params || [] // 参数
        this.requestType = param.requestType // 请求类型
        this.returnType = param.returnType // 返回值
    }

    setComment(comment) {
        this.comment = comment
    }

    setApiPath(apiPath) {
        this.apiPath = apiPath
    }

    setParams(params) {
        this.params = params
    }

    setParam(param) {
        this.params.push(param)
    }

    setRequestType(requestType) {
        this.requestType = requestType
    }

    setReturnType(returnType) {
        this.returnType = returnType
    }
}

module.exports = Api