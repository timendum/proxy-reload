function refreshPac(proxyConfig) {
    // change proxyType to none
    const originalUrl = proxyConfig.autoConfigUrl;
    proxyConfig.autoConfigUrl = 'http://example.com/';
    browser.browserSettings.proxyConfig.set({value: proxyConfig}).then(function (setResult) {
        // rollback
        proxyConfig.autoConfigUrl = originalUrl;
        if (setResult) {
            return browser.browserSettings.proxyConfig.set({value: proxyConfig});
        }
        console.log('Temp browserSettings', setResult);
    }).catch(console.log);
}

browser.browserAction.onClicked.addListener(() => {
    browser.browserSettings.proxyConfig.get({}).then(function (setting) {
        const proxyConfig = setting.value;
        if (proxyConfig.proxyType !== 'autoConfig') {
            console.log('PAC not enabled in setting');
        } else {
            refreshPac(proxyConfig);
        }
    });
});
