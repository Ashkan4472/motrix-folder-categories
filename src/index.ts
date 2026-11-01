import { config, hooks, log } from 'motrix:plugin-api'

// Config key -> [folder, default extensions]. Defaults mirror motrix-plugin.json; used when a setting is unset.
const FOLDERS: Record<string, [string, string]> = {
  compressed: ['Compressed', 'zip,rar,7z,gz,gzip,tar,tgz,bz2,xz,z,cab,arj,lzh,lha,ace,sit,sitx,jar'],
  documents: ['Documents', 'pdf,doc,docx,xls,xlsx,ppt,pptx,txt,rtf,odt,ods,odp,csv,epub,chm'],
  music: ['Music', 'mp3,wav,wma,ogg,flac,aac,m4a,mid,midi,aif,aiff,ra,ape,opus'],
  programs: ['Programs', 'exe,msi,dmg,pkg,deb,rpm,apk,appimage,bin,iso,bat'],
  video: ['Video', 'mp4,mkv,avi,mov,wmv,flv,webm,mpg,mpeg,m4v,3gp,ts,vob,asf,rm,ogv'],
}

const split = (s: string | undefined, sep: string) =>
  (s ?? '').split(sep).map((x) => x.trim().replace(/^\./, '').toLowerCase()).filter(Boolean)

// Extension -> folder (relative name or absolute path). `custom` ("Images=jpg,png;Books=epub") is applied last so it wins.
async function loadRules(): Promise<Map<string, string>> {
  const rules = new Map<string, string>()
  for (const [key, [folder, defaults]] of Object.entries(FOLDERS)) {
    for (const ext of split((await config.get<string>(key)) ?? defaults, ',')) rules.set(ext, ((await config.get<string>(`${key}Path`)) ?? '').trim() || folder)
  }
  const custom = (await config.get<string>('custom')) ?? ''
  for (const entry of custom.split(';')) {
    const [folder, exts] = entry.split('=')
    if (!folder?.trim() || !exts) continue
    for (const ext of split(exts, ',')) rules.set(ext, folder.trim())
  }
  return rules
}

// A throwing hook must never fail or block a download (or its retry): log and pass the task through untouched.
async function safe<T>(stage: string, ctx: T, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (e) {
    log.error('hook failed, task left unchanged', { stage, error: String(e) })
    return ctx
  }
}

const isAbs = (p: string) => /^([a-zA-Z]:[\\/]|[\\/])/.test(p)

const folderFor = async (name: string) => {
  const dot = name.lastIndexOf('.')
  return dot < 0 ? undefined : (await loadRules()).get(name.slice(dot + 1).toLowerCase())
}

// Motrix rejects folders in beforeCreate ("must be a basename") and saveDir is read-only, so the move happens at finalize.
hooks.beforeFinalize(async (ctx) => safe('finalize', ctx, async () => {
  const target = ctx.filePath
  const sep = target.includes('\\') ? '\\' : '/'
  const i = target.lastIndexOf(sep)
  const dir = target.slice(0, i)
  const name = target.slice(i + 1)
  const folder = await folderFor(name)
  if (!folder) return ctx
  const dest = (isAbs(folder) ? folder : `${dir}${sep}${folder}`).replace(/[\\/]+$/, '')
  if (dir === dest || dir.endsWith(`${sep}${folder}`)) return ctx
  log.info('categorising at finalize', { from: target, to: `${dest}${sep}${name}` })
  ctx.update({ filePath: `${dest}${sep}${name}` })
  return ctx
}))

hooks.onError(async (ctx) => {
  log.warn('task failed', { code: ctx.error.code, file: ctx.filePath })
})
