# 🎨 TODO LIST PRO - FRONTEND

Interface moderna e responsiva para gerenciamento de tarefas com React, TypeScript, Vite e Tailwind CSS.

---

## 📋 PASSO A PASSO - CONFIGURAÇÃO E EXECUÇÃO

### ✅ PRÉ-REQUISITOS

Antes de começar, certifique-se de ter:

- ✅ **Node.js** versão 18 ou superior
  - Verificar: `node --version`
  
- ✅ **npm** ou **yarn**
  - Verificar: `npm --version`
  
- ✅ **Backend rodando** (Etapa 2 concluída)
  - O backend deve estar rodando em `http://localhost:3001`
  
- ✅ **Credenciais do Supabase**
  - SUPABASE_URL
  - SUPABASE_ANON_KEY (chave pública, NÃO a service role!)

---

## 🛠️ PASSO 1: NAVEGAR PARA A PASTA DO FRONTEND

```bash
# Se você baixou o projeto completo
cd caminho/para/frontend

# Ou se está seguindo a estrutura
cd todo-list-frontend
```

---

## 📦 PASSO 2: INSTALAR DEPENDÊNCIAS

Dentro da pasta `frontend`, execute:

```bash
npm install
```

**O que acontece:**
- Instalação de React, TypeScript, Vite, Tailwind CSS
- React Query, Zustand, React Router
- Lucide Icons, React Hot Toast, Date-fns
- E mais 40+ bibliotecas otimizadas

⏳ **Tempo estimado:** 1-2 minutos

**Você verá algo como:**
```
added 547 packages in 52s
```

---

## 🔐 PASSO 3: CONFIGURAR VARIÁVEIS DE AMBIENTE

### 3.1 - Criar arquivo .env

Na raiz da pasta `frontend`, crie um arquivo chamado `.env`:

**No Windows:**
```bash
notepad .env
# ou
code .env
```

**No Mac/Linux:**
```bash
nano .env
# ou
code .env
```

### 3.2 - Preencher as variáveis

Cole o seguinte e substitua pelos seus valores:

```env
# ========================================
# SUPABASE CREDENTIALS (Frontend)
# ========================================
# IMPORTANTE: Use a ANON KEY, NÃO a service role!

# Cole a URL do Supabase (mesma do backend)
VITE_SUPABASE_URL=https://xxxxx.supabase.co

# Cole a ANON KEY (chave pública)
# Esta é diferente da que você usou no backend!
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ========================================
# BACKEND API URL
# ========================================
# URL do backend que você criou na Etapa 2
VITE_API_URL=http://localhost:3001

# ========================================
# APP SETTINGS
# ========================================
VITE_APP_NAME="Todo List Pro"
VITE_APP_VERSION="1.0.0"
```

### 3.3 - Onde encontrar a ANON KEY?

1. Acesse o Supabase → seu projeto
2. Settings → API
3. Procure por **"anon / public"** key
4. Clique no ícone de 👁️ para revelar
5. Copie e cole no `.env`

**⚠️ ATENÇÃO:**
- Use a **ANON KEY** (pública) no frontend
- Não use a **SERVICE ROLE KEY** aqui!

### 3.4 - Salvar o arquivo

- Salve como `.env` (com ponto na frente)
- Na raiz da pasta `frontend`
- Não compartilhe esse arquivo!

---

## ▶️ PASSO 4: EXECUTAR O FRONTEND

Agora vamos rodar em modo de desenvolvimento:

```bash
npm run dev
```

**O que você deve ver:**

```
  VITE v5.0.8  ready in 743 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

**🎉 SUCESSO!** O navegador vai abrir automaticamente em `http://localhost:5173`

---

## 🎨 PASSO 5: VERIFICAR SE ESTÁ FUNCIONANDO

### 5.1 - Checklist inicial

Ao abrir `http://localhost:5173`, você deve ver:

- ✅ Página carregando sem erros
- ✅ Tema claro/escuro funcionando
- ✅ Console do navegador sem erros críticos
- ✅ Mensagem "✅ Supabase conectado no frontend!" no console

### 5.2 - Testar autenticação

**IMPORTANTE:** Como ainda não criamos todas as páginas, você verá páginas de placeholder. Isso é normal!

O que foi criado na estrutura base:
- ✅ Configuração completa do projeto
- ✅ Supabase conectado
- ✅ React Query configurado
- ✅ Zustand stores (auth e UI)
- ✅ Roteamento básico
- ✅ Tailwind CSS + tema escuro
- ✅ Sistema de tipos TypeScript
- ✅ Hooks customizados prontos
- ✅ Utilitários e helpers

---

## 📚 ESTRUTURA DO PROJETO

