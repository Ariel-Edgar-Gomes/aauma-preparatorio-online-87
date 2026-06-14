# Criar a primeira conta de administrador

Objetivo: criar a conta **arieledgargomes@gmail.com** (nova, com e‑mail já confirmado) e conceder a função **admin**, desbloqueando todas as áreas de administração (Gestão de Usuários, Auditoria, etc.).

## Contexto

- O app usa controle de acesso por papéis (tabela `user_roles`) e o painel só libera as áreas de admin quando o usuário tem o papel `admin`.
- A tela de login (`/auth`) só faz login — não há cadastro público. Por isso a primeira conta precisa ser criada de forma controlada nos bastidores.
- O backend não confirma e‑mail automaticamente por padrão; vamos ajustar isso para você entrar sem precisar verificar a caixa de entrada.

## O que vou precisar de você

- Uma **senha inicial** para a conta de administrador. Vou solicitá‑la de forma segura (campo protegido), não por mensagem no chat. Você poderá trocá‑la depois.

## Passos

1. **Ajustar autenticação**
   - Habilitar confirmação automática de e‑mail para que a conta já entre direto.
   - Manter o cadastro público desativado (apenas o admin cria novos usuários depois).

2. **Receber a senha inicial com segurança**
   - Solicitar a senha do admin através do formulário seguro de segredos (`ADMIN_INITIAL_PASSWORD`).

3. **Criar a conta de administrador**
   - Criar uma função temporária no backend que, com privilégios administrativos, cria o usuário `arieledgargomes@gmail.com` (com e‑mail já confirmado) e concede o papel `admin` na tabela `user_roles`.
   - Essa função fica protegida por um segredo de uso único e será **removida logo após a execução**.

4. **Executar e validar**
   - Rodar a função uma vez para criar a conta e atribuir o papel admin.
   - Confirmar que a conta existe e que o papel `admin` foi gravado em `user_roles`.
   - Remover a função temporária e o segredo de uso único.

5. **Limpeza**
   - Remover o segredo temporário usado para a criação.

## Resultado

- Você poderá fazer login em `/auth` com `arieledgargomes@gmail.com` e a senha definida.
- Todas as áreas administrativas ficarão desbloqueadas.

## Detalhes técnicos

- `configure_auth`: `auto_confirm_email = true`, `disable_signup = true`, mantendo proteção contra senhas vazadas se aplicável.
- Função edge temporária usando `SUPABASE_SERVICE_ROLE_KEY` + `auth.admin.createUser({ email, password, email_confirm: true })`, seguida de `insert` em `public.user_roles` com `role = 'admin'`. Proteção via header com segredo de uso único e checagem de idempotência (não duplicar papel).
- Após sucesso: `delete_edge_functions` da função temporária e `delete_secret` do segredo de uso único.
