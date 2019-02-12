function refreshPac(proxyConfig) {
    // change autoConfigUrl to dummy
    console.debug("(proxy-reload) Original config: " + JSON.stringify(proxyConfig));
    const originalUrl = proxyConfig.autoConfigUrl;
    proxyConfig.autoConfigUrl = 'http://proxy-reload.firefox.invalid/proxy.pac';
    browser.proxy.settings.set({value: proxyConfig}).catch(function (e) {
        console.error("(proxy-reload) Invalid proxy config, overwriting (catched: " + e + ")");
        proxyConfig = {
            proxyType: 'autoConfig',
            autoConfigUrl: 'http://example.invalid/',
            autoLogin: proxyConfig.autoLogin,
            proxyDNS: proxyConfig.proxyDNS,
        };
        return browser.proxy.settings.set({value: proxyConfig});
    }).then(function (setResult) {
        // rollback
        proxyConfig.autoConfigUrl = originalUrl;
        if (setResult) {
            browser.proxy.settings.set({value: proxyConfig});
        }
        console.log('(proxy-reload) Temp browserSettings', setResult);
    }).catch((e) => {
        console.error("(proxy-reload) Error with " + proxyConfig.autoConfigUrl + " - " + e);
    });
}

browser.browserAction.onClicked.addListener(() => {
    browser.proxy.settings.get({}).then(function (setting) {
        const proxyConfig = setting.value;
        if (proxyConfig.proxyType !== 'autoConfig') {
            console.log('PAC not enabled in setting');
        } else {
            refreshPac(proxyConfig);
        }
    });
});
