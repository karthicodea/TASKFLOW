import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [tasks, setTasks] = useState([])
  

  const [taskName, setTaskName] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [dueDate, setDueDate] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [editingId, setEditingId] = useState(null)

  
  // Test Backend Connection
  useEffect(() => {
  fetch('http://localhost:5000/api/tasks')
    .then(response => response.json())
    .then(data => {
      setTasks(data.tasks.map(task => ({
        ...task,
        completed: Boolean(task.completed)
      })))
    })
    .catch(error => {
      console.error('Backend Error:', error)
    })
}, [])

  // Add or Update Task
  function saveTask() {
    if (editingId !== null) {
  const updatedTask = tasks.find(task => task.id === editingId)

  fetch(`http://localhost:5000/api/tasks/${editingId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: taskName,
      priority: priority,
      dueDate: dueDate,
      completed: updatedTask.completed
    })
  })
    .then(response => response.json())
    .then(() => {
      setTasks(tasks.map(task =>
        task.id === editingId
          ? {
              ...task,
              title: taskName,
              priority: priority,
              dueDate: dueDate
            }
          : task
      ))
      setEditingId(null)
    })
    .catch(error => {
      console.error('Error updating task:', error)
    })

    }  else {
  fetch('http://localhost:5000/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: taskName,
      priority: priority,
      dueDate: dueDate,
      completed: false
    })
  })
    .then(response => response.json())
    .then(data => {
      setTasks([...tasks, {
        ...data.task,
        completed: Boolean(data.task.completed)
      }])
    })
    .catch(error => {
      console.error('Error adding task:', error)
    })
}
  }
  // Edit Task
  function editTask(task) {
    setEditingId(task.id)
    setTaskName(task.title)
    setPriority(task.priority)
    setDueDate(task.dueDate || '')
  }

  // Cancel Editing
  function cancelEdit() {
    setEditingId(null)
    setTaskName('')
    setPriority('Medium')
    setDueDate('')
  }

  // Delete Task
 function deleteTask(id) {
  fetch(`http://localhost:5000/api/tasks/${id}`, {
    method: 'DELETE'
  })
    .then(response => response.json())
    .then(() => {
      setTasks(tasks.filter(task => task.id !== id))

      if (editingId === id) {
        cancelEdit()
      }
    })
    .catch(error => {
      console.error('Error deleting task:', error)
    })
}

  // Complete or Undo Task
  function toggleTask(id) {
  const task = tasks.find(task => task.id === id)
  const updatedCompleted = !task.completed

  fetch(`http://localhost:5000/api/tasks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: task.title,
      priority: task.priority,
      dueDate: task.dueDate,
      completed: updatedCompleted
    })
  })
    .then(response => response.json())
    .then(() => {
      setTasks(tasks.map(task =>
        task.id === id
          ? { ...task, completed: updatedCompleted }
          : task
      ))
    })
    .catch(error => {
      console.error('Error updating task status:', error)
    })
}

  // Dashboard Calculations
  const completedTasks = tasks.filter(
    task => task.completed
  ).length

  const pendingTasks = tasks.length - completedTasks

  const totalTasks = tasks.length

  // Progress Percentage
  const progress =
    totalTasks === 0
      ? 0
      : Math.round((completedTasks / totalTasks) * 100)

  // Overdue Task Check
  const today = new Date().toLocaleDateString('en-CA')

  function isOverdue(task) {
    return (
      task.dueDate &&
      task.dueDate < today &&
      !task.completed
    )
  }

  // Overdue Task Count
  const overdueTasks = tasks.filter(
    task => isOverdue(task)
  ).length

  // Search and Filter
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title
      .toLowerCase()
      .includes(search.toLowerCase())

    const matchesFilter =
      filter === 'All' ||
      (filter === 'Pending' && !task.completed) ||
      (filter === 'Completed' && task.completed)

    return matchesSearch && matchesFilter
  })

  return (
    <div className="dashboard">

      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="logo">
          TaskFlow<span>.</span>
        </h2>

        <p className="menu-title">MENU</p>

        <div className="menu-item active">▦ Dashboard</div>
        <div className="menu-item">✓ My Tasks</div>
        <div className="menu-item">⚙ Settings</div>

        <div className="sidebar-bottom">
          <p>Stay organized.</p>
          <small>One task at a time ✨</small>
        </div>
      </aside>

      {/* Main Dashboard */}
      <main className="main-content">

        {/* Header */}
        <header className="topbar">
          <div>
            <h1>Dashboard</h1>
            <p>Welcome back! Let's organize your day.</p>
          </div>

          <div className="profile">
            <div className="avatar">K</div>
            <span>My Workspace</span>
          </div>
        </header>

        {/* Summary Cards */}
        <section className="stats">

          {/* Total Tasks */}
          <div className="stat-card purple">
            <p>Total Tasks</p>
            <h2>{totalTasks}</h2>
            <span>All your tasks</span>
          </div>

          {/* Pending Tasks */}
          <div className="stat-card blue">
            <p>Pending</p>
            <h2>{pendingTasks}</h2>
            <span>Tasks to complete</span>
          </div>

          {/* Completed Tasks */}
          <div className="stat-card green">
            <p>Completed</p>
            <h2>{completedTasks}</h2>
            <span>Tasks finished</span>
          </div>

          {/* Overdue Tasks */}
          <div className="stat-card red">
            <p>Overdue</p>
            <h2>{overdueTasks}</h2>
            <span>Past deadline</span>
          </div>

        </section>

        {/* Progress Bar */}
        <section className="progress-section">

          <div className="progress-header">
            <h3>Task Progress</h3>
            <span>{progress}%</span>
          </div>

          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <p>
            {completedTasks} of {totalTasks} tasks completed
          </p>

        </section>

        {/* Task Section */}
        <section className="task-section">

          <div className="section-header">
            <h2>My Tasks</h2>
            <p>Manage your daily activities</p>
          </div>

          {/* Task Input */}
          <div className="task-input">

            <input
              type="text"
              placeholder="What do you need to do?"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveTask()
              }}
            />

            {/* Priority */}
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>

            {/* Due Date */}
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />

            {/* Add or Update Task */}
            <button onClick={saveTask}>
              {editingId !== null
                ? 'Update Task'
                : '+ Add Task'}
            </button>

            {/* Cancel Editing */}
            {editingId !== null && (
              <button
                className="cancel-btn"
                onClick={cancelEdit}
              >
                Cancel
              </button>
            )}

          </div>

          {/* Search and Filter */}
          <div className="task-tools">

            {/* Search */}
            <input
              type="text"
              placeholder="🔍 Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {/* Filter */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All">All Tasks</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
            </select>

          </div>

          {/* Task List */}
          {filteredTasks.length === 0 ? (

            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>No tasks found</h3>
              <p>Add a task or change your search/filter.</p>
            </div>

          ) : (

            <div className="task-list">

              {filteredTasks.map(task => (

                <div className="task-item" key={task.id}>

                  <div className="task-left">

                    {/* Complete Button */}
                    <button
                      className={`check-btn ${
                        task.completed ? 'checked' : ''
                      }`}
                      onClick={() => toggleTask(task.id)}
                    >
                      {task.completed ? '✓' : ''}
                    </button>

                    {/* Task Details */}
                    <div className="task-details">

                      {/* Task Title */}
                      <span
                        className={
                          task.completed ? 'completed' : ''
                        }
                      >
                        {task.title}
                      </span>

                      {/* Due Date */}
                      {task.dueDate && (
                        <small className="due-date">
                          📅 Due: {task.dueDate}
                        </small>
                      )}

                      {/* Overdue Label */}
                      {isOverdue(task) && (
                        <small className="overdue-label">
                          ⚠ Overdue
                        </small>
                      )}

                    </div>

                    {/* Priority */}
                    <span
                      className={`priority ${task.priority.toLowerCase()}`}
                    >
                      {task.priority}
                    </span>

                  </div>

                  {/* Edit and Delete */}
                  <div className="task-actions">

                    {/* Edit */}
                    <button
                      className="edit-btn"
                      onClick={() => editTask(task)}
                    >
                      Edit
                    </button>

                    {/* Delete */}
                    <button
                      className="delete-btn"
                      onClick={() => deleteTask(task.id)}
                    >
                      Delete
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

      </main>

       </div>
  )
}

export default App