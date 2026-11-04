import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { id, completed } = req.body

  // PUT /api/task - 切换完成状态
  if (req.method === 'PUT') {
    const { data, error } = await supabase
      .from('tasks')
      .update({ completed })
      .eq('id', id)
      .select()

    if (error) {
      return res.status(500).json({ error: error.message })
    }
    return res.status(200).json(data[0])
  }

  // DELETE /api/task - 删除任务
  if (req.method === 'DELETE') {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)

    if (error) {
      return res.status(500).json({ error: error.message })
    }
    return res.status(204).end()
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
