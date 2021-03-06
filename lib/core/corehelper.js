
let instance = null;
module.exports = function(options){
  if (!instance){
    instance = new CoreHelper(options);
  }
  return instance;
};


// setup the logger
global.logger = require('./logger');


var EventEmitter = require('events');
var mongoose = require('mongoose');
var Promise = require('bluebird');

class CoreHelper extends EventEmitter {
  constructor(options){
    super();
    this.config = require('./config');
    this._options = options;
    logger.debug('this.config.log_level = ' + this.config.log_level);
    if (options.db) {
      if ('debug' === this.config.log_level) {
        global.logger.info('set mongoose.debug to true');
        mongoose.set('debug', true);
      }
      mongoose.Promise = Promise;
      mongoose.connect(this.config.mongo_url);
      require('mongoose-auto-increment').initialize(mongoose.connection);
      mongoose.connection.once('open', function() {
        global.logger.info('Connected to MongoDB');
        this.dbReady();
      }.bind(this)).on('error', function(err) {
        global.logger.error('MongoDB Connection Error. Please make sure that MongoDB is running.');
        global.logger.error(err);
        process.exit(1);
      });
      process.on('SIGINT', function() {
        mongoose.disconnect(function(err) {
          process.exit(err ? 1 : 0);
        });
      });
    } else {
      this.dbReady();
    }
  }

  dbReady(){
    var me = this;
    me.emit('ready');
  }
}