var _ = require('lodash');

var defaults = {

}

module.exports = function(config){
    return _.defaultsDeep(config, defaults);
};
