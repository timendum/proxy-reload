function checkPrivate() {
	return browser.extension.isAllowedIncognitoAccess().then(function(answer) {
		if (answer) {
			return
		}
		browser.notifications.create({
			"type": "basic",
			"title": "Reload PAC error",
			"message": "Reload PAC needs private window access to work.\nThis is a known Firefox limitation.\n\nClick for info.",
			"iconUrl": browser.runtime.getURL("icon-full.png"),
		});
		return Promise.reject('No private window access');
	})
}

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
			proxyDNS: proxyConfig.proxyDNS
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
            checkPrivate().then(refreshPac(proxyConfig));
        }
    });
});

browser.notifications.onClicked.addListener(function(notificationId) {
    browser.tabs.create({
        "url": "https://support.mozilla.org/kb/extensions-private-browsing#w_enabling-or-disabling-extensions-in-private-windows"
    });
});