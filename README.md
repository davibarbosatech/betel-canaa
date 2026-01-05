🚀 Betel Canaã – Backend API
Backend em Node.js desenvolvido para gerenciamento administrativo com autenticação segura via JWT, deploy em produção e configuração profissional por variáveis de ambiente.
🔗 API em produção:
👉 https://betel-canaa.onrender.com
________________________________________
🧠 Visão Geral
Este projeto foi desenvolvido com foco em boas práticas de backend, segurança e deploy real em nuvem.
O sistema conta com:
•	Login administrativo
•	Geração e validação de tokens JWT
•	Criação automática de usuário admin via variáveis de ambiente
•	Ambiente de produção configurado no Render
•	Logs e tratamento de erros em runtime
________________________________________
🛠️ Tecnologias Utilizadas
•	Node.js
•	Express
•	JWT (jsonwebtoken)
•	Bcrypt
•	Dotenv
•	Render (Deploy em Produção)
•	Git & GitHub
________________________________________
🔐 Autenticação
O sistema utiliza JWT (JSON Web Token) para autenticação.
Fluxo:
1.	Admin realiza login com email e senha
2.	API valida credenciais
3.	Token JWT é gerado e assinado com JWT_SECRET
4.	Rotas protegidas validam o token via middleware
________________________________________
⚙️ Variáveis de Ambiente
Todas as configurações sensíveis são gerenciadas via Environment Variables, seguindo boas práticas de segurança.
ADMIN_EMAIL=admin@exemplo.com
ADMIN_PASSWORD=senha_segura
JWT_SECRET=sua_chave_super_secreta
📌 Em produção, essas variáveis são configuradas diretamente no Render, sem expor segredos no repositório.
________________________________________
🚀 Deploy em Produção
O backend está hospedado no Render como um Web Service.
Processo de deploy:
•	Integração com GitHub
•	Build automático (npm install)
•	Execução via node server.js
•	Variáveis de ambiente injetadas em runtime
•	Monitoramento por logs
💡 O projeto está configurado para falhar propositalmente caso variáveis críticas não estejam definidas, evitando execuções inseguras.
________________________________________
📁 Estrutura do Projeto
├── server.js
├── package.json
├── .env.example
├── routes/
├── middlewares/
└── README.md
________________________________________
🧪 Status do Projeto
✅ Backend funcional
✅ Autenticação validada
✅ Deploy ativo
✅ Ambiente configurado corretamente
________________________________________
📌 Aprendizados Aplicados
•	Separação entre código e configuração
•	Uso profissional de variáveis de ambiente
•	Deploy real em nuvem
•	Leitura e resolução de erros em logs de produção
•	Autenticação segura com JWT
________________________________________
👨‍💻 Autor
Davi Pereira
Desenvolvedor focado em backend e aplicações web.
📫 GitHub: https://github.com/davibarbosatech
________________________________________
🏁 Observação Final
Este projeto faz parte do meu portfólio e demonstra minha capacidade de colocar um backend real em produção, seguindo práticas utilizadas no mercado.
