const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

process.on('SIGINT', () => {
  process.exit();
});

app.use(express.static('public'));
app.use(express.json());

app.get('/', (req, res) => res.sendFile(path.resolve('public/', 'index.html')));

app.get('/notes', (req, res) => res.sendFile(path.resolve('public/', 'notes.html')));

app.get('/api/notes', (req, res) => res.sendFile(path.resolve('db/', 'db.json')));

app.post('/api/notes', (req, res) => {

  const note = req.body;
  let parsed;

  fs.readFile(path.resolve('db/', 'db.json'), 'utf-8', (error, data) => {
    if (error) {
      console.error(error);
      return;
    }

    try {
      parsed = JSON.parse(data);
      if (note.id) {
        for (let thisNote in parsed) {
          if (thisNote.id === note.id) {
            thisNote.title = note.title;
            thisNote.text = note.text;
          }
        }
      } else {
        note.id = (parseInt(parsed[parsed.length - 1].id) + 1).toString();
        parsed.push(note);
      }
      
    } catch {
      parsed = [];
      note.id = "0";
      parsed.push(note);
    }
    
    const str = JSON.stringify(parsed);

    fs.writeFile(path.resolve('db/', 'db.json'), str, error => {
      if (error) console.error(error);
    });
  });

  res.end();
});

app.delete('/api/notes/:id', (req, res) => {

  const id = req.params.id;

  fs.readFile(path.resolve('db/', 'db.json'), 'utf-8', (error, data) => {
    if (error) {
      console.error(error);
      return;
    }

    let parsed = JSON.parse(data);

    parsed = parsed.filter(note => note.id !== id);

    const str = JSON.stringify(parsed);

    fs.writeFile(path.resolve('db/', 'db.json'), str, error => {
      if (error) console.error(error);
    });
  });
  res.end();

})

app.listen(PORT, () => console.log(`App listening on PORT ${PORT}`));