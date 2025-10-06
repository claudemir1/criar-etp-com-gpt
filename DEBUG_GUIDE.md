# 🐛 Guia de Debug - Injeção de Prompt no ChatGPT

## 📋 Como Testar e Ver os Logs Detalhados

### Passo 1: Recarregar a Extensão

1. Vá para `chrome://extensions/`
2. Encontre "Criar ETP com chat GPT"
3. Clique no ícone de **reload (↻)**

### Passo 2: Abrir o ChatGPT e o Console

1. Abra uma nova aba: `https://chatgpt.com`
2. Pressione **F12** para abrir o DevTools
3. Clique na aba **"Console"** (no topo do DevTools)
4. **IMPORTANTE**: Mantenha o Console aberto durante todo o processo

### Passo 3: Abrir o Side Panel

1. Clique no ícone da extensão na barra de ferramentas
2. O Side Panel deve abrir à direita

### Passo 4: Preencher e Enviar

1. Preencha todos os campos do formulário
2. Clique em **"Gerar ETP"**
3. **OBSERVE O CONSOLE** - você deve ver mensagens com emojis

### 🔍 O que esperar ver no Console:

Se tudo funcionar corretamente, você verá algo assim:

```
🚀 ========== INICIANDO INJEÇÃO DO PROMPT ==========
📝 Tamanho do prompt: 2847 caracteres
✅ Campo de prompt encontrado!
📍 Tag: DIV
📍 ID: prompt-textarea
📍 ContentEditable: true
🧹 Campo limpo
🎯 Campo focado
📝 execCommand insertText: ✅ Sucesso
✔️ Conteúdo atual (primeiros 100 chars): Atue como demandante de área técnica de autarquia pública estadual...
📡 Eventos disparados: input, change, keydown, keyup, keypress
🔍 Procurando botão de enviar...
✅ Botão encontrado com seletor: button[aria-label="Enviar prompt"]
🎯 Botão encontrado: {disabled: false, tagName: "BUTTON", ariaLabel: "Enviar prompt"}
✅ Botão habilitado! Clicando...
🚀 PROMPT ENVIADO COM SUCESSO!
🎉 ========== FIM DA INJEÇÃO ==========
```

---

## 🆘 Se Algo Der Errado

### Cenário 1: Campo não encontrado

```
❌ ERRO: Campo de prompt não encontrado em nenhuma estratégia
🔍 Debug - contenteditable elements: 0
```

**O que fazer:**

1. Verifique se a página do ChatGPT está completamente carregada
2. Tente recarregar a página do ChatGPT (F5)
3. Verifique se você está em `chatgpt.com` (não em outra versão)
4. **Me envie um print do console**

### Cenário 2: Botão não encontrado

```
❌ ERRO: Botão de enviar não encontrado
💡 Dica: A página do ChatGPT pode ter mudado. Verifique se você está logado.
```

**O que fazer:**

1. Verifique se há um campo de texto visível na página
2. Tente digitar algo manualmente para ver se o botão aparece
3. **Me envie um print da página completa do ChatGPT**
4. **Me envie um print do console com os logs**

### Cenário 3: Botão não habilita

```
⏳ Tentativa 1/50 - Aguardando botão habilitar...
⏳ Tentativa 2/50 - Aguardando botão habilitar...
...
❌ Timeout: Botão nunca ficou habilitado
```

**O que fazer:**

1. O texto pode não estar sendo inserido corretamente
2. Procure no console por "✔️ Conteúdo atual" e veja se aparece o texto
3. **Me envie todo o log do console**

---

## 📸 Informações para me Enviar

Se continuar com problemas, me envie:

### 1. Print do Console Completo

- Abra o console (F12 → Console)
- Gere o ETP
- Clique com botão direito no console
- **"Save as..."** e salve como arquivo `.txt`
- **OU** tire um print da tela inteira do console

### 2. Print da Página do ChatGPT

- Mostre como está a interface do ChatGPT
- Se possível, mostre o campo de texto

### 3. Versão do Chrome

- Digite `chrome://version` na barra de endereços
- Me envie a primeira linha (versão)

### 4. Console da Extensão (Side Panel)

- Com o Side Panel aberto, clique com botão direito nele
- Selecione **"Inspecionar"**
- Vá para a aba **Console**
- Me envie qualquer erro que aparecer em vermelho

---

## 🔧 Testes Adicionais

### Teste 1: Verificar se o campo existe

Cole isso no console do ChatGPT e me diga o resultado:

```javascript
console.log('Teste 1 - Procurar campo:');
console.log('Por ID:', document.getElementById('prompt-textarea'));
console.log(
  'Contenteditable:',
  document.querySelectorAll('[contenteditable="true"]').length
);
```

### Teste 2: Verificar botão

Cole isso no console do ChatGPT:

```javascript
console.log('Teste 2 - Procurar botão:');
const selectors = [
  'button[data-testid="send-button"]',
  'button[aria-label="Enviar prompt"]',
  'button[aria-label="Send prompt"]',
];
selectors.forEach(sel => {
  console.log(sel, ':', document.querySelector(sel));
});
```

### Teste 3: Inserir texto manualmente

Cole isso no console do ChatGPT:

```javascript
console.log('Teste 3 - Inserir texto manual:');
const field = document.getElementById('prompt-textarea');
if (field) {
  field.focus();
  document.execCommand('insertText', false, 'Teste de texto');
  console.log('Texto inserido:', field.textContent);
} else {
  console.log('Campo não encontrado!');
}
```

---

## 📊 Checklist de Debug

Antes de me enviar as informações, verifique:

- [ ] Extensão foi recarregada (chrome://extensions/)
- [ ] Página do ChatGPT foi recarregada (F5)
- [ ] Console está aberto (F12)
- [ ] Tentou mais de uma vez
- [ ] Está usando a URL correta (chatgpt.com)
- [ ] Não há erros em vermelho no console da extensão

---

## 💡 Dicas Importantes

1. **Sempre mantenha o console aberto** - os logs são essenciais para debug
2. **Os emojis ajudam** - ✅ = sucesso, ❌ = erro, ⏳ = aguardando
3. **Leia as mensagens** - elas indicam exatamente o que está acontecendo
4. **Não feche o DevTools** - os logs desaparecem se você fechar

---

## 🚀 Se Funcionar

Quando funcionar, você verá:

1. ✅ Texto sendo inserido no campo do ChatGPT
2. 🚀 Botão sendo clicado automaticamente
3. 💬 ChatGPT começando a responder
4. ✅ Mensagem de sucesso no Side Panel

---

## 📝 Template para Relatar Problema

```
**LOGS DO CONSOLE:**
[Cole aqui os logs completos do console do ChatGPT]

**RESULTADO DOS TESTES:**
Teste 1: [Cole resultado]
Teste 2: [Cole resultado]
Teste 3: [Cole resultado]

**VERSÃO DO CHROME:**
[Cole a versão]

**O QUE ACONTECEU:**
[Descreva o que você viu]

**PRINTS:**
[Anexe prints se possível]
```
