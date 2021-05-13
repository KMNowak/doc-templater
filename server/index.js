const PDFMerger = require('pdf-merger-js');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

const app = express()
app.use(bodyParser.json({ extended: true }));
app.use(cors());
const port = 3001

const mergePDFs = async () => {
  const merger = new PDFMerger()

  merger.add('PDF_1.pdf')
  merger.add('PDF_2.pdf')

  await merger.save('merged.pdf')
}

app.get('/', async (req, res) => {
  res.send('Hello World!')
  await mergePDFs();
})

app.post('/', async (req, res) => {
  res.status(200)
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

// TODO: Image to PDF DONE
// TODO: Docx to PDF with custom lambda
// TODO: Merge pdfs on a client side

