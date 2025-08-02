# AI Provider Configuration

Este projeto agora suporta múltiplos providers de IA, permitindo alternar facilmente entre Ollama (local) e Together.ai (cloud).

## Configuração Rápida

### Para usar Ollama (Mistral local):

```bash
# .env
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
USE_CACHE=false  # Opcional: desabilita cache
```

### Para usar Together.ai (cloud):

```bash
# .env
AI_PROVIDER=together-ai
TOGETHER_API_KEY=your_together_api_key
HELICONE_API_KEY=your_helicone_api_key
USE_CACHE=true  # Opcional: habilita cache
```

## Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `AI_PROVIDER` | Provider de IA: `ollama` ou `together-ai` | `ollama` |
| `OLLAMA_BASE_URL` | URL do servidor Ollama | `http://localhost:11434` |
| `TOGETHER_API_KEY` | API Key do Together.ai | - |
| `HELICONE_API_KEY` | API Key do Helicone (para Together.ai) | - |
| `USE_CACHE` | Habilita/desabilita cache | `true` |

## Como Alternar

Para alternar entre providers, você só precisa mudar **uma linha** no seu arquivo `.env`:

```bash
# Para Ollama
AI_PROVIDER=ollama

# Para Together.ai
AI_PROVIDER=together-ai
```

## Requisitos

### Ollama
- Ollama instalado e rodando
- Modelo Mistral baixado: `ollama pull mistral`

### Together.ai
- Conta no Together.ai
- API Key configurada
- Helicone configurado (opcional, para analytics)

## Cache

O cache pode ser desabilitado completamente definindo:

```bash
USE_CACHE=false
```

Isso é útil para desenvolvimento ou quando você quer sempre processar com IA.

## Logs

O sistema mostra logs claros sobre qual provider está sendo usado:

```
Using AI Provider: ollama
Cache enabled: false
```

ou

```
Using AI Provider: together-ai
Cache enabled: true
``` 