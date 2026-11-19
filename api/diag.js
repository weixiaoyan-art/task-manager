// Temporary diagnostic endpoint: reports env presence and raw fetch error cause.
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  const url = process.env.SUPABASE_URL || ''
  const key = process.env.SUPABASE_ANON_KEY || ''

  let host = ''
  try { host = new URL(url).host } catch { host = '(invalid url)' }

  const out = {
    urlSet: Boolean(url),
    keySet: Boolean(key),
    host,
    urlHead: url ? url.slice(0, 30) : '',
  }

  if (!url) {
    return res.status(200).json({ ...out, note: 'SUPABASE_URL is empty' })
  }

  try {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 8000)
    const r = await fetch(url.replace(/\/$/, '') + '/rest/v1/tasks?select=id', {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: ctrl.signal,
    })
    clearTimeout(t)
    out.status = r.status
    out.statusText = r.statusText
    out.bodyHead = (await r.text()).slice(0, 200)
    return res.status(200).json(out)
  } catch (e) {
    out.causeCode = e.cause && e.cause.code
    out.causeMessage = e.cause && e.cause.message
    out.error = e.message
    return res.status(200).json(out)
  }
}