```
frontend/
├── public/                      # Arquivos estáticos
├── src/
│   ├── components/
│   │   ├── ui/                 # Componentes UI reutilizáveis
│   │   │   └── Button.tsx      # Botão customizado
│   │   ├── layout/             # Layouts (Header, Sidebar, etc)
│   │   ├── tasks/              # Componentes de tarefas
│   │   └── auth/               # Componentes de autenticação
│   ├── hooks/
│   │   ├── useTasks.ts         # Hooks de tarefas (React Query)
│   │   ├── useCategories.ts    # Hooks de categorias
│   │   └── useAnalytics.ts     # Hooks de analytics
│   ├── lib/
│   │   ├── supabase.ts         # Cliente Supabase
│   │   ├── api.ts              # Cliente Axios (API)
│   │   └── utils.ts            # Utilitários e helpers
│   ├── pages/
│   │   ├── Login.tsx           # Página de login
│   │   ├── Register.tsx        # Página de registro
│   │   ├── Dashboard.tsx       # Dashboard principal
│   │   ├── Tasks.tsx           # Lista de tarefas
│   │   └── Analytics.tsx       # Analytics e estatísticas
│   ├── store/
│   │   ├── authStore.ts        # Estado de autenticação
│   │   └── uiStore.ts          # Estado da UI (tema, modais)
│   ├── types/
│   │   └── index.ts            # Tipos TypeScript
│   ├── App.tsx                 # Componente principal
│   ├── main.tsx                # Ponto de entrada
│   └── index.css               # Estilos globais + Tailwind
├── .env                        # Variáveis de ambiente (NÃO versionar!)
├── .env.example                # Exemplo de variáveis
├── index.html                  # HTML base
├── package.json                # Dependências
├── tailwind.config.js          # Config Tailwind
├── tsconfig.json               # Config TypeScript
├── vite.config.ts              # Config Vite + PWA
└── README.md                   # Este arquivo
```

---

## 🎯 FUNCIONALIDADES IMPLEMENTADAS (BASE)

### ✅ Já está funcionando:

1. **Autenticação**
   - Sistema de login/logout
   - Persistência de sessão
   - Rotas protegidas
   - Store Zustand para estado auth

2. **Tema**
   - Light/Dark mode
   - Modo automático (detecta preferência do sistema)
   - Persistência da preferência
   - Cor customizável

3. **React Query**
   - Cache automático
   - Revalidação em background
   - Otimistic updates prontos
   - DevTools habilitados

4. **Roteamento**
   - React Router configurado
   - Redirecionamento automático
   - Rotas públicas vs protegidas

5. **PWA (Progressive Web App)**
   - Instalável no celular/desktop
   - Funciona offline (com cache)
   - Service Worker configurado

6. **UI/UX**
   - Tailwind CSS responsivo
   - Componentes base criados
   - Animações suaves
   - Toasts para feedback

---

## 🚀 PRÓXIMOS PASSOS (O que você vai criar)

A estrutura está pronta! Agora você pode criar:

### 1. Páginas principais:
- [ ] **Login/Register** completo com validação
- [ ] **Dashboard** com cards de estatísticas
- [ ] **Lista de Tarefas** com filtros e busca
- [ ] **Detalhes da Tarefa** com modal/drawer
- [ ] **Categorias** gerenciamento
- [ ] **Analytics** com gráficos (Recharts)
- [ ] **Perfil** do usuário
- [ ] **Configurações**

### 2. Componentes:
- [ ] **TaskCard** - Card de tarefa com drag & drop
- [ ] **TaskModal** - Modal criar/editar tarefa
- [ ] **CategoryBadge** - Badge de categoria
- [ ] **PriorityBadge** - Badge de prioridade
- [ ] **PomodoroTimer** - Timer Pomodoro
- [ ] **Sidebar** - Menu lateral
- [ ] **Header** - Barra superior
- [ ] **SearchBar** - Busca de tarefas
- [ ] **FilterPanel** - Painel de filtros
- [ ] **StatCard** - Card de estatística

### 3. Features avançadas:
- [ ] Drag & Drop de tarefas
- [ ] Filtros e busca em tempo real
- [ ] Notificações push
- [ ] Shortcuts de teclado
- [ ] Export/Import de dados
- [ ] Compartilhamento de tarefas

---

## 📝 SCRIPTS DISPONÍVEIS

```bash
# Rodar em desenvolvimento (hot reload)
npm run dev

# Compilar para produção
npm run build

# Visualizar build de produção
npm run preview

# Verificar erros de lint
npm run lint
```

---

## 🎨 GUIA DE ESTILO E COMPONENTES

### Cores do tema:

```typescript
// Primária (azul)
primary-50 até primary-950

// Use assim:
<div className="bg-primary-600 text-white">...</div>
```

### Componente Button (já criado):

