chrome.runtime.onInstalled.addListener(() => {
    const defaultEngines = [
        { id: "wikipedia", name: "Wikipedia", url: "https://en.wikipedia.org/w/index.php?search={{query}}" },
        { id: "youtube", name: "YouTube", url: "https://www.youtube.com/results?search_query={{query}}" },
        { id: "google", name: "Google", url: "https://www.google.com/search?q={{query}}" }
    ];

    chrome.storage.sync.get("searchEngines", (data) => {
        if (data.searchEngines) {
            createContextMenus(data.searchEngines);
        } else {
            // storage.onChanged builds the menus
            chrome.storage.sync.set({ searchEngines: defaultEngines });
        }
    });
});

function createContextMenus(engines) {
    chrome.contextMenus.removeAll(() => {
        chrome.contextMenus.create({
            id: "snipsearch_root",
            title: "QueryHop: “%s”",
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

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "snipsearch_settings") {
        chrome.runtime.openOptionsPage();
        return;
    }

    chrome.storage.sync.get("searchEngines", (data) => {
        const engine = (data.searchEngines || []).find(e => e.id === info.menuItemId);
        if (engine && info.selectionText) {
            const query = encodeURIComponent(info.selectionText);
            // Engines saved before v0.3 have no placeholder: append the query
            const url = engine.url.includes("{{query}}")
                ? engine.url.replaceAll("{{query}}", query)
                : engine.url + query;
            // Open next to the current tab when the click comes from a regular tab
            chrome.tabs.create(tab && tab.id >= 0
                ? { url, windowId: tab.windowId, index: tab.index + 1, openerTabId: tab.id }
                : { url });
        }
    });
});

chrome.storage.onChanged.addListener((changes) => {
    if (changes.searchEngines) {
        createContextMenus(changes.searchEngines.newValue);
    }
});
