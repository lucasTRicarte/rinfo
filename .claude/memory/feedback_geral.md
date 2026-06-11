---
name: feedback-geral
description: Como Lucas prefere colaborar e padrões de trabalho observados
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 1c89d0e8-b05c-479a-9f12-87f1cb7f504e
---

Lucas testa cada funcionalidade antes de pedir a próxima — trabalha de forma incremental e confirma que está funcionando antes de avançar.

**Why:** Abordagem pragmática; prefere validar do que acumular funcionalidades quebradas.
**How to apply:** Não adiantar fases sem confirmação explícita de que a fase atual está funcionando.

---

Quando algo falha silenciosamente (botão volta ao estado normal sem erro), Lucas descreve o comportamento visual — não menciona erros de console.

**Why:** Não necessariamente abre o DevTools durante testes.
**How to apply:** Sempre adicionar try/catch com setErro() visível em formulários de admin. Nunca deixar exceções dentro de startTransition sem captura.

---

Lucas fornece tokens e chaves diretamente no chat quando solicitado para que eu atualize o .env.local.

**Why:** Prefere fluxo direto sem ter que editar arquivos manualmente.
**How to apply:** Aceitar credenciais no chat e atualizar .env.local diretamente, sem fazer perguntas desnecessárias sobre formato.

---

Prefere ajustes visuais iterativos com percentuais exatos (ex: "aumente 15%").

**Why:** Tem uma visão clara do que quer mas ajusta por tentativa visual.
**How to apply:** Aplicar o percentual matematicamente sobre o valor atual e registrar o novo valor. Não arredondar para classes Tailwind padrão se o valor exato for mais preciso.
