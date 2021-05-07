const PDFMerger = require('pdf-merger-js');
const express = require('express');
const bodyParser = require('body-parser');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

const app = express()
app.use(bodyParser.urlencoded({ extended: true }));
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
  const { input1 } = req.body;

  console.log(req.body);

  res.status(200)
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

//
// TODO: Image to PDF
// TODO: Docx to PDF with Microsoft 365
// TODO:

