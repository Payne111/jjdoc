const config = require('./config')
const fs = require('fs')
const path = require('path')
const utils = require('../../utils')
const Err = require('../../entities/Err')
const readFile = function (filePath) {
    return new Promise((resolve, reject) => {
        try {
            resolve(fs.readFileSync(filePath, "utf-8"))
        } catch (error) {
            resolve(new Err({
                msg: `文件${filePath}不存在`
            }))
        }
    })
}

const readdir = function (dirPath) {
    return new Promise((resolve, reject) => {
        try {
            resolve(fs.readdirSync(dirPath, "utf-8"))
        } catch (error) {
            resolve(new Err({
                msg: `文件夹${dirPath}不存在`
            }))
        }
        
    })
}

const resolvePackageName = packageName => {
    packageName = packageName.replace(/\./g, '*')
    packageName += '.java'
    packageName = packageName.split('*')
    return path.join(...packageName)
}

const statDir = function (dirPath) {
    return new Promise((resolve, reject) => {
        fs.stat(dirPath, (err, stats) => {
            if (err) {
                resolve(new Err({
                    msg: `文件解析失败：${dirPath}`
                }));
            } else {
                if (stats.isDirectory()) {
                    resolve(true)
                }
            }
        })
    })
}

class Loader {
    constructor() {}

    load(packageName) {
        return new Promise((resolve, reject) => {
            readdir(config.path.project)
                .then(files => {
                    if (utils.isErr(files)) {
                        resolve(files)
                        return
                    }
                    const packagePath = resolvePackageName(packageName)
                    let index = 0
                    let filePath
                    rsv()

                    function rsv() {
                        const dirname = files[index]
                        if (!config.ignore.has(dirname)) {
                            const dirPath = path.join(config.path.project, dirname)
                            statDir(dirPath).then(isDir => {
                                if (isDir) {
                                    filePath = path.join(dirPath, config.path.common, packagePath)
                                    readFile(filePath).then(fileData => {
                                        if (utils.isErr(fileData)) {
                                            rsvIterate()
                                        }else {
                                            resolve(fileData)
                                        }
                                    })
                                }
                            })
                        } else {
                            rsvIterate()
                        }
                    }

                    function rsvIterate() {
                        if (index + 1 < files.length) {
                            index++
                            rsv()
                        } else {
                            resolve(new Err({
                                msg: `${packagePath}路径不存在`
                            }))
                        }
                    }

                })
        })
    }
}

module.exports = Loader
