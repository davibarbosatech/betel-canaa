// 1. Carrega as variáveis do arquivo .env
require('dotenv').config();

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// 2. Lê as configurações do .env (Se não tiver, usa padrão ou avisa erro)
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.JWT_SECRET;

// Trava de segurança: Se não configurou a chave, o servidor não liga
if (!SECRET_KEY) {
    console.error("ERRO CRÍTICO: Variável JWT_SECRET não encontrada no arquivo .env");
    process.exit(1);
}

// --- CONFIGURAÇÃO DE UPLOAD ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './public/assets/uploads';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public'))); 

const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) console.error('Erro no SQLite:', err);
    else console.log('Banco de dados conectado com segurança.');
});

// --- CRIAÇÃO DAS TABELAS ---
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT,
        email TEXT UNIQUE,
        senha TEXT,
        cpf TEXT,
        telefone TEXT,
        cep TEXT,
        endereco TEXT,
        numero TEXT,
        complemento TEXT,
        bairro TEXT,
        cidade TEXT,
        estado TEXT,
        is_admin INTEGER DEFAULT 0
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS produtos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT,
        descricao TEXT,
        preco REAL,
        imagem TEXT,
        categoria TEXT,
        estoque INTEGER
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS pedidos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER,
        data DATETIME DEFAULT CURRENT_TIMESTAMP,
        total REAL,
        status TEXT DEFAULT 'Pendente',
        itens_json TEXT
    )`);
    
    // 3. Cria Admin usando as credenciais do .env
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@admin.com';
    const adminPass = process.env.ADMIN_PASSWORD || '123456'; // Fallback se falhar o .env
    const adminSenhaHash = bcrypt.hashSync(adminPass, 10);
    
    db.run(`INSERT OR IGNORE INTO usuarios (nome, email, senha, is_admin) VALUES ('Admin', ?, ?, 1)`, [adminEmail, adminSenhaHash]);
});

// --- ROTA DE CADASTRO ---
app.post('/api/auth/register', (req, res) => {
    const { nome, email, senha, cpf, telefone, cep, endereco, numero, complemento, bairro, cidade, estado } = req.body;
    const senhaHash = bcrypt.hashSync(senha, 10);

    const sql = `INSERT INTO usuarios (nome, email, senha, cpf, telefone, cep, endereco, numero, complemento, bairro, cidade, estado, is_admin) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`;
    
    db.run(sql, [nome, email, senhaHash, cpf, telefone, cep, endereco, numero, complemento, bairro, cidade, estado], 
        function(err) {
            if (err) {
                if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'E-mail já cadastrado.' });
                return res.status(500).json({ error: 'Erro ao cadastrar: ' + err.message });
            }
            res.json({ message: 'Cadastro realizado com sucesso!' });
        }
    );
});

// --- LOGIN ---
app.post('/api/auth/login', (req, res) => {
    const { email, senha } = req.body;
    db.get(`SELECT * FROM usuarios WHERE email = ?`, [email], (err, user) => {
        if (err || !user) return res.status(401).json({ error: 'Usuário não encontrado' });
        if (!bcrypt.compareSync(senha, user.senha)) return res.status(401).json({ error: 'Senha incorreta' });

        // Usa a SECRET_KEY do .env para gerar o token
        const token = jwt.sign({ id: user.id, is_admin: user.is_admin }, SECRET_KEY, { expiresIn: '24h' });
        res.json({ token, is_admin: user.is_admin, nome: user.nome });
    });
});

app.get('/api/auth/me', (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token ausente' });
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Token inválido' });
        res.json(decoded);
    });
});

app.get('/api/auth/dados-usuario', (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Login necessário' });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Token inválido' });
        db.get(`SELECT nome, cpf, telefone, endereco, numero, complemento, bairro, cidade, estado FROM usuarios WHERE id = ?`, 
            [decoded.id], 
            (err, row) => {
                if (err || !row) return res.status(404).json({ error: 'Usuário não encontrado' });
                res.json(row);
            }
        );
    });
});

// --- TROCAR SENHA ---
app.put('/api/auth/password', (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Inválido' });
        const { senhaAtual, novaSenha } = req.body;
        db.get('SELECT senha FROM usuarios WHERE id = ?', [decoded.id], (err, user) => {
            if (!bcrypt.compareSync(senhaAtual, user.senha)) return res.status(400).json({ error: 'Senha incorreta.' });
            const novaHash = bcrypt.hashSync(novaSenha, 10);
            db.run('UPDATE usuarios SET senha = ? WHERE id = ?', [novaHash, decoded.id], (err) => {
                if(err) return res.status(500).json({error:err});
                res.json({ message: 'Senha alterada!' });
            });
        });
    });
});

// --- ADMIN: LISTAR CLIENTES ---
app.get('/api/usuarios', (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err || !decoded.is_admin) return res.status(403).json({ error: 'Acesso negado' });
        db.all(`SELECT id, nome, email, telefone, cidade, estado, cpf FROM usuarios WHERE is_admin = 0`, [], (e, rows) => {
            res.json(rows);
        });
    });
});

// --- ADMIN: RESET SENHA ---
app.put('/api/usuarios/:id/admin-reset', (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err || !decoded.is_admin) return res.status(403).json({ error: 'Apenas admin.' });
        const senhaPadrao = bcrypt.hashSync('123456', 10);
        db.run('UPDATE usuarios SET senha = ? WHERE id = ?', [senhaPadrao, req.params.id], (err) => {
            res.json({ message: 'Senha redefinida' });
        });
    });
});

// --- PRODUTOS ---
app.get('/api/produtos', (req, res) => {
    db.all(`SELECT * FROM produtos`, [], (err, rows) => res.json(rows));
});

app.post('/api/produtos', upload.single('imagem'), (req, res) => {
    const { nome, descricao, preco, categoria, estoque } = req.body;
    const img = req.file ? `assets/uploads/${req.file.filename}` : 'assets/img/sem-foto.png';
    db.run(`INSERT INTO produtos (nome, descricao, preco, imagem, categoria, estoque) VALUES (?,?,?,?,?,?)`,
        [nome, descricao, preco, img, categoria, estoque],
        function(err) { res.json({ id: this.lastID }); }
    );
});

// 🚀 NOVO: Rota PUT para atualização de dados (nome, estoque, preço, etc.)
app.put('/api/produtos/:id', (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err || !decoded.is_admin) return res.status(403).json({ error: 'Acesso negado' });

        const { nome, descricao, preco, categoria, estoque } = req.body;
        const produtoId = req.params.id;

        if (estoque === undefined || nome === undefined || preco === undefined) {
             return res.status(400).json({ error: 'Dados incompletos para atualização (nome, preco, estoque são obrigatórios).' });
        }

        const sql = `UPDATE produtos 
                     SET nome = ?, descricao = ?, preco = ?, categoria = ?, estoque = ?
                     WHERE id = ?`;
                     
        db.run(sql, [nome, descricao, preco, categoria, estoque, produtoId], 
            function(err) {
                if (err) return res.status(500).json({ error: 'Erro ao atualizar produto: ' + err.message });
                if (this.changes === 0) return res.status(404).json({ error: 'Produto não encontrado.' });
                res.json({ message: 'Produto atualizado com sucesso!' });
            }
        );
    });
});
// ----------------------------------------

// [EXISTENTE] Rota DELETE que você mencionou
app.delete('/api/produtos/:id', (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (!decoded.is_admin) return res.status(403).json({ error: 'Não autorizado' });
        db.run(`DELETE FROM produtos WHERE id = ?`, [req.params.id], (err) => res.json({ message: 'Deletado' }));
    });
});

// --- PEDIDOS ---
app.post('/api/pedidos', (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Login necessário' });

    jwt.verify(token, SECRET_KEY, async (err, decoded) => {
        const { total, itens } = req.body; 
        const verificarEstoque = new Promise((resolve, reject) => {
            let processados = 0;
            if (!itens || itens.length === 0) { reject("Carrinho vazio"); return; }
            itens.forEach(item => {
                db.get(`SELECT estoque, nome FROM produtos WHERE id = ?`, [item.productId], (err, row) => {
                    if (err || !row) { reject("Erro no produto " + item.nome); return; }
                    if (row.estoque < item.quantidade) { reject(`Estoque insuficiente: ${row.nome}`); return; }
                    processados++;
                    if(processados === itens.length) resolve();
                });
            });
        });

        try {
            await verificarEstoque;
            db.run(`INSERT INTO pedidos (usuario_id, total, itens_json) VALUES (?, ?, ?)`,
                [decoded.id, total, JSON.stringify(itens)],
                function(err) {
                    if (err) return res.status(500).json({ error: err.message });
                    const pedidoId = this.lastID;
                    itens.forEach(item => {
                        db.run(`UPDATE produtos SET estoque = estoque - ? WHERE id = ?`, [item.quantidade, item.productId]);
                    });
                    res.json({ success: true, pedidoId: pedidoId });
                }
            );
        } catch (msgErro) { res.status(400).json({ error: msgErro }); }
    });
});

app.get('/api/pedidos', (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (decoded.is_admin) {
            const sql = `SELECT pedidos.*, usuarios.nome as usuario_nome, usuarios.telefone as usuario_telefone,
                       usuarios.endereco || ', ' || usuarios.numero || ' - ' || usuarios.bairro || ', ' || usuarios.cidade || '/' || usuarios.estado as endereco_completo
                FROM pedidos LEFT JOIN usuarios ON pedidos.usuario_id = usuarios.id`;
            db.all(sql, [], (e, rows) => res.json(rows));
        } else {
            db.all(`SELECT * FROM pedidos WHERE usuario_id = ?`, [decoded.id], (e, rows) => res.json(rows));
        }
    });
});

app.put('/api/pedidos/:id/status', (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (!decoded.is_admin) return res.status(403).json({ error: 'Acesso negado' });
        db.run(`UPDATE pedidos SET status = ? WHERE id = ?`, [req.body.status, req.params.id], (err) => res.json({ success: true }));
    });
});

app.get('*', (req, res) => {
    if (req.url.startsWith('/api')) return res.status(404).json({ error: 'Not found' });
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor seguro rodando na porta ${PORT}`);
});
