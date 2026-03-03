// server.js - Fichier principal de l'application

// 1. IMPORTS
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

// 2. INITIALISATION
const app = express();
const PORT = process.env.PORT || 3000;

// 3. MIDDLEWARES GLOBAUX
app.use(express.json()); // Pour lire le JSON dans les requêtes

// 4. CONNEXION À MONGODB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connecté à MongoDB'))
  .catch(err => {
    console.error('❌ Erreur de connexion à MongoDB:', err);
    process.exit(1); // Arrête l'app si pas de DB
  });

// 5. ROUTE DE TEST
app.get('/', (req, res) => {
  res.json({ 
    message: 'Bienvenue sur l\'API Finance Personnelle',
    status: 'opérationnel',
    version: '1.0.0'
  });
});

// 6. DÉMARRAGE DU SERVEUR
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});