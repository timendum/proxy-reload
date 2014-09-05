const buttons = require('sdk/ui/button/action');
const {Cc, Cu} = require('chrome');

Cu.import("resource://gre/modules/Services.jsm");


var button = buttons.ActionButton({
  id: "proxy-pac-reload",
  label: "Reload PAC",
  icon: {
    "32": "./icon-32.png",
    "64": "./icon-64.png"
  },
  onClick: handleClick
});

function handleClick(state) {
    Cc["@mozilla.org/network/protocol-proxy-service;1"].
        getService().reloadPAC();
}