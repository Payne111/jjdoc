const config = require('./config')
const fs = require('fs')
const path = require('path')

const readFile = function (filePath) {
    return new Promise((resolve, reject) => {
        resolve(fs.readFileSync(filePath, "utf-8"))
    })
}

const readdir = function (dirPath) {
    return new Promise((resolve, reject) => {
        resolve(fs.readdirSync(dirPath, "utf-8"))
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
                reject('获取文件stats失败');
            } else {
                if (stats.isDirectory()) {
                    resolve(true)
                }
            }
        })
    })
}

class Loader {
    constructor() {

    }

    load(packageName) {
        return new Promise((resolve, reject) => {
            readdir(config.path.project)
                .then(files => {
                    const packagePath = resolvePackageName(packageName)
                    let index = 0
                    rsv()

                    function rsv() {
                        const dirname = files[index]
                        if (!config.ignore.has(dirname)) {
                            const dirPath = path.join(config.path.project, dirname)
                            statDir(dirPath).then(() => {
                                const filePath = path.join(config.path.project, dirname, config.path.common, packagePath)
                                readFile(filePath).then(data => {
                                    resolve(data)
                                }).catch(err => {
                                    rsvIterate()
                                })
                            })
                        }else {
                            rsvIterate()
                        }
                    }

                    function rsvIterate() {
                        if (index + 1 < files.length) {
                            index++
                            rsv()
                        } else {
                            reject('包路径不存在')
                        }
                    }

                })
                .catch(err => {
                    reject('读取项目目录失败')
                })
        })

    }

}

module.exports = Loader
