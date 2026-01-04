const db = require('./db');
module.exports = function init() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT,
        email TEXT UNIQUE,
        senha_hash TEXT,
        telefone TEXT,
        cpf TEXT,
        is_admin INTEGER DEFAULT 0
      )`);
      db.run(`CREATE TABLE IF NOT EXISTS produtos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT,
        descricao TEXT,
        categoria TEXT,
        preco REAL DEFAULT 0,
        estoque INTEGER DEFAULT 0,
        imagem_url TEXT
      )`);
      db.run(`CREATE TABLE IF NOT EXISTS pedidos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER,
        itens_json TEXT,
        total REAL,
        status TEXT,
        data TEXT,
        forma_pagamento TEXT,
        endereco_entrega TEXT
      )`);
      // cria um admin demo se não existir
      db.get('SELECT COUNT(*) as c FROM usuarios WHERE is_admin = 1', (err, row) => {
        if (err) return reject(err);
        if (row.c === 0) {
          const bcrypt = require('bcryptjs');
          bcrypt.hash('admin123', 10).then(hash => {
            db.run('INSERT INTO usuarios (nome, email, senha_hash, is_admin) VALUES (?,?,?,?)', ['Administrador', 'admin@betel.com', hash, 1], (err2) => {
              if (err2) console.error('erro inserir admin demo', err2);
              resolve();
            });
          }).catch(reject);
        } else resolve();
      });
    });
  });
};
