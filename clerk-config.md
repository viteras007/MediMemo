# Clerk Configuration

## Variáveis de Ambiente Necessárias

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key_here
CLERK_SECRET_KEY=your_secret_key_here

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Development
NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL=/
```

## Como obter as chaves do Clerk:

1. Acesse [clerk.com](https://clerk.com)
2. Crie uma conta ou faça login
3. Crie um novo projeto
4. Vá para "API Keys" no dashboard
5. Copie as chaves e substitua no arquivo `.env.local`

## Configurações Recomendadas no Dashboard do Clerk:

- **Sign-in methods**: Email, Google
- **User profile**: Nome, email
- **Appearance**: Personalizar cores para combinar com o tema do MediMemo
- **Redirect URLs**: Adicionar `http://localhost:3000` para desenvolvimento 