const fs = require('fs')
const Err = require('../entities/Err')

const isString = arg => {
    return typeof arg === 'string'
}

const isArray = arg => {
    return Object.prototype.toString.call(arg) === "[object Array]"
}

const isObject = arg => {
    return Object.prototype.toString.call(arg) === "[object Object]"
}

const isErr = arg => {
    return arg instanceof Err
}

const writeFile = (filePath, data, cb) => {
    fs.writeFile(filePath, data, cb);
}

module.exports = {
    isString,
    isObject,
    isArray,
    isErr,
    writeFile
}