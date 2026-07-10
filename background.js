chrome.runtime.onInstalled.addListener(() => {
    const defaultEngines = [
        { id: "wikipedia", name: "Wikipedia", url: "https://en.wikipedia.org/wiki/" },
        { id: "youtube", name: "YouTube", url: "https://www.youtube.com/results?search_query=" },
        { id: "google", name: "Google", url: "https://www.google.com/search?q=" }
    ];

    chrome.storage.sync.get("searchEngines", (data) => {
        const engines = data.searchEngines || defaultEngines;
        chrome.storage.sync.set({ searchEngines: engines }, () => {
            createContextMenus(engines);
        });
    });
});

function createContextMenus(engines) {
    chrome.contextMenus.removeAll(() => {
        chrome.contextMenus.create({
            id: "snipsearch_root",
            title: "SnipSearch",
            contexts: ["selection"]
        });

        engines.forEach(engine => {
            chrome.contextMenus.create({
                id: engine.id,
                parentId: "snipsearch_root",
                title: `Search in ${engine.name}`,
                contexts: ["selection"]
            });
        });

        chrome.contextMenus.create({
            id: "snipsearch_separator",
            parentId: "snipsearch_root",
            type: "separator",
            contexts: ["selection"]
        });

        chrome.contextMenus.create({
            id: "snipsearch_settings",
            parentId: "snipsearch_root",
            title: "Settings",
            contexts: ["selection"]
        });
    });
}

chrome.contextMenus.onClicked.addListener((info) => {
    if (info.menuItemId === "snipsearch_settings") {
        chrome.runtime.openOptionsPage();
        return;
    }

    chrome.storage.sync.get("searchEngines", (data) => {
        const engine = data.searchEngines.find(e => e.id === info.menuItemId);
        if (engine && info.selectionText) {
            const query = encodeURIComponent(info.selectionText);
            chrome.tabs.create({ url: engine.url + query });
        }
    });
});

chrome.storage.onChanged.addListener((changes) => {
    if (changes.searchEngines) {
        createContextMenus(changes.searchEngines.newValue);
    }
});
