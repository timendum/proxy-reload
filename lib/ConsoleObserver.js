const {Ci, Cu} = require('chrome');

Cu.import("resource://gre/modules/Services.jsm");

// save all object to unregister them on unload
var objects = [];


function UserAgentChanger(begin, callback) {
    this.begin = begin;
    this.callback = callback;

    // save for unregister on unload
    objects.push(this);
}

/**
 * Start changing the user agent for the specified host
 */
UserAgentChanger.prototype.register = function() {
    if (!this.observer) {
        var observer = {
            begin: this.begin,
            callback: this.callback,
            observe: function(subject, topic, data) {
                let consoleMsg = subject.wrappedJSObject;
                let msgData = {
                    level: consoleMsg.level,
                    filename: consoleMsg.filename,
                    lineNumber: consoleMsg.lineNumber,
                    functionName: consoleMsg.functionName,
                    timeStamp: consoleMsg.timeStamp,
                    arguments: [],
                };
            }
        };

        this.observer = observer;
    }

    Services.obs.addObserver(this.observer, "http-on-modify-request", false);
}

/**
 * Stop changing the user agent. Does nothing when the changer is not registered
 */
UserAgentChanger.prototype.unregister = function() {
    if(this.observer) {
        Services.obs.removeObserver(this.observer, "http-on-modify-request");
        delete this.observer;
    }
}

/**
 * Unregister objects on unload
 */
require("sdk/system/unload").when(function() {
    for(let obj of objects) {
        obj.unregister();
    }
    objects = [];
});



// export ConsoleObserver
exports.ConsoleObserver = ConsoleObserver;