# Folder Categories (Motrix plugin)

Sorts finished downloads into IDM-style category folders: Compressed, Documents, Music, Programs, Video.

- Extension lists and the target folder for each category are editable in the plugin's **Settings** tab.
- A folder can be a name (created inside the download folder) or an absolute path.
- The **Custom categories** field adds more: `Images=jpg,png;/Users/me/Books=epub,mobi`.

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
