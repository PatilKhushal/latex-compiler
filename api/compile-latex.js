const { exec } = require('child_process');
const fs = require('fs');

module.exports = async (req, res) => {
  const latexContent = req.body.latex;
  const filename = 'resume';

  fs.writeFileSync(`/tmp/${filename}.tex`, latexContent);

  exec(`pdflatex -output-directory=/tmp -interaction=nonstopmode /tmp/${filename}.tex`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(500).send('Error compiling LaTeX');
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
