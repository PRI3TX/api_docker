const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// Configuración de middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Para servir CSS e imágenes
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Conexión a MySQL
const db = mysql.createConnection({
  host: 'mysql_taller4',
  user: 'root',
  password: 'admin123',
  database: 'pruebadb'
});

db.connect(err => {
  if (err) {
    console.error('❌ Error al conectar a MySQL:', err.message);
    return;
  }
  console.log('✅ Conectado exitosamente a MySQL');
});

// Página principal
app.get('/', (req, res) => {
  res.render('index');
});

// Crear tabla
app.get('/crear', (req, res) => {
  const sql = `
    CREATE TABLE IF NOT EXISTS estudiantes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(50),
      edad INT
    )
  `;
  db.query(sql, err => {
    if (err) throw err;
    res.send('<h3>✅ Tabla "estudiantes" lista</h3><a href="/">Volver</a>');
  });
});

// Mostrar formulario
app.get('/formulario', (req, res) => {
  res.render('formulario');
});

// Guardar estudiante
app.post('/guardar', (req, res) => {
  const { nombre, edad } = req.body;
  const sql = `INSERT INTO estudiantes (nombre, edad) VALUES (?, ?)`;
  db.query(sql, [nombre, edad], err => {
    if (err) throw err;
    res.redirect('/mostrar');
  });
});

// Mostrar lista
app.get('/mostrar', (req, res) => {
  const sql = `SELECT * FROM estudiantes`;
  db.query(sql, (err, resultados) => {
    if (err) throw err;
    res.render('lista', { estudiantes: resultados });
  });
});

// Editar estudiante
app.get('/editar/:id', (req, res) => {
  const { id } = req.params;
  db.query(`SELECT * FROM estudiantes WHERE id = ?`, [id], (err, result) => {
    if (err) throw err;
    res.render('editar', { estudiante: result[0] });
  });
});

// Actualizar estudiante
app.post('/actualizar/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, edad } = req.body;
  const sql = `UPDATE estudiantes SET nombre = ?, edad = ? WHERE id = ?`;
  db.query(sql, [nombre, edad, id], err => {
    if (err) throw err;
    res.redirect('/mostrar');
  });
});

// Eliminar estudiante
app.get('/eliminar/:id', (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM estudiantes WHERE id = ?`;
  db.query(sql, [id], err => {
    if (err) throw err;
    res.redirect('/mostrar');
  });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});
