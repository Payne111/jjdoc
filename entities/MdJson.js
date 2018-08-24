/**
 * json2md格式json
 */
class MdJson {
    constructor(param = {}) {
        this.comment = param.comment || '' // 注释
        this.apiPath = param.apiPath || null // 接口路径
        this.params = param.params || [] // 参数
        this.requestType = param.requestType || null // 请求类型
        this.returnTypeName = param.returnTypeName || null // 返回类型
        this.returnTypeStruct = param.returnTypeStruct || null // 返回类型结构
        this.res = []
    }

    done() {
        // 接口说明
        this.addH1('【接口说明】' + this.comment)

        // apiPath
        this.addH2("请求URL")
        this.addBlockquote(this.apiPath)

        // requestType
        this.addH2("请求方式")
        this.addBlockquote(this.requestType)

        // params
        this.addH2("请求参数")
        this.params.forEach(param => {
            this.addUl([this.createUl(param)])
            this.addH1('')
        });

        // returnType
        this.addH2("返回")
        this.addUl([this.createUl(this, null, 'returnTypeName', 'returnTypeStruct')])
        this.addH1('')
        // this.addUl(['返回类型'])
        // this.addCode(this.returnTypeName)
        // if (this.returnTypeStruct) {
        //     this.addUl(['返回类型结构'])
        //     this.addCode()
        // }
        return this.res
    }

    addH1(text) {
        this.res.push({
            h1: text
        })
    }

    addH2(text) {
        this.res.push({
            h2: text
        })
    }

    addH3(text) {
        this.res.push({
            h3: text
        })
    }


    addBlockquote(text) {
        this.res.push({
            blockquote: text
        })
    }

    addUl(texts) {
        this.res.push({
            ul: texts
        })
    }

    addCode(text) {
        this.res.push({
            "code": {
                language: "js"
                , content: [
                    text
                ]
            }
        })
    }

    createUl(data, nameFeild, typeNameFeild = 'typeName', typeStructField = 'typeStruct') {
        const ul = []
        let name = ''
        if (nameFeild) {
            name += `${data[nameFeild]} | `
        }
        ul.push(`${name}${data[typeNameFeild]}`)
        const struct = data[typeStructField]
        if (struct) {
            for (let key in struct) {
                ul.push(this.createUl(struct[key], 'name'))
            }
        }
        return {
            ul
        }
    }
}

module.exports = MdJson