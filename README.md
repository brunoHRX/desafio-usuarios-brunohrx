# 🧩 Desafio de Gestão de Usuários

O desafio proposto consistiu na criação de um sistema simples para **gerenciamento de usuários**, utilizando a seguinte stack recomendada:  
**Frontend:** Angular ou Aurelia.io · **Backend:** .NET Core (C#) · **Banco de Dados:** SQL Server · **APIs:** REST.

Com o intuito de me desafiar a aprender uma nova tecnologia e aproveitando os insights obtidos durante o encontro de alinhamento com as partes envolvidas, optei por utilizar o **Aurelia.io**, que se mostrou uma opção interessante para a construção de uma SPA moderna, tipada e reativa.

O sistema foi desenvolvido com foco em **boas práticas de arquitetura**, **responsividade mobile-first**, **testes unitários** e **compatibilidade cross-browser**, garantindo uma experiência consistente e estável em diferentes dispositivos e navegadores.

Entre as principais funcionalidades implementadas, destacam-se:

- CRUD completo de usuários
- Fluxo de recuperação de senha (“Esqueci minha senha”)
- Autenticação JWT com controle de sessão
- Soft Delete para melhor gerenciamento e auditoria
- Painel dedicado à restauração de usuários excluídos
- Suporte a tema **claro e escuro**
- Validações de formulário com feedback dinâmico
- Notificações contextuais de sucesso e erro
- Estrutura modular e preparada para expansão futura

Este projeto demonstra o uso integrado de tecnologias modernas, práticas de desenvolvimento limpo e uma abordagem voltada à escalabilidade e manutenção.

## 🔐 Proteção de Segredos e Configuração Segura

Após a revisão de segurança, os arquivos `appsettings*.json` e `SmtpEmailSender` foram limpos para manter **apenas placeholders**. Isso evita o versionamento acidental de credenciais e garante que cada ambiente forneça seus próprios valores.

- O ASP.NET Core combina automaticamente `appsettings.json`, `appsettings.{Environment}.json`, variáveis de ambiente e User Secrets. Valores faltantes fazem a aplicação falhar no start com uma mensagem clara, impedindo o uso de dados vazios.
- Nunca versione senhas reais ou chaves JWT. Em pipelines e servidores utilize variáveis de ambiente ou um serviço de gerenciamento de segredos.

### 🌍 Variáveis de ambiente obrigatórias

Os nomes abaixo usam a convenção `:` → `__` necessária em variáveis de ambiente:

```bash
# JWT
export Jwt__Key="sua-chave-super-secreta"
export Jwt__Issuer="desafiousuariosApi"
export Jwt__Audience="desafiousuariosApiUsers"

# Banco de dados
export ConnectionStrings__DefaultConnection="Server=localhost,1433;Database=DesafioUsuarios;User=sa;Password=SenhaFort3!;TrustServerCertificate=True;Encrypt=True;"

# SMTP
export Smtp__Host="smtp.seuprovedor.com"
export Smtp__Port="587"
export Smtp__User="usuario"
export Smtp__Pass="senha-ou-token"
export Smtp__From="no-reply@seudominio.com"
```

Configure-as no shell antes de subir a API. Em Windows PowerShell use `$env:Jwt__Key="valor"` e equivalentes.

### 💻 User Secrets (desenvolvimento)

Para evitar expor segredos durante o desenvolvimento local, utilize o provedor `dotnet user-secrets` dentro do diretório `backend/`:

```bash
cd backend

dotnet user-secrets init

dotnet user-secrets set "Jwt:Key" "sua-chave-dev"
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=localhost,1433;Database=DesafioUsuarios;User=sa;Password=SenhaDev;TrustServerCertificate=True;Encrypt=True;"
dotnet user-secrets set "Jwt:Issuer" "desafiousuariosApi"
dotnet user-secrets set "Jwt:Audience" "desafiousuariosApiUsers"
dotnet user-secrets set "Smtp:Host" "smtp.seuprovedor.com"
dotnet user-secrets set "Smtp:Port" "587"
dotnet user-secrets set "Smtp:User" "usuario"
dotnet user-secrets set "Smtp:Pass" "senha-ou-token"
dotnet user-secrets set "Smtp:From" "no-reply@seudominio.com"
```

Os valores ficam armazenados apenas no perfil do desenvolvedor e não são commitados. Quando for para produção ou CI/CD, configure-os via variáveis de ambiente seguras.

### 📝 Dicas adicionais

- Se precisar de configurações específicas do seu ambiente que não sejam sigilosas (por exemplo, nível de log), utilize `appsettings.Development.json`.
- O `Program.cs` valida chaves obrigatórias durante a inicialização; mantenha os placeholders no repositório e ajuste apenas via ambiente.

## 🧭 Guia de Execução Local

![.NET 8](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet&logoColor=white)
![Aurelia 2](https://img.shields.io/badge/Aurelia-2.0-C14646?logo=aurelia&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)
![SQL Server](https://img.shields.io/badge/SQL%20Server-local-red?logo=microsoftsqlserver&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

Este repositório implementa o desafio de gestão de usuários com uma API em **ASP.NET Core 8** e uma SPA em **Aurelia 2 + Vite**. O objetivo deste guia é orientar a preparação completa do ambiente de desenvolvimento local.

### 📐 Arquitetura

| Camada   | Tecnologia principal                              | Porta padrão | Observações                                                            |
| -------- | ------------------------------------------------- | ------------ | ---------------------------------------------------------------------- |
| Backend  | ASP.NET Core 8, Entity Framework Core, SQL Server | 5191         | Swagger disponível em `/api-docs`. Autenticação via JWT.               |
| Frontend | Aurelia 2, Vite 6                                 | 9000         | Proxy local encaminha requisições de API para `http://localhost:5191`. |

**Observe as portas padrões utilizadas pelos seus aplicativos. Elas podem mudar, adapte conforme necessário.**

### ✅ Pré-requisitos

Instale os seguintes itens antes de começar:

- [.NET SDK 8.0](https://dotnet.microsoft.com/download) – necessário para compilar e executar a API.
- [SQL Server](https://www.microsoft.com/sql-server) local ou instância em contêiner. Utilize uma conexão com acesso de leitura/escrita.
- [Node.js](https://nodejs.org/) (versão LTS 18 ou superior recomendada) e npm.

> ℹ️ Caso utilize Docker para o banco, exponha a porta padrão (1433) e ajuste a string de conexão conforme necessário.

### 🔧 Configuração do Backend

1. **Revise os segredos**  
   Defina as variáveis de ambiente ou User Secrets listados na seção anterior antes de iniciar a API.

2. **Configurar `appsettings`**  
   O arquivo `backend/appsettings.json` mantém placeholders seguros. Se precisar de ajustes não sigilosos por ambiente (ex.: nível de log), crie um `backend/appsettings.Development.json`.

3. **Restaurar dependências e aplicar migrações**  
   Na raiz do backend execute:

   ```bash
   cd backend
   dotnet restore
   dotnet tool restore          # caso exista manifest para dotnet-ef
   dotnet ef database update    # cria/atualiza o banco com as migrations
   ```

4. **Executar a API**  
   Com o banco preparado, suba o servidor:

   ```bash
   dotnet run --project desafio-usuarios-brunohrx.csproj
   ```

   - A API ficará disponível em `http://localhost:5191`.
   - A documentação Swagger pode ser acessada em `http://localhost:5191/api-docs`.

#### 📁 Migrações futuras

Para criar novas migrações utilize:

```bash
dotnet ef migrations add NomeDaMigration
```

Para reverter para uma migração anterior:

```bash
dotnet ef database update NomeDaMigrationAnterior
```

### 🖥️ Configuração do Frontend

1. **Instalar dependências**

   ```bash
   cd frontend
   npm install
   ```

2. **Configurar variáveis do Vite**  
   Crie um arquivo `frontend/.env` com o endpoint da API:

   ```ini
   VITE_API_BASE=http://localhost:5191/v1
   ```

3. **Iniciar o servidor de desenvolvimento**

   ```bash
   npm run start
   ```

   A aplicação será servida em `http://localhost:9000`. O Vite já encaminha requisições `/api` para a API .NET.

### 🧪 Testes e verificações

```bash
npm run lint      # ESLint + Stylelint
npm run test      # Vitest
```

### 📁 Estrutura de Pastas

```bash
/
├── backend/                     # API ASP.NET Core
│   ├── Controllers/             # Endpoints principais (Usuários, Auth, etc.)
│   ├── Data/                    # Contexto EF Core e migrações
│   ├── Models/                  # Entidades e DTOs
│   ├── Services/                # Lógica de domínio e utilitários (ex: SmtpEmailSender)
│   ├── appsettings.json         # Configurações padrão (somente placeholders)
│   ├── Program.cs               # Entry point da aplicação
│   └── desafio-usuarios-brunohrx.csproj
│
├── frontend/                    # SPA Aurelia 2
│   ├── src/                     # Código-fonte da aplicação
│   │   ├── components/          # Componentes reutilizáveis
│   │   ├── pages/               # Páginas da SPA (Login, Usuários, etc.)
│   │   ├── services/            # Integração com API
│   │   └── styles/              # Estilos globais e temas
│   ├── public/                  # Arquivos estáticos
│   ├── vite.config.ts           # Configuração de build e proxy
│   └── package.json
│
├── README.md                    # Este guia
├── .gitignore
└── .editorconfig
```

### 🔐 Fluxos e credenciais

- O backend utiliza autenticação JWT com refresh token.
- Certifique-se de cadastrar um usuário via endpoint ou seed para acessar a interface.
- O fluxo de recuperação de senha depende do envio de e-mails via SMTP, portanto configure as variáveis caso deseje testá-lo.

## ❓ Suporte

Qualquer dúvida durante a configuração, verifique os arquivos de configuração (`backend/appsettings.json`, `frontend/vite.config.ts`) e os scripts definidos em `package.json`.

Bom desenvolvimento! 🚀
