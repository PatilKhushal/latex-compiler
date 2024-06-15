const { exec } = require('child_process');
const fs = require('fs');

module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const latexContent = req.body.latex;
  const filename = 'resume';

  fs.writeFileSync(`/tmp/${filename}.tex`, latexContent);

  exec(`pdflatex -output-directory=/tmp -interaction=nonstopmode /tmp/${filename}.tex`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(500).end(`Error compiling LaTeX => ${error}`);
    }
    const pdf = fs.readFileSync(`/tmp/${filename}.pdf`);
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdf);

    // Clean up auxiliary files generated by LaTeX
    fs.unlinkSync(`/tmp/${filename}.tex`);
    fs.unlinkSync(`/tmp/${filename}.pdf`);
    fs.unlinkSync(`/tmp/${filename}.log`);
    fs.unlinkSync(`/tmp/${filename}.aux`);
  });
};