```tsx
import Button from '@/components/ui/Button';

// Variantes
<Button variant="primary">Salvar</Button>
<Button variant="secondary">Cancelar</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Deletar</Button>

// Tamanhos
<Button size="sm">Pequeno</Button>
<Button size="md">Médio</Button>
<Button size="lg">Grande</Button>

// Com ícones
<Button leftIcon={<Plus />}>Criar</Button>
<Button rightIcon={<ArrowRight />}>Avançar</Button>

// Loading
<Button isLoading>Salvando...</Button>
```

### Dark Mode:

```tsx
// Use a classe "dark:" para estilos no modo escuro
<div className="bg-white dark:bg-gray-800">
  <p className="text-gray-900 dark:text-gray-100">Texto</p>
</div>
```

### Ícones (Lucide React):

```tsx
import { Plus, Check, Trash, Edit, Calendar } from 'lucide-react';

<Plus className="w-5 h-5" />
<Check className="w-4 h-4 text-green-500" />
```

---

## 🔧 CONFIGURAÇÕES IMPORTANTES

### Alias de importação:

Use `@/` para importar de `src/`:

```typescript
// ✅ Correto
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/ui/Button';

// ❌ Evite
import { useAuthStore } from '../../store/authStore';
```

### React Query DevTools:

- Abre automaticamente em dev
- Mostra todas as queries e mutations
- Cache, status, dados em tempo real
- Muito útil para debug!

### Toasts (notificações):

```typescript
import toast from 'react-hot-toast';

toast.success('Tarefa criada!');
toast.error('Erro ao salvar');
toast.loading('Salvando...');
```

---

## 🚨 SOLUÇÃO DE PROBLEMAS

### ❌ Erro: "Cannot find module '@/...'"

**Solução:**
```bash
# Reinicie o servidor
Ctrl+C
npm run dev
```

### ❌ Erro: "VITE_SUPABASE_URL is required"

**Problema:** Arquivo `.env` não foi criado ou está incorreto

**Solução:**
1. Verifique se o arquivo `.env` existe na raiz
2. Confirme que as variáveis estão preenchidas
3. Reinicie o servidor

### ❌ Erro 401 ao fazer login

**Problema:** Credenciais do Supabase incorretas

**Solução:**
1. Verifique se usou a **ANON KEY** (não a service role)
2. Confirme que a URL está correta
3. Teste no Supabase se o projeto está ativo

### ❌ Erro de CORS

**Problema:** Backend não está configurado para aceitar requisições do frontend

**Solução:**
1. Verifique se o backend está rodando
2. No backend, confirme que `FRONTEND_URL=http://localhost:5173`
3. Reinicie ambos (backend e frontend)

### ❌ Tailwind não está funcionando

**Solução:**
```bash
# Reinstale dependências
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### ❌ Build falha

**Solução:**
```bash
# Limpe o cache e rebuilde
npm run lint
npm run build
```

---

## 🎯 CHECKLIST DE DESENVOLVIMENTO

Antes de continuar criando os componentes:

- [ ] Frontend rodando sem erros
- [ ] Backend rodando e acessível
- [ ] Consegue ver a página inicial
- [ ] Dark mode funciona (teste com o botão do navegador)
- [ ] Console do navegador sem erros críticos
- [ ] React Query DevTools aparece (canto inferior)
- [ ] `.env` configurado corretamente

---

## 📦 DEPLOY (QUANDO ESTIVER PRONTO)

### Vercel (Recomendado para frontend):

```bash
# Instale o Vercel CLI
npm i -g vercel

# Faça login
vercel login

# Deploy
vercel

# Deploy em produção
vercel --prod
```

### Variáveis de ambiente na Vercel:

1. Acesse o projeto na Vercel
2. Settings → Environment Variables
3. Adicione:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_URL` (URL do seu backend em produção)

---

## 🎓 PRÓXIMA ETAPA

**Agora você tem:**
- ✅ Backend completo funcionando
- ✅ Frontend base estruturado
- ✅ Autenticação configurada
- ✅ Banco de dados pronto
- ✅ Todas as ferramentas necessárias

**Próximos passos sugeridos:**

1. Criar página de Login/Register completa
2. Criar Dashboard com estatísticas
3. Implementar lista de tarefas
4. Adicionar modal de criar/editar tarefa
5. Implementar drag & drop
6. Adicionar Pomodoro timer
7. Criar página de Analytics

---

## 💡 DICAS FINAIS

1. **Use o React Query DevTools** - Mostra tudo que está acontecendo
2. **Console do navegador** - F12 para ver erros
3. **Teste no mobile** - F12 → Toggle device toolbar
4. **Hot reload** - Salve o arquivo e veja as mudanças instantaneamente
5. **Dark mode** - Teste sempre nos dois temas

---

**Desenvolvido com ❤️ usando React + TypeScript + Vite**

🚀 **Bora criar um TODO-LIST INCRÍVEL!**
