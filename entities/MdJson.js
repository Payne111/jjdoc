class MdJson {
    constructor(param = {}) {
        this.comment = param.comment || '' // 注释
        this.apiPath = param.apiPath // 接口路径
        this.params = param.params || [] // 参数
        this.requestType = param.requestType // 请求类型
        this.returnType = param.returnType // 返回值
        this.res = []
    }

    done() {
        this.res.push({
            h1: '【接口说明】' + this.comment
        })

        // apiPath
        this.res.push({
            h2: "请求URL"
        })
        this.res.push({
            blockquote: this.apiPath
        })

        // requestType
        this.res.push({
            h2: "请求方式"
        })
        this.res.push({
            blockquote: this.requestType
        })

        // params
        this.res.push({
            h2: "请求参数"
        })
        this.params.forEach(param => {
            this.res.push({
                ul: [
                    '参数名'
                ]
            })
            this.res.push({
                "code": {
                    language: "js"
                    , content: [
                        param.name
                    ]
                }
            })
            this.res.push({
                ul: [
                    '参数类型或结构'
                ]
            })
            this.res.push({
                "code": {
                    language: "js"
                    , content: [
                        JSON.stringify(param.type)
                    ]
                }
            })
        });

        // returnType
        this.res.push({
            ul: [
                "返回"
            ]
        })
        
        return this.res
    }
}

module.exports = MdJson