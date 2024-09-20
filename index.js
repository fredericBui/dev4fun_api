const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors'); // Importer CORS


const app = express();
const PORT = 3000;

app.use(cors());
// Middleware pour analyser le corps des requêtes JSON
app.use(bodyParser.json());

// Connexion à la base de données SQLite
const db = new sqlite3.Database('database.db', (err) => {
  if (err) {
    console.error('Erreur lors de l\'ouverture de la base de données:', err.message);
  } else {
    console.log('Connexion à la base de données SQLite réussie.');
  }
});

// Création d'une table "participation" si elle n'existe pas déjà
db.run(`CREATE TABLE IF NOT EXISTS participation (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT
)`);

// Route pour créer un utilisateur
app.post('/participation', (req, res) => {
  const { code } = req.body;
  db.run('INSERT INTO participation (code) VALUES (?)', [code], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(201).json({ id: this.lastID });
    }
  });
});

// Route pour obtenir tous les utilisateurs
app.get('/participation', (req, res) => {
  db.all('SELECT * FROM participation', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Route pour obtenir un utilisateur par son ID
app.get('/participation/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM participation WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (!row) {
      res.status(404).json({ error: 'Utilisateur non trouvé' });
    } else {
      res.json(row);
    }
  });
});

// Route pour mettre à jour un utilisateur
app.put('/participation/:id', (req, res) => {
  const { id } = req.params;
  const { code } = req.body;
  db.run(
    'UPDATE participation SET code = ? WHERE id = ?',
    [code, id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (this.changes === 0) {
        res.status(404).json({ error: 'Utilisateur non trouvé' });
      } else {
        res.json({ message: 'Utilisateur mis à jour avec succès' });
      }
    }
  );
});

// Route pour supprimer un utilisateur
app.delete('/participation/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM participation WHERE id = ?', [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Utilisateur non trouvé' });
    } else {
      res.json({ message: 'Utilisateur supprimé avec succès' });
    }
  });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});

