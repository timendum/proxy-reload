function checkPrivate() {
    return browser.extension.isAllowedIncognitoAccess().then((answer) => {
        if (answer) {
            return;
        }
        browser.notifications.create({
            "type": "basic",
            "title": "Reload PAC error",
            "message": `Reload PAC needs private window access to work.
This is a known Firefox limitation.

Click for info.`,
            "iconUrl": browser.runtime.getURL("icon-full.png"),
        });
        throw new Error('No private window access');
    });
}

function refreshPac(proxyConfig) {
    // change autoConfigUrl to dummy
    console.debug("Original config: " + JSON.stringify(proxyConfig));
    proxyConfig.autoConfigUrl = 'http://proxy-reload.firefox.invalid/proxy.pac';
    browser.proxy.settings.set({ value: proxyConfig })
        .catch((e) => {
            console.error(`Invalid proxy config, overwriting (catched: ${e} )`);
            return browser.proxy.settings.set({
                value: {
                    proxyType: 'autoConfig',
                    autoConfigUrl: 'http://example.invalid/',
                    autoLogin: proxyConfig.autoLogin,
                    proxyDNS: proxyConfig.proxyDNS
                }
            });
        })
        .then((setResult) => {
            // rollback
            if (setResult) {
                browser.proxy.settings.set({ value: proxyConfig });
            }
            console.log("Temp browserSettings", setResult);
        })
        .catch((e) => {
            console.error(`Error with ${proxyConfig.autoConfigUrl} - ${e}`);
        });
}

browser.browserAction.onClicked.addListener(() => {
    checkPrivate().then(() => {
        return browser.proxy.settings.get({});
    })
    .then((setting) => {
        const proxyConfig = setting.value;
        if (proxyConfig.proxyType !== 'autoConfig') {
            console.log('PAC not enabled in setting');
            throw new Error('PAC not enabled in setting');
        } else {
            return refreshPac(proxyConfig);
        }
    });
});

browser.notifications.onClicked.addListener(() => {
    browser.tabs.create({
        "url": "https://support.mozilla.org/kb/extensions-private-browsing#w_enabling-or-disabling-extensions-in-private-windows"
    });
});
