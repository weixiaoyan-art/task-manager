import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // GET /api/tasks - 按创建时间倒序返回所有任务
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return res.status(500).json({ error: error.message })
    }
    return res.status(200).json(data)
  }

  // POST /api/tasks - 添加任务
  if (req.method === 'POST') {
    const { title, priority } = req.body
    if (!title) {
      return res.status(400).json({ error: 'title is required' })
    }
    const { data, error } = await supabase
      .from('tasks')
      .insert([{ title, priority: priority || '中', completed: false }])
      .select()

    if (error) {
      return res.status(500).json({ error: error.message })
    }
    return res.status(201).json(data[0])
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
