🚀 Betel Canaã – Backend API
Backend em Node.js desenvolvido para gerenciamento administrativo, com autenticação segura via JWT, deploy em produção e configuração profissional por variáveis de ambiente.
🔗 API em produção:
👉 https://betel-canaa.onrender.com
________________________________________
🧠 Visão Geral
Este projeto foi desenvolvido com foco em boas práticas de backend, segurança e deploy real em nuvem.
Funcionalidades principais:
•	Autenticação administrativa
•	Geração e validação de tokens JWT
•	Criação automática de usuário admin via variáveis de ambiente
•	Ambiente de produção configurado no Render
•	Logs estruturados e tratamento de erros em runtime
O objetivo é demonstrar a capacidade de colocar um backend real em produção, seguindo padrões utilizados no mercado.
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
O sistema utiliza JWT (JSON Web Token) para autenticação segura.
Fluxo de autenticação:
1.	Admin realiza login com email e senha
2.	API valida as credenciais
3.	Um token JWT é gerado e assinado com JWT_SECRET
4.	Rotas protegidas validam o token via middleware
________________________________________
⚙️ Variáveis de Ambiente
Todas as configurações sensíveis são gerenciadas via Environment Variables, seguindo boas práticas de segurança.
Exemplo:
ADMIN_EMAIL=admin@exemplo.com
ADMIN_PASSWORD=senha_segura
JWT_SECRET=sua_chave_super_secreta
📌 Em produção, essas variáveis são configuradas diretamente no Render, sem expor segredos no repositório.
O sistema é configurado para falhar propositalmente caso variáveis críticas não estejam definidas, evitando execuções inseguras.
________________________________________
🚀 Deploy em Produção
O backend está hospedado no Render como um Web Service.
Processo de deploy:
•	Integração contínua com GitHub
•	Build automático (npm install)
•	Execução via node server.js
•	Variáveis de ambiente injetadas em runtime
•	Monitoramento por logs em produção
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
•	✅ Backend funcional
•	✅ Autenticação validada
•	✅ Deploy ativo
•	✅ Ambiente configurado corretamente
________________________________________
📌 Aprendizados Aplicados
•	Separação entre código e configuração
•	Uso profissional de variáveis de ambiente
•	Deploy real em nuvem
•	Leitura e resolução de erros em logs de produção
•	Implementação de autenticação segura com JWT
________________________________________
👨‍💻 Autor
Davi Pereira
Desenvolvedor focado em backend e aplicações web.
📫 GitHub:
👉 https://github.com/davibarbosatech
________________________________________
🏁 Observação Final
Este projeto faz parte do meu portfólio e demonstra minha capacidade de:
•	Desenvolver um backend funcional
•	Configurar segurança corretamente
•	Realizar deploy real em produção
•	Resolver problemas diretamente em ambiente de nuvem

