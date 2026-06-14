# Documentos da inscrição por e-mail (sem guardar no Cloud)

## Objetivo
Na página de inscrição, os 4 documentos (fotografia, cópia do BI, declaração/certificado, comprovativo de pagamento) deixam de ser guardados no armazenamento do sistema. Em vez disso, são enviados como **anexos** para **arieledgargomes04@gmail.com**, juntamente com todos os dados da inscrição. Os dados do aluno (nome, curso, turma, pagamento, etc.) continuam a ser guardados normalmente — apenas os ficheiros não.

## O que muda

### 1. Submissão da inscrição (frontend)
No processo de envio do formulário:
- Remover o passo que faz upload dos ficheiros para o armazenamento.
- Converter cada ficheiro selecionado para texto Base64 diretamente no navegador.
- Criar o registo do aluno **sem** os campos de ficheiro (sem `foto_url`, `copia_bi_url`, `declaracao_certificado_url`, `comprovativo_pagamento_url`).
- Enviar para a função de e-mail os dados da inscrição **e** os ficheiros já em Base64.
- Manter as validações, a barra de progresso e a página de sucesso a funcionar como hoje.

### 2. Função de envio de e-mail (backend)
- Passar a receber os ficheiros já em Base64 (em vez de ir buscá-los ao armazenamento).
- Anexar esses ficheiros ao e-mail.
- Mudar o destinatário para **arieledgargomes04@gmail.com**.
- Manter o corpo do e-mail com todos os dados do aluno (dados pessoais, académicos e financeiros) e a lista de documentos anexados.

### 3. Configuração de e-mail (Resend)
O envio com anexos exige o serviço Resend, que ainda não está configurado. Para funcionar:
- Será pedido que adiciones a chave **`RESEND_API_KEY`** de forma segura.
- Para enviar para um Gmail qualquer (não só o dono da conta), o Resend precisa de um **domínio verificado**. Em modo de teste (remetente `onboarding@resend.dev`) o Resend só entrega no e-mail do dono da conta Resend. Recomendação: verificar um domínio em Resend e usar um remetente desse domínio.

## Notas / impacto
- Como os ficheiros deixam de ser guardados, **não será possível rever esses documentos mais tarde dentro do sistema** (no editor de aluno ou no botão de reenvio de ficheiros) — eles passam a existir apenas no e-mail recebido. Os dados de texto do aluno continuam visíveis no sistema.
- O limite de 5 MB por ficheiro mantém-se. Anexos por e-mail têm limites de tamanho total (tipicamente ~25–40 MB); ficheiros muito grandes podem falhar no envio — manteremos os limites atuais para evitar isso.

## Detalhes técnicos
- `src/hooks/useSupabaseInscricao.ts`: remover a função `uploadFile` e os uploads para o bucket `student-documents`; ler os ficheiros como Base64 (`FileReader`); passar `foto/copiaBI/declaracaoCertificado/comprovativoPagamento` undefined na criação do aluno; enviar os ficheiros Base64 (com nome e tipo) no corpo de `send-student-documents`.
- `supabase/functions/send-student-documents/index.ts`: alterar a interface `files` para receber `{ content, filename, type }`; remover o cliente Supabase e o download do storage; construir os anexos a partir do Base64 recebido; alterar `emailDestination` para `arieledgargomes04@gmail.com`.
- Pedir o secret `RESEND_API_KEY` e fazer deploy da função após as alterações.
