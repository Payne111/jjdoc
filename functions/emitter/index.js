const events = require('events');
const emitter = new events.EventEmitter()
emitter.setMaxListeners(100)
module.exports = emitter