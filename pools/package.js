class PackagePool {
    constructor() {
        this.pool = Object.create(null)
    }

    add(name, pkg) {
        this.pool[name] = pkg
    }

    has(name) {
        return this.pool[name]
    }

    get(name) {
        return this.pool[name]
    }

    getPool() {
        return this.pool
    }

}

module.exports = new PackagePool()