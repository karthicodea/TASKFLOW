const express = require('express')
const cors = require('cors')
const db = require('./db')
const app = express()
const PORT = 5000

app.use(cors())
app.use(express.json())

// Temporary task storage
let tasks = []

// Home route
app.get('/', (req, res) => {
  res.send('TaskFlow Backend is Running! 🚀')
})

// GET - Fetch all tasks from MySQL
app.get('/api/tasks', (req, res) => {
    db.query('SELECT * FROM tasks', (err, results) => {
        if (err) {
            console.log(err)
            return res.status(500).json({
                message: 'Error fetching tasks'
            })
        }

        res.json({
            message: 'Tasks fetched successfully!',
            tasks: results
        })
    })
})

// POST - Create a task in MySQL
app.post('/api/tasks', (req, res) => {
  const { title, priority, dueDate, completed } = req.body

  if (!title) {
    return res.status(400).json({
      message: 'Task title is required!'
    })
  }

  const sql = `
    INSERT INTO tasks (title, priority, dueDate, completed)
    VALUES (?, ?, ?, ?)
  `

  const values = [
    title,
    priority || 'Medium',
    dueDate || '',
    completed ?? false
  ]

  db.query(sql, values, (err, result) => {
    if (err) {
      console.log(err)
      return res.status(500).json({
        message: 'Error creating task'
      })
    }

    res.status(201).json({
      message: 'Task created successfully!',
      task: {
        id: result.insertId,
        title,
        priority: priority || 'Medium',
        dueDate: dueDate || '',
        completed: completed ?? false
      }
    })
  })
})

// PUT - Update a task in MySQL
app.put('/api/tasks/:id', (req, res) => {
  console.log('REQUEST RECEIVED')
  console.log('PUT API HIT:', req.params.id)
  const taskId = Number(req.params.id)

  const { title, priority, dueDate, completed } = req.body

  const sql = `
    UPDATE tasks
    SET title = ?, priority = ?, dueDate = ?, completed = ?
    WHERE id = ?
  `

  db.query(sql, [
    title,
    priority,
    dueDate,
    completed,
    taskId
  ], (err, result) => {
    if (err) {
      console.log(err)
      return res.status(500).json({
        message: 'Error updating task'
      })
    }
console.log('Update result:', result)
    

    res.json({
      message: 'Task updated successfully!'
    })
  })
})

// DELETE - Delete a task from MySQL
app.delete('/api/tasks/:id', (req, res) => {
  const taskId = Number(req.params.id)

  db.query(
    'DELETE FROM tasks WHERE id = ?',
    [taskId],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          message: 'Error deleting task',
          error: err.message
        })
      }

      res.json({
        message: 'Delete request completed',
        taskId: taskId,
        affectedRows: result.affectedRows
      })
    }
  )
})
// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})