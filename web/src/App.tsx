import React, { useState } from 'react'
import printJS from 'print-js'
import { Button, Form, Input, Typography } from 'antd'
import './App.css'
import { ImageUploader } from './imageUploader/ImageUploader'

const LOCALHOST_SERVER_URL = 'http://localhost:3001/';

function App() {
  const [input1, setInput1] = useState('')

  const onClickPrint = async () => {
    printJS({
      printable: ['merged.pdf'],
      type: 'pdf',
      showModal: true,
    })
  }

  const onClickMerge = async () => {
    await fetch(LOCALHOST_SERVER_URL, {
      method: 'GET'
    })
  }

  const onClickFill = (input1: string = 'placeholder') => {
    return fetch(LOCALHOST_SERVER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input1 }),
    })
  }

  return (
    <body className="App">
      <main>
        <Form>
          <Typography>Please provide data and then press "Fill Template" button </Typography>
          <Form.Item
            label={'Input 1'}
          >
            <Input
              onChange={e => setInput1(e.target.value)}
            />
          </Form.Item>
          <p>{input1}</p>
          <Form.Item>
            <Button
              type={'primary'}
              onClick={() => onClickFill(input1)}
            >
              Fill template
            </Button>
          </Form.Item>
        </Form>
        <Button
          type={'primary'}
          onClick={onClickPrint}
        >
          Print template
        </Button>

        <Button
          type={'primary'}
          onClick={onClickMerge}
        >
          Merge PDFs
        </Button>
        <ImageUploader />
      </main>
    </body>
  )
}

export default App
