# MediMemo - AI-Powered Medical Report Interpreter

Um aplicativo web que usa IA para interpretar relatórios médicos em linguagem simples e acessível.

## 🚀 Novidades

**Sistema de Providers de IA Modular**: Agora você pode alternar facilmente entre:
- **Ollama (local)** - com modelo Mistral rodando no seu PC
- **Together.ai (cloud)** - com modelos Llama 3.3 70B

Para alternar, mude apenas **uma linha** no seu `.env`:
```bash
AI_PROVIDER=ollama        # Para Ollama local
AI_PROVIDER=together-ai   # Para Together.ai
```

## 🛠️ Configuração Rápida

### 1. Clone o repositório
```bash
git clone <repository-url>
cd medimemo
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env.local`:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# AI Provider (escolha um)
AI_PROVIDER=ollama  # ou together-ai

# Para Ollama (local)
OLLAMA_BASE_URL=http://localhost:11434

# Para Together.ai (cloud)
TOGETHER_API_KEY=your_together_api_key
HELICONE_API_KEY=your_helicone_api_key

# Cache (opcional)
USE_CACHE=true

# Upstash Redis (para rate limiting)
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
```

### 4. Configure o Provider de IA

#### Opção A: Ollama (Recomendado para desenvolvimento)

1. Instale o Ollama: https://ollama.ai
2. Baixe o modelo Mistral:
```bash
ollama pull mistral
```
3. Configure no `.env`:
```bash
AI_PROVIDER=ollama
USE_CACHE=false  # Desabilita cache para desenvolvimento
```

#### Opção B: Together.ai (Para produção)

1. Crie uma conta em https://together.ai
2. Obtenha sua API Key
3. Configure no `.env`:
```bash
AI_PROVIDER=together-ai
TOGETHER_API_KEY=your_api_key
```

### 5. Execute o projeto
```bash
npm run dev
```

## 🧪 Testando os Providers

Execute o script de teste para verificar se tudo está funcionando:

```bash
node test-ai-providers.js
```

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── api/
│   │   └── upload-pdf/
│   │       └── route.ts          # API principal (refatorada)
│   └── dashboard/
│       └── page.tsx              # Interface principal
├── lib/
│   ├── ai-providers.ts           # Sistema de providers de IA
│   ├── cache-manager.ts          # Sistema de cache opcional
│   ├── redis.ts                  # Configuração Redis
│   └── utils.ts                  # Utilitários
└── components/
    └── ResultsDisplay.tsx        # Exibição dos resultados
```

## 🔄 Como Alternar Entre Providers

### Para usar Ollama (local):
```bash
# .env
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
USE_CACHE=false
```

### Para usar Together.ai (cloud):
```bash
# .env
AI_PROVIDER=together-ai
TOGETHER_API_KEY=your_api_key
HELICONE_API_KEY=your_helicone_key
USE_CACHE=true
```

## 🎯 Funcionalidades

- ✅ Upload de PDFs médicos
- ✅ Extração de texto automática
- ✅ Análise com IA (Ollama ou Together.ai)
- ✅ Verificação de segurança de conteúdo
- ✅ Cache opcional para otimização
- ✅ Rate limiting para proteção
- ✅ Interface limpa e responsiva
- ✅ Autenticação com Clerk

## 🔧 Desenvolvimento

### Comandos úteis:

```bash
# Testar providers
node test-ai-providers.js

# Verificar se Ollama está rodando
curl http://localhost:11434/api/tags

# Verificar logs
npm run dev
```

### Debugging:

- Os logs mostram qual provider está sendo usado
- Cache pode ser desabilitado com `USE_CACHE=false`
- Rate limiting pode ser ajustado no código

## 📚 Documentação Adicional

- [AI_PROVIDER_SETUP.md](./AI_PROVIDER_SETUP.md) - Configuração detalhada dos providers
- [CLERK_SETUP.md](./CLERK_SETUP.md) - Configuração do Clerk
- [HELICONE_SETUP.md](./HELICONE_SETUP.md) - Configuração do Helicone

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.
