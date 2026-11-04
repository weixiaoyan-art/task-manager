import { useState, useEffect } from 'react'

function App() {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('中')
  const [tasks, setTasks] = useState([])
  const [filter, setFilter] = useState('全部')
  const [loading, setLoading] = useState(false)

  const fetchTasks = async (priorityFilter = '全部') => {
    setLoading(true)
    try {
      const res = await fetch('/api/tasks')
      const data = await res.json()
      setTasks(data || [])
    } catch (e) {
      console.error('获取任务失败', e)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const addTask = async () => {
    if (!title.trim()) return
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), priority }),
      })
      setTitle('')
      fetchTasks()
    } catch (e) {
      console.error('添加失败', e)
    }
  }

  const toggleTask = async (task) => {
    try {
      await fetch('/api/task', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: task.id, completed: !task.completed }),
      })
      fetchTasks()
    } catch (e) {
      console.error('切换失败', e)
    }
  }

  const deleteTask = async (id) => {
    try {
      await fetch('/api/task', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      fetchTasks()
    } catch (e) {
      console.error('删除失败', e)
    }
  }

  const filteredTasks = tasks.filter((t) => {
    if (filter === '全部') return true
    return t.priority === filter
  })

  const priorityColor = {
    '高': '#e74c3c',
    '中': '#f39c12',
    '低': '#27ae60',
  }

  return (
    <div className="container">
      <h1>智能任务管理</h1>

      <div className="add-form">
        <input
          type="text"
          placeholder="输入任务标题..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
        />
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="高">高优先级</option>
          <option value="中">中优先级</option>
          <option value="低">低优先级</option>
        </select>
        <button onClick={addTask}>添加任务</button>
      </div>

      <div className="filter-bar">
        {['全部', '高', '中', '低'].map((p) => (
          <button
            key={p}
            className={filter === p ? 'active' : ''}
            onClick={() => setFilter(p)}
          >
            {p}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="hint">加载中...</p>
      ) : filteredTasks.length === 0 ? (
        <p className="hint">暂无任务，添加一个吧～</p>
      ) : (
        <ul className="task-list">
          {filteredTasks.map((task) => (
            <li key={task.id} className="task-item">
              <span
                className="priority-tag"
                style={{ background: priorityColor[task.priority] || '#999' }}
              >
                {task.priority}
              </span>
              <span className={task.completed ? 'task-title done' : 'task-title'}>
                {task.title}
              </span>
              <div className="task-actions">
                <button onClick={() => toggleTask(task)}>
                  {task.completed ? '取消完成' : '标记完成'}
                </button>
                <button className="delete-btn" onClick={() => deleteTask(task.id)}>
                  删除
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default App
