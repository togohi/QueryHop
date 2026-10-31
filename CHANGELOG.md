# Changelog

## [0.3] - 2026-10-31

### Changed
- **Renamed to QueryHop** — The extension, context menu, options page and export file (`queryhop_engines.json`) now use the new name. Existing engines and settings are kept.
- **New icon** — Redesigned icon, shipped in 16, 32, 48 and 128 px instead of a single 1024 px image.
- **Context menu shows the selection** — The root item now reads `QueryHop: "<selected text>"`.
- **Tabs open next to the current one** — Search results open right after the tab where the search started.
- **Wikipedia default** — New installs use Wikipedia's search page, which jumps to the article on an exact match.

### Fixed
- **`{{query}}` anywhere in the URL** — The placeholder was always moved to the end of the URL, breaking templates like `...?text={{query}}&op=translate`. Engines saved by older versions keep working.
- **Silent save failures** — Errors when saving (e.g. the `storage.sync` size limit) are now reported and the list is reloaded from storage.
- **Duplicate menu items on install** — Menus were built twice on first install, logging `duplicate id` errors.
- **Import** — The same file can be imported twice in a row; files with duplicate or reserved IDs are rejected.
- **Drag & drop** — Dropping text or files onto a row no longer moves a previously dragged engine.
- **Edit mode** — Deleting the engine being edited now resets the form.

---

## [0.2] - 2026-03-19

### Added
- **Settings in context menu** — A separator and a "Settings" option are now shown at the bottom of the SnipSearch context menu. Clicking it opens the extension's options page directly.
- **Cancel button in edit mode** — When editing an existing search engine, a Cancel button appears next to Update. Clicking it discards changes and clears the form.
- **Drag handle column** — A grip icon is now displayed on each row of the engine list to indicate that rows can be reordered by dragging.
- **Sort by Name** — The Name column header now includes a sort button. Clicking it sorts the list alphabetically (A→Z); clicking again reverses the order (Z→A). Manually dragging a row resets the sort state.

---

## [0.1] - Initial release

- Search selected text via the context menu in multiple configurable search engines.
- Options page to add, edit, delete, reorder (drag & drop), export and import search engines.
