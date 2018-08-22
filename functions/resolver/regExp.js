module.exports = {
    COMMENT: /(?<=^\s*)((\/\/.*)|(\/\*[\s\S]*?\*\/))/, // 注释
    ANNOTATION: /(?<=^\s*)@\w+(\(.*\))?/, // 注解
    METHOD_SIGNATURE: /(?<=^\s*)(public|private|protected)?\s*(static)?\s*(\w+(<.*>)?)\s*\w+\s*\(.*\)\s*(;\s*)?({)?\s*((\/\/.*)|(\/\*[\s\S]*?\*\/))*/, //方法签名
    CLASS_SIGNATURE: /(?<=^\s*)(public|private|protected)?\s*(static)?\s*(abstract)?\s*(class|interface)\s+(\w+(<.*>)?)\s*(extends)?\s*([A-Z]\w+(<.*>)?)?\s*{\s*((\/\/.*)|(\/\*[\s\S]*?\*\/))*/, // 类签名
    FIELD_SIGNATURE: /(?<=^\s*)(public|private|protected)?\s*(static)?\s*(\w+(<.*>)?)\s*\w+\s*(=.+)?;\s*((\/\/.*)|(\/\*[\s\S]*?\*\/))*/, // 字段签名
    SEMICOLON: /(?<=^\s*);/, // 分号  
    BLOCK_START: /(?<=^\s*){/, // 代码块开始 
    BLOCK_END: /}/, // 代码块结束
    PAIR: /{|}/g,
    DEP_PACKAGE_NAME: /(?<=import\s+)[^\s].+[^\s]\s*;/g, // 依赖包名
    PACKAGE: /package\s+[^\s].+[^\s]\s*;/, // 文件包名
}