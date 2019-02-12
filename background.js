function refreshPac(proxyConfig) {
    // change autoConfigUrl to dummy
    const originalUrl = proxyConfig.autoConfigUrl;
    proxyConfig.autoConfigUrl = 'http://proxy-reload.firefox.invalid/proxy.pac';
    browser.proxy.settings.set({value: proxyConfig}).then(function (setResult) {
        // rollback
        proxyConfig.autoConfigUrl = originalUrl;
        if (setResult) {
            browser.proxy.settings.set({value: proxyConfig});
        }
        console.log('Temp browserSettings', setResult);
    }).catch(console.log);
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
