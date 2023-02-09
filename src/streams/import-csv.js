import { parse } from 'csv-parse'
import fs from 'node:fs'

const csvToImport = new URL('./tasks.csv', import.meta.url)

const stream = fs.createReadStream(csvToImport)

const DEFAULT_OPTION = parse({
  delimiter: ',',
  skip_empty_lines: true,
  from_line: 2
})


async function importCSV() {
  const lines = stream.pipe(DEFAULT_OPTION)

  for await (const line of lines) {
    const [title, description] = line;

    await fetch('http://localhost:3333/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title,
        description
      })
    })
  }
}

importCSV()