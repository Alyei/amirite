"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config;
(function (config) {
    class database {
    }
    database.options = {
        'url_read': 'mongodb://readerino:cisco@localhost:27017/users',
        'url_readWrite': 'mongodb://signup:cisco@localhost:27017/users'
    };
    config.database = database;
})(config = exports.config || (exports.config = {}));
//# sourceMappingURL=database.js.map