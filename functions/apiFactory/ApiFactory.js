const utils = require('../../utils')
const keyWords = require('./keyWords')
const regExp = require('./regExp')
const constant = require('./constant')
const Api = require('../../entities/Api')
const AnnoProduct = require('../../entities/AnnoProduct')
const paramBlacklist = require('../../validators/paramBlacklist')
class ApiFactory {
    constructor(param = {}) {
        this.material = param.material
        this.apis = []
        this.commonApiPath = ''
        this.currRequestType = null
    }

    produce() {
        // 公共子路径
        this.processAnnos(this.material.annotations, anno => {
            const annoProduct = this.processAnno(anno)
            if (annoProduct) {
                this.commonApiPath = annoProduct.subApiPath
            }
        })
        this.processMethods()
        return this.apis
    }

    // 处理注解列表
    processAnnos(annos, cb) {
        if (annos) {
            annos.forEach(cb)
        }
    }

    // 处理注解
    processAnno(anno) {
        let annoProduct = null
        if (anno) {
            // 请求类型
            if (regExp.IS_API.test(anno.name)) {
                annoProduct = new AnnoProduct()
                const annoParams = anno.params
                annoParams.forEach(param => {
                    if (!param.name && param.value || param.name == 'value') {
                        annoProduct.setSubApiPath(this.processApiPath(param.value))
                    } else if (param.name == 'method') {
                        if (keyWords.GET.test(param.value)) {
                            this.currRequestType = constant.GET
                        } else if (keyWords.POST.test(param.value)) {
                            this.currRequestType = constant.POST
                        }
                    }
                })
            }
        }
        return annoProduct
    }

    // 处理所有方法
    processMethods() {
        const methodSet = new Set()
        const methods = []
        function mergeMethds(clazz) {
            if (utils.isObject(clazz)) {
                const arr = clazz.methods
                arr.forEach(method => {
                    const methodName = method.name
                    if (!methodSet.has(methodName)) {
                        methodSet.add(methodName)
                        methods.push(method)
                    }
                })
                mergeMethds(clazz.superClass)
                return methods
            }
        }
        mergeMethds(this.material)
        methods.forEach(method => {
            this.processMethod(method)
        });
    }

    // 处理方法
    processMethod(method) {

        let api = null

        // 注解
        // 请求类型 & 请求路径
        this.processAnnos(method.annotations, anno => {
            const annoProduct = this.processAnno(anno)
            if (annoProduct) {
                if (!api) {
                    api = new Api()
                }
                api.setApiPath(this.commonApiPath + annoProduct.subApiPath)
            }
        })

        if (api) {
            // 处理注释
            if (method.comment) {
                api.setComment(method.comment.text)
            }

            // 返回类型名
            api.setReturnTypeName(method.returnTypeName)

            // 返回类型结构
            const returnTypeStruct = this.processStruct(method.returnTypeStruct)
            api.setReturnTypeStruct(returnTypeStruct)

            // 参数
            const params = this.processParams(method.params)
            api.setParams(params)

            // 请求类型
            api.setRequestType(this.currRequestType || constant.GET)
            this.currRequestType = null

            this.apis.push(api)
        }
    }

    processApiPath(apiPath) {
        if (!/\//.test(apiPath)) {
            apiPath = '/' + apiPath
        }
        return apiPath
    }

    // 处理类结构
    processStruct(clazz) {
        let res = null
        if (utils.isObject(clazz)) {
            res = Object.create(null)
            const fields = clazz.fields
            // console.log(clazz.fields)
            fields.forEach(field => {
                const struct = Object.create(null)
                struct.name = field.name
                struct.typeName = field.typeName
                struct.typeStruct = this.processStruct(field.typeStruct)
                struct.comment = field.comment
                res[field.name] = struct
            })
            if (clazz.superClass) {
                const superRes = this.processStruct(clazz.superClass)
                if (superRes) {
                    res = Object.assign(res, superRes)
                }
            }
        }
        return res
    }

    // 处理参数列表
    processParams(params) {
        let res = null
        if (params) {
            res = []
            params.forEach(param => {
                param = this.processParam(param)
                if (param) {
                    res.push(param)
                }
            })
        }

        return res
    }

    // 处理参数
    processParam(param) {
        for (let i = 0; i < paramBlacklist.length; i++) {
            if (paramBlacklist[i].test(param.text)) {
                return null
            }
        }
        let res = Object.create(null)
        res.name = param.name
        res.typeName = param.typeName
        res.typeStruct = this.processStruct(param.typeStruct)
        this.processAnnos(param.annotations, anno => {
            if (anno.name == 'RequestBody') {
                this.currRequestType = constant.POST
            } else if (anno.name == 'RequestParam') {
                anno.params.forEach(param => {
                    if (param.name == 'value') {
                        res.name = param.value
                    } else if (param.name == 'required' && param.value == 'false') {
                        param.setRequired = false
                    }
                })
            }
        })
        return res
    }
}

module.exports = ApiFactory