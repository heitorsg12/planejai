# Planej.ai

Planej.ai é uma aplicação de planejamento financeiro pessoal. Ela guia a pessoa pelo preenchimento de renda, gastos, dívidas e uma meta, calcula a disponibilidade mensal e gera um diagnóstico financeiro personalizado com IA.

Depois de criar uma simulação, a pessoa pode rever os resultados, conversar com um educador financeiro sobre aquele cenário e consultar as simulações anteriores. Os dados ficam armazenados localmente no navegador.

## Funcionalidades

- Criação de simulações financeiras em etapas.
- Cálculo da economia mensal disponível e do valor necessário para atingir a meta.
- Diagnóstico financeiro personalizado gerado pelo Gemini.
- Histórico de simulações, com acesso aos resultados e opção de exclusão.
- Chat com educador financeiro contextualizado pela simulação.
- Persistência de diagnósticos, histórico e conversas no `localStorage`.
- Tema claro e escuro.

## Tecnologias

- React 19 e TypeScript
- Vite
- React Router
- Tailwind CSS
- Gemini API (`gemini-2.5-flash`)
- Lucide React para ícones
- ESLint e Prettier

## Como executar

### Pré-requisitos

- Node.js 20 ou superior
- Uma chave da Gemini API

### Instalação

1. Clone o repositório e entre na pasta do projeto.

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Crie o arquivo `.env.local` na raiz do projeto e informe sua chave:

   ```env
   VITE_GEMINI_API_KEY=sua_chave_aqui
   ```

4. Inicie a aplicação:

   ```bash
   npm run dev
   ```

5. Abra o endereço exibido no terminal — normalmente `http://localhost:5173`.

> A chave é usada somente para desenvolvimento neste projeto. Em uma aplicação publicada, a chamada à IA deve ser feita por um servidor para não expor a credencial no navegador.

## Melhoria implementada: chat com educador financeiro

Além do diagnóstico inicial, cada resultado conta com um chat para tirar dúvidas sobre a simulação. A IA recebe o contexto financeiro da pessoa e as mensagens mais recentes da conversa para responder de forma clara e relevante.

As perguntas e respostas são salvas junto da simulação no `localStorage`. Isso permite sair da página, abrir o Histórico e retomar a conversa posteriormente. O chat exibe carregamento enquanto a IA responde, informa erros de requisição e rola automaticamente até a mensagem mais recente.

## Como testar o fluxo principal

1. Execute a aplicação e clique em **Nova Simulação**.
2. Preencha renda, custos fixos, dívidas, nome da meta, custo e prazo.
3. Clique em **Gerar simulação** e aguarde o diagnóstico financeiro aparecer.
4. No fim do cartão de insights, envie uma pergunta, como: `Como posso atingir essa meta mais rápido?`.
5. Confirme que a resposta aparece, o chat rola até ela e a pergunta continua visível ao atualizar a página.
6. Abra **Histórico**, escolha **Ver detalhes** na simulação criada e confirme que o diagnóstico e a conversa foram preservados.
7. Para testar a exclusão, clique em **Excluir** no card da simulação e verifique o estado vazio ou a remoção do item da lista.

## Comandos disponíveis

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento. |
| `npm run lint` | Executa a verificação de estilo e qualidade do código. |
| `npm run build` | Gera a versão de produção em `dist`. |
| `npm run preview` | Serve localmente a versão gerada em produção. |
