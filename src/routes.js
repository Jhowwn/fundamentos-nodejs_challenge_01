import { randomUUID } from 'node:crypto';
import { Database } from './database.js';
import { buildRoutePath } from './utils/build-route-path.js';

const database = new Database();

export const routes = [
  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { title, description } = req.body;

      if (!title) {
        return res.writeHead(400).end(
          JSON.stringify({ message: 'title is required' }),
        )
      }
      if (!description) {
        return res.writeHead(400).end(
          JSON.stringify({ message: 'description is required' }),
        )
      }

      const task = {
        id: randomUUID(),
        title,
        description,
        created_at: new Date(),
        updated_at: new Date(),
        completed_at: null,
      }

      database.insert('tasks', task)

      return res.writeHead(201).end()
    }
  },

  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { search } = req.query

      const tasks = database.select('tasks', {
        title: search,
        description: search
      })

      return res.end(JSON.stringify(tasks))
    }
  },
  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params;
      const { title, description } = req.body;

      const [task] = database.select('tasks', { id });

      if (!task) {
        return res.writeHead(400).end(JSON.stringify({ message: 'Task not found!' }))
      }

      if (!title) {
        database.update('tasks', id, {
          description,
          updated_at: new Date(),
        })
        return res.writeHead(204).end(JSON.stringify({ message: 'title update' }))
      }

      if (!description) {
        database.update('tasks', id, {
          title,
          updated_at: new Date(),
        })
        return res.writeHead(204).end(JSON.stringify({ message: 'describe update!' }))
      }

      database.update('tasks', id, {
        title,
        description,
        updated_at: new Date(),
      })

      return res.writeHead(204).end()
    }
  },
  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id/complete'),
    handler: (req, res) => {
      const { id } = req.params;

      const [task] = database.select('tasks', { id })

      if (!task) {
        return res.writeHead(404).end(JSON.stringify({ message: 'Task not found!' }))
      }

      database.update('tasks', id, {
        completed_at: task.completed_at ? null : new Date(),
      })

      return res.writeHead(204).end()
    }
  },
  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params;

      const [task] = database.select('tasks', { id })

      if (!task) {
        return res.writeHead(404).end(JSON.stringify({ message: 'Task not found' }))
      }

      database.delete('tasks', id)

      res.writeHead(204).end()
    }
  },
]