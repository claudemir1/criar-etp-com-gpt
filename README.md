# 📝 Criar ETP com ChatGPT

Extensão do Chrome para automatizar a criação de Estudos Técnicos Preliminares (ETP) para contratações públicas utilizando o ChatGPT.

## 🎯 Funcionalidades

- **Side Panel Integrado**: Interface lateral que funciona lado a lado com o ChatGPT
- **Geração Automatizada**: Cria ETPs completos com base em parâmetros configuráveis
- **Persistência de Dados**: Salva automaticamente o contexto da contratação
- **Validação Inteligente**: Só permite geração quando todos os campos estão preenchidos
- **Feedback Visual**: Indicadores de status durante o processamento
- **Interface Intuitiva**: Design limpo e fácil de usar

## 🚀 Instalação

### Pré-requisitos
- Google Chrome versão 114 ou superior
- Conta no ChatGPT (https://chatgpt.com)

### Passos

1. Clone ou baixe este repositório
2. Abra o Chrome e navegue para `chrome://extensions/`
3. Ative o "Modo do desenvolvedor" no canto superior direito
4. Clique em "Carregar sem compactação"
5. Selecione a pasta do projeto

## 📖 Como Usar

1. **Navegue até o ChatGPT**: Abra https://chatgpt.com
2. **Abra o Side Panel**: Clique no ícone da extensão na barra de ferramentas
3. **Preencha os campos**:
   - Descrição da necessidade da contratação
   - Quantidade de parágrafos por seção (1-5)
   - Preferência de formato tabular para estimativa de preços
   - Se a contratação está prevista no PCA
   - Se deseja comparar com locação
4. **Gere o ETP**: Clique em "Gerar ETP" e aguarde o processamento
5. **Revise o resultado**: O ChatGPT gerará o ETP completo na tela principal

## 🏗️ Estrutura do Projeto

```
.
├── manifest.json          # Configuração da extensão
├── background.js          # Service Worker para gerenciar o Side Panel
├── sidepanel.html         # Interface do usuário
├── sidepanel.js           # Lógica principal da aplicação
├── style.css              # Estilos da interface
├── images/                # Ícones da extensão
│   ├── icon_16x16.png
│   ├── icon_32x32.png
│   ├── icon_48x48.png
│   └── icon_128x128.png
└── README.md
```

## 🔧 Tecnologias Utilizadas

- **Chrome Extension Manifest V3**: Versão mais recente da API de extensões
- **Chrome Side Panel API**: Para interface lateral nativa
- **JavaScript ES6+**: Código moderno e organizado
- **Chrome Storage API**: Persistência de dados local
- **MutationObserver**: Detecção eficiente de mudanças no DOM

## 📋 Funcionalidades Técnicas

### Melhorias Implementadas na v2.0

- ✅ **Side Panel API**: Interface lateral nativa do Chrome
- ✅ **Código Moderno**: Refatoração completa usando ES6+
- ✅ **Tratamento de Erros**: Try-catch em todas as operações críticas
- ✅ **MutationObserver**: Substituição de setInterval para melhor performance
- ✅ **Feedback Visual**: Spinner e mensagens de status
- ✅ **Validação Robusta**: Verificação de todos os campos obrigatórios
- ✅ **Organização Modular**: Código separado em módulos lógicos
- ✅ **Correção de Bugs**: Todos os bugs críticos da v1.2 corrigidos

## 📄 Licença

Este projeto foi desenvolvido por **Claudemir Andrade** para auxiliar na elaboração de ETPs conforme a Lei nº 14.133/21 e o Decreto Estadual n° 68.185/2023 do Estado de São Paulo.

## 📧 Contato

Para suporte ou sugestões, entre em contato:
- Email: claudemir.andrade@usp.br

## 🔄 Changelog

### v2.0 (2024)
- Implementação do Chrome Side Panel API
- Refatoração completa do código JavaScript
- Correção de bugs críticos
- Adição de feedback visual de processamento
- Melhoria na organização e manutenibilidade do código
- Implementação de MutationObserver para melhor performance
- Validação aprimorada de formulários

### v1.2 (2024)
- Versão inicial com popup
- Funcionalidade básica de geração de ETP
- Persistência de contexto
- Sistema de ajuda integrado

