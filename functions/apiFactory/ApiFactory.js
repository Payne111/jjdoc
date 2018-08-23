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



    // 处理所有方法
    processMethods() {
        const methods = this.material.methods
        if (methods) {
            methods.forEach(method => {
                this.processMethod(method)
            });
        }
    }

    // 处理方法
    processMethod(method) {
        // console.log(method)
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
            api.setComment(method.comment)

            // 返回类型
            const returnType = this.processType(method.returnType)
            api.setReturnType(returnType)

            // 参数
            const params = this.processParams(method.params)
            api.setParams(params)

            // 请求类型
            api.setRequestType(this.currRequestType)
            this.currRequestType = null

            this.apis.push(api)
        }
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
                if (keyWords.POST_MAPPING.test(anno.name)) { // post
                    this.currRequestType = constant.POST
                    if (utils.isString(anno.param)) {
                        // 请求路径
                        annoProduct.setSubApiPath(this.processApiPath(anno.param))
                    }
                } else {
                    if (utils.isString(anno.param)) { // get
                        this.currRequestType = constant.GET
                        // 请求路径
                        annoProduct.setSubApiPath(this.processApiPath(anno.param))
                    } else if (utils.isObject(anno.param)) {
                        if (keyWords.GET.test(anno.param.method)) { // get
                            this.currRequestType = constant.GET
                        } else if (keyWords.POST.test(anno.param.method)) { // post
                            this.currRequestType = constant.POST
                        }
                        // 请求路径
                        annoProduct.setSubApiPath(this.processApiPath(anno.param.value))
                    }
                }
            }
        }
        return annoProduct
    }

    processApiPath(apiPath) {
        if (!/\//.test(apiPath)) {
            apiPath = '/' + apiPath
        }
        return apiPath
    }

    // 处理返回值
    processType(type) {
        let struct = null
        if (utils.isString(type)) {
            struct = type
        } else if (utils.isObject(type)) {
            const fields = type.fields
            if (fields) {
                struct = Object.create(null)
                fields.forEach(field => {
                    const obj = Object.create(null)
                    obj.type = this.processType(field.type)
                    obj.comment = field.comment
                    struct[field.name] = obj
                })
            }
        }
        return struct
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
            if(paramBlacklist[i].test(param.text)) {
                return null
            }
        }
        let res = Object.create(null)
        res.name = param.name
        res.type = this.processType(param.type)
        // if (utils.isString(res.type)) {
        //     if (/\./.test(res.type)) { // 包路径的形式，说明是第三方的包
        //         res = null
        //     }
        // } 
        this.processAnnos(param.annotations, anno => {
            if (anno.name == 'RequestBody') {
                this.currRequestType = constant.POST
            }
        })
        return res
    }
}

module.exports = ApiFactory