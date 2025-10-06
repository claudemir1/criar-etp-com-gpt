# 🧪 Guia de Teste - Extensão Criar ETP v2.0

## 📋 Checklist de Teste

### 1. Instalação da Extensão

- [ ] Abrir Chrome e navegar para `chrome://extensions/`
- [ ] Ativar "Modo do desenvolvedor"
- [ ] Clicar em "Carregar sem compactação"
- [ ] Selecionar a pasta do projeto
- [ ] Verificar se o ícone da extensão aparece na barra de ferramentas

### 2. Teste do Side Panel

- [ ] Navegar para https://chatgpt.com
- [ ] Clicar no ícone da extensão
- [ ] Verificar se o Side Panel abre ao lado da página
- [ ] Verificar se a interface está completa e bem formatada
- [ ] Testar redimensionamento da janela

### 3. Teste de Persistência de Dados

- [ ] Digite um texto no campo "Descrição da necessidade"
- [ ] Fechar o Side Panel
- [ ] Reabrir o Side Panel
- [ ] Verificar se o texto foi mantido

### 4. Teste de Validação de Formulário

**Botão deve estar desabilitado quando:**
- [ ] Campo de contexto está vazio
- [ ] Nenhum número de parágrafos selecionado
- [ ] Opção de tabular não selecionada
- [ ] Previsão no PCA não selecionada
- [ ] Comparação com locação não selecionada

**Botão deve estar habilitado quando:**
- [ ] Todos os campos estão preenchidos

### 5. Teste de Geração de ETP

#### Preparação
- [ ] Abrir https://chatgpt.com em uma aba
- [ ] Fazer login (se necessário) ou clicar em "Permanecer desconectado"
- [ ] Abrir o Side Panel da extensão

#### Teste 1: Geração Básica
- [ ] Preencher o contexto com: "Aquisição de computadores para a Secretaria da Educação, sendo necessários 50 computadores desktop"
- [ ] Selecionar 3 parágrafos
- [ ] Selecionar "Sim" para tabular
- [ ] Selecionar "Sim" para previsão no PCA
- [ ] Selecionar "Sim" para comparação com locação
- [ ] Clicar em "Gerar ETP"
- [ ] Verificar se aparece a mensagem "Conectando ao ChatGPT..."
- [ ] Verificar se o prompt é inserido no ChatGPT
- [ ] Verificar se o botão de enviar é clicado automaticamente
- [ ] Verificar se o ChatGPT começa a gerar a resposta
- [ ] Verificar se a mensagem de sucesso aparece

#### Teste 2: Diferentes Configurações
- [ ] Testar com 1 parágrafo
- [ ] Testar com 5 parágrafos
- [ ] Testar com tabular = "Não"
- [ ] Testar com previsão = "Não"
- [ ] Testar com locação = "Não"

### 6. Teste de Feedback Visual

- [ ] Ao clicar em "Gerar ETP", verificar se o spinner aparece
- [ ] Verificar se as mensagens de status aparecem:
  - "Conectando ao ChatGPT..."
  - "Preparando prompt..."
  - "Enviando para o ChatGPT..."
  - "ETP gerado com sucesso! ✓"
- [ ] Verificar se o spinner desaparece após conclusão
- [ ] Verificar animações suaves

### 7. Teste de Sistema de Ajuda

- [ ] Clicar no "?" ao lado de "Quantidade de parágrafos"
- [ ] Verificar se a dica aparece
- [ ] Mover o mouse para fora
- [ ] Verificar se a dica desaparece
- [ ] Repetir para o "?" de "Tabular estimativa"

### 8. Teste de Limpar Campo

- [ ] Digite texto no campo de contexto
- [ ] Verificar se o ícone X aparece
- [ ] Clicar no X
- [ ] Verificar se o campo é limpo
- [ ] Verificar se o ícone X desaparece
- [ ] Verificar se o botão "Gerar ETP" fica desabilitado

### 9. Teste de Sobre/Footer

- [ ] Passar o mouse sobre "Sobre"
- [ ] Verificar se o footer com informações do desenvolvedor aparece
- [ ] Mover o mouse para fora do footer
- [ ] Verificar se volta para "Sobre"
- [ ] Clicar no link de contato
- [ ] Verificar se abre o Gmail em nova aba

### 10. Teste de Tratamento de Erros

#### Teste com ChatGPT fechado
- [ ] Fechar todas as abas do ChatGPT
- [ ] Abrir o Side Panel
- [ ] Clicar em "Gerar ETP"
- [ ] Verificar se uma nova aba do ChatGPT é aberta automaticamente

#### Teste de conexão
- [ ] Desabilitar temporariamente a internet
- [ ] Tentar gerar um ETP
- [ ] Verificar se uma mensagem de erro apropriada aparece

### 11. Teste de Performance

- [ ] Gerar múltiplos ETPs em sequência
- [ ] Verificar se não há vazamento de memória
- [ ] Verificar se a extensão continua responsiva
- [ ] Verificar se o console não mostra erros

### 12. Teste de Compatibilidade

- [ ] Testar em diferentes tamanhos de janela
- [ ] Testar com zoom diferente (50%, 100%, 150%)
- [ ] Verificar responsividade da interface

## 🐛 Problemas Conhecidos e Soluções

### Problema: Side Panel não abre
**Solução**: Verificar se está usando Chrome 114 ou superior

### Problema: Botão de enviar não é clicado
**Solução**: Aguardar alguns segundos para a página do ChatGPT carregar completamente

### Problema: Prompt não aparece no ChatGPT
**Solução**: Recarregar a página do ChatGPT e tentar novamente

## ✅ Critérios de Aceitação

Para considerar a extensão funcionando corretamente:

- ✅ Side Panel abre corretamente
- ✅ Todos os campos de formulário funcionam
- ✅ Validação impede envio sem todos os campos
- ✅ Persistência de dados funciona
- ✅ Geração de ETP funciona de forma consistente
- ✅ Feedback visual aparece corretamente
- ✅ Não há erros no console do navegador
- ✅ Interface é responsiva e agradável
- ✅ Sistema de ajuda funciona
- ✅ Tratamento de erros funciona

## 📊 Relatório de Bugs

Se encontrar algum bug, documente:
1. Descrição do problema
2. Passos para reproduzir
3. Comportamento esperado
4. Comportamento atual
5. Screenshots (se aplicável)
6. Versão do Chrome
7. Console logs

