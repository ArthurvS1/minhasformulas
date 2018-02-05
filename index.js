const express = require('express');
const app     = express();
const path    = require('path');
const srcPath = path.join(__dirname, 'src');

const sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('formulas');

app.set('port', (process.env.PORT || 3000));
app.use('/js', express.static(path.join(srcPath, 'js')));
app.use('/css', express.static(path.join(srcPath, 'css')));

app.get('/', (req, res) => {
	res.sendFile(path.join(srcPath, 'index.html'));
});

app.get('/search/all', (req, res) => {
	db.all('SELECT * FROM formulas ORDER BY materia', (err, rs) => {
		res.json(rs);
	});
});

app.get('/search/:query', (req, res) => {
	db.all(`SELECT * FROM formulas WHERE (LOWER(titulo) LIKE LOWER('%${req.params.query}%') OR LOWER(keywords) LIKE LOWER('%${req.params.query}%'))`, (err, rs) => {
		res.json(rs);
	});
});

app.get('/search/get/:id', (req, res) => {
	let id = +req.params.id;
	db.all('SELECT * FROM formulas WHERE id=' + id, (err, rs) => {
		res.json(rs);
	});
})

app.listen(app.get('port'));