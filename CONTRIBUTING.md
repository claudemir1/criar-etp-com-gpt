# 🤝 Guia de Contribuição

Obrigado por considerar contribuir com o projeto **Criar ETP com ChatGPT**! 

Este documento fornece diretrizes para contribuir com o projeto de forma eficiente e organizada.

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Posso Contribuir?](#como-posso-contribuir)
- [Processo de Desenvolvimento](#processo-de-desenvolvimento)
- [Padrões de Código](#padrões-de-código)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

## 📜 Código de Conduta

### Nosso Compromisso

Este projeto adota um código de conduta que esperamos que todos os participantes sigam. Ao participar, você concorda em manter um ambiente respeitoso e acolhedor.

### Comportamentos Esperados

✅ **Seja respeitoso e inclusivo**
✅ **Aceite críticas construtivas**
✅ **Foque no que é melhor para a comunidade**
✅ **Mostre empatia com outros membros**

### Comportamentos Inaceitáveis

❌ Uso de linguagem ou imagens sexualizadas
❌ Comentários trolls, insultos ou ataques pessoais/políticos
❌ Assédio público ou privado
❌ Publicar informações privadas de terceiros

## 🛠️ Como Posso Contribuir?

### 1. Reportar Bugs

Antes de reportar um bug:
- ✅ Verifique se já não existe uma issue similar
- ✅ Use a versão mais recente da extensão
- ✅ Colete informações detalhadas

**Template para reportar bugs:**

```markdown
**Descrição do Bug**
Uma descrição clara e concisa do bug.

**Passos para Reproduzir**
1. Vá para '...'
2. Clique em '...'
3. Role até '...'
4. Veja o erro

**Comportamento Esperado**
O que você esperava que acontecesse.

**Comportamento Atual**
O que realmente aconteceu.

**Screenshots**
Se aplicável, adicione screenshots.

**Ambiente:**
- SO: [ex: Windows 11]
- Navegador: [ex: Chrome 120]
- Versão da Extensão: [ex: 2.1]

**Contexto Adicional**
Qualquer outra informação relevante.
```

### 2. Sugerir Melhorias

Quer sugerir uma nova funcionalidade?

**Template para features:**

```markdown
**Qual problema isso resolve?**
Uma descrição clara do problema.

**Solução Proposta**
Como você imagina que isso funcionaria?

**Alternativas Consideradas**
Outras formas de resolver o problema.

**Contexto Adicional**
Screenshots, mockups, exemplos, etc.
```

### 3. Contribuir com Código

#### Áreas que Precisam de Ajuda

- 🐛 Correção de bugs
- ✨ Novas funcionalidades
- 📝 Documentação
- 🎨 Melhorias de UI/UX
- ♿ Acessibilidade
- 🌍 Internacionalização (i18n)
- 🧪 Testes automatizados

## 🔄 Processo de Desenvolvimento

### Setup do Ambiente

1. **Fork o repositório**
   ```bash
   # Clique em "Fork" no GitHub
   ```

2. **Clone seu fork**
   ```bash
   git clone https://github.com/SEU-USUARIO/criar-etp-com-gpt.git
   cd criar-etp-com-gpt
   ```

3. **Configure o remote upstream**
   ```bash
   git remote add upstream https://github.com/claudemir1/criar-etp-com-gpt.git
   ```

4. **Carregue a extensão no Chrome**
   - Abra `chrome://extensions/`
   - Ative "Modo do desenvolvedor"
   - Clique em "Carregar sem compactação"
   - Selecione a pasta do projeto

### Workflow de Desenvolvimento

1. **Crie uma branch**
   ```bash
   git checkout -b feature/minha-nova-feature
   ```

2. **Faça suas alterações**
   - Escreva código limpo e comentado
   - Siga os padrões do projeto
   - Teste suas mudanças

3. **Commit suas mudanças**
   ```bash
   git add .
   git commit -m "feat: adiciona nova funcionalidade X"
   ```

4. **Mantenha seu fork atualizado**
   ```bash
   git fetch upstream
   git rebase upstream/master
   ```

5. **Push para seu fork**
   ```bash
   git push origin feature/minha-nova-feature
   ```

6. **Abra um Pull Request**

## 💻 Padrões de Código

### JavaScript

```javascript
// ✅ BOM
const getUserName = (user) => {
  return user.name || 'Anônimo';
};

// ❌ RUIM
function a(u){return u.n||'a'}
```

**Diretrizes:**
- Use `const` e `let`, não `var`
- Use arrow functions quando apropriado
- Comente código complexo
- Use nomes descritivos
- Mantenha funções pequenas e focadas

### CSS

```css
/* ✅ BOM */
.button-primary {
  background-color: var(--primary);
  padding: 12px 24px;
  border-radius: 8px;
}

/* ❌ RUIM */
.btn{background:#1094ab;padding:12px 24px;}
```

**Diretrizes:**
- Use variáveis CSS
- Nomes de classe descritivos (kebab-case)
- Agrupe propriedades relacionadas
- Use rem/em ao invés de px quando apropriado

### HTML

```html
<!-- ✅ BOM -->
<button class="btn-primary" aria-label="Gerar ETP">
  <svg aria-hidden="true">...</svg>
  Gerar ETP
</button>

<!-- ❌ RUIM -->
<div onclick="gerar()">Gerar</div>
```

**Diretrizes:**
- Use tags semânticas
- Inclua atributos de acessibilidade
- Indentação consistente (2 espaços)

## 📝 Commit Guidelines

Seguimos o padrão [Conventional Commits](https://www.conventionalcommits.org/).

### Formato

```
<tipo>(<escopo>): <descrição>

[corpo opcional]

[rodapé opcional]
```

### Tipos

- **feat**: Nova funcionalidade
- **fix**: Correção de bug
- **docs**: Documentação
- **style**: Formatação (sem mudança de código)
- **refactor**: Refatoração
- **perf**: Melhoria de performance
- **test**: Testes
- **chore**: Tarefas de manutenção

### Exemplos

```bash
# Nova funcionalidade
git commit -m "feat(historico): adiciona filtro por data"

# Correção de bug
git commit -m "fix(textarea): corrige auto-resize ao carregar"

# Documentação
git commit -m "docs(readme): atualiza instruções de instalação"

# Refatoração
git commit -m "refactor(storage): simplifica lógica de salvamento"
```

### Regras

- Use o imperativo ("adiciona" não "adicionado")
- Primeira letra minúscula
- Sem ponto final
- Limite de 72 caracteres no título
- Corpo opcional para explicações detalhadas

## 🔀 Pull Request Process

### Checklist Antes de Abrir PR

- [ ] Código segue os padrões do projeto
- [ ] Comentários adicionados em código complexo
- [ ] Documentação atualizada (se necessário)
- [ ] Testado manualmente (sem erros no console)
- [ ] Commits seguem o padrão Conventional Commits
- [ ] Branch está atualizada com `master`

### Template de Pull Request

```markdown
## Descrição
Breve descrição das mudanças.

## Tipo de Mudança
- [ ] 🐛 Bug fix
- [ ] ✨ Nova funcionalidade
- [ ] 💥 Breaking change
- [ ] 📝 Documentação
- [ ] 🎨 Estilo/UI

## Como Testar
1. Passo 1
2. Passo 2
3. Resultado esperado

## Screenshots (se aplicável)
Cole screenshots aqui.

## Checklist
- [ ] Código testado localmente
- [ ] Documentação atualizada
- [ ] Sem erros no console
- [ ] Segue os padrões do projeto
```

### Processo de Review

1. Mantenedor revisa o código
2. Feedback é fornecido (se necessário)
3. Você faz as alterações solicitadas
4. PR é aprovado e merged
5. Branch é deletada

### Após o Merge

```bash
# Atualize seu fork
git checkout master
git pull upstream master
git push origin master

# Delete a branch local
git branch -d feature/minha-feature

# Delete a branch remota
git push origin --delete feature/minha-feature
```

## 🎯 Áreas Prioritárias

Contribuições são especialmente bem-vindas em:

1. **🧪 Testes Automatizados**
   - Configurar Jest
   - Criar testes unitários
   - Testes de integração

2. **♿ Acessibilidade**
   - ARIA labels
   - Navegação por teclado
   - Screen reader support

3. **🌍 Internacionalização**
   - Suporte para inglês
   - Suporte para espanhol
   - Sistema de i18n

4. **📱 Responsividade**
   - Otimizar para diferentes resoluções
   - Melhorar layout em telas pequenas

5. **🚀 Performance**
   - Otimizar carregamento
   - Reduzir uso de memória
   - Lazy loading

## 📞 Precisa de Ajuda?

- 💬 [Discussões no GitHub](https://github.com/claudemir1/criar-etp-com-gpt/discussions)
- 📧 Email: claudemir.andrade@usp.br
- 🐛 [Issues](https://github.com/claudemir1/criar-etp-com-gpt/issues)

## 🎉 Agradecimentos

Sua contribuição faz a diferença! Todo feedback, código, documentação ou até mesmo divulgação do projeto é muito apreciado.

**Obrigado por contribuir!** ⭐

---

<div align="center">

**[← Voltar ao README](README.md)**

</div>

