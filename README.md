# Folder Categories (Motrix plugin)

Sorts finished downloads into IDM-style category folders: Compressed, Documents, Music, Programs, Video.

- Extension lists and the target folder for each category are editable in the plugin's **Settings** tab.
- A folder can be a name (created inside the download folder) or an absolute path.
- The **Custom categories** field adds more: `Images=jpg,png;/Users/me/Books=epub,mobi`.

## Permissions: why "Broad host access"
Motrix requires every hook to declare `hostPermissions`, and a hook only runs for URLs matching them.
Sorting *every* download needs `<all_urls>`, and no narrower pattern can match "any host", so the install
dialog shows the red warning. The plugin declares **no** `http`, `fs` or `notify` permission, so it cannot
make network requests or read file contents; it only sees the file path and changes where the file is moved.
If you only want some sites sorted, fork and replace `<all_urls>` in `motrix-plugin.json` with specific patterns.

## Install
GitHub: **Plugins → Add plugin → GitHub** → `Ashkan4472/motrix-folder-categories`, or download the `.moext`
from Releases and use **Local file**.

## Limits (Motrix plugin API)
- Files are moved when the download finishes; plugins cannot change the save folder beforehand
  (`beforeCreate` only accepts a plain basename) or hook into the New Task dialog.
- Settings cannot contain buttons, so there is no "create folders" action; Motrix creates a folder on first use.

## Develop
```
pnpm install
pnpm dev                          # run Motrix with the plugin loaded
pnpm exec motrix-plugin validate
pnpm run pack && pnpm exec motrix-plugin lint
```
Install the packed `dist/*.moext` via **Plugins → Add plugin → Local file**.
