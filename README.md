# 📝 Criar ETP com ChatGPT

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-2.0-blue.svg)](https://github.com/claudemir1/criar-etp-com-gpt)
[![Chrome Web Store](https://img.shields.io/badge/chrome-extension-blue.svg)](https://chrome.google.com/webstore)

> Extensão para Google Chrome que automatiza a criação de Estudos Técnicos Preliminares (ETP) utilizando ChatGPT, seguindo as diretrizes da Instrução Normativa SGD/MGI nº 98/2023.

![Banner](https://via.placeholder.com/800x400/1094ab/ffffff?text=Criar+ETP+com+ChatGPT)

## 📋 Sobre o Projeto

Esta extensão foi desenvolvida para auxiliar servidores públicos e profissionais de compras governamentais na elaboração de Estudos Técnicos Preliminares (ETP), automatizando a redação e oferecendo sugestões de texto contextualizadas através do ChatGPT.

A ferramenta gera ETPs completos com as 13 seções obrigatórias, conforme a legislação vigente, economizando tempo e garantindo consistência na documentação.

## ✨ Funcionalidades

### 🎯 Principais Recursos

- **🤖 Integração com ChatGPT**: Gera ETPs completos diretamente na interface do ChatGPT
- **📑 Side Panel**: Interface lateral que permite visualizar a extensão e o ChatGPT simultaneamente
- **🎨 Interface Moderna**: Design elegante com tema claro/escuro automático
- **📊 13 Seções Completas**: Gera todas as seções obrigatórias do ETP automaticamente
- **💾 Histórico Inteligente**: Salva os últimos 5 ETPs com respostas completas do ChatGPT
- **📋 Copiar por Seção**: Copie cada seção individualmente ou o documento completo
- **🔄 Auto-resize**: Textarea que se ajusta automaticamente ao conteúdo
- **✅ Validação em Tempo Real**: Verifica se todos os campos obrigatórios estão preenchidos
- **🗑️ Gerenciamento**: Exclua ETPs antigos com confirmação de segurança

### 📝 Seções do ETP Geradas

1. Descrição da Necessidade da Contratação
2. Demonstração da Previsão no PCA
3. Área Requisitante
4. Descrição dos Requisitos da Contratação
5. Levantamento de Mercado
6. Estimativa de Valores
7. Descrição da Solução como um Todo
8. Justificativas
9. Sustentabilidade Socioambiental
10. Estimativa Impacto Econômico-Financeiro
11. Providências a Serem Adotadas
12. Possíveis Impactos Ambientais
13. Posicionamento Conclusivo

## 🛠️ Tecnologias Utilizadas

### Frontend

- **HTML5** - Estrutura semântica
- **CSS3** - Estilização moderna com variáveis CSS
- **JavaScript (ES6+)** - Lógica da aplicação

### APIs do Chrome

- **Chrome Extension Manifest V3** - Última versão da API de extensões
- **Chrome Side Panel API** - Interface lateral
- **Chrome Storage API** - Persistência de dados local
- **Chrome Scripting API** - Injeção de scripts no ChatGPT

### Ferramentas

- **Git** - Controle de versão
- **GitHub** - Hospedagem do código

## 🎨 Design System

### Paleta de Cores

- **Primary**: `#1094ab` (Azul Turquesa)
- **Secondary**: `#64c4d2` (Azul Claro)
- **Accent**: `#fcb421` (Amarelo)

### Características

- Modo escuro automático baseado nas preferências do sistema
- Toggle manual de tema
- Animações suaves com `cubic-bezier`
- Radio buttons com animações de check
- Feedback visual em todas as interações

## ⚙️ Instalação e Uso

### Requisitos

- Google Chrome versão 88 ou superior
- Conta ativa no ChatGPT (https://chatgpt.com)

### Instalação via Chrome Web Store

1. Acesse a [Chrome Web Store](#) (em breve)
2. Clique em "Adicionar ao Chrome"
3. Confirme a instalação

### Instalação Manual (Desenvolvedor)

1. **Clone o repositório**

```bash
git clone https://github.com/claudemir1/criar-etp-com-gpt.git
cd criar-etp-com-gpt
```

2. **Carregue a extensão no Chrome**

   - Abra o Chrome e acesse `chrome://extensions/`
   - Ative o "Modo do desenvolvedor" no canto superior direito
   - Clique em "Carregar sem compactação"
   - Selecione a pasta do projeto

3. **Pronto!** 🎉
   - O ícone da extensão aparecerá na barra de ferramentas
   - Acesse https://chatgpt.com
   - Clique no ícone da extensão para abrir o painel lateral

### Como Usar

1. **Preencha o contexto**: Descreva a necessidade de aquisição/contratação
2. **Configure as opções**:
   - Quantidade de parágrafos por seção (1-5)
   - Se é tabular ou não
   - Se está previsto no PCA
   - Se é locação
3. **Clique em "Gerar ETP"**
4. **Aguarde**: A extensão enviará o prompt ao ChatGPT e aguardará a resposta completa
5. **Visualize e copie**: Use o botão "Ver Resposta Completa" para acessar o ETP organizado por seções

## 📚 Documentação Adicional

- **[CHANGELOG.md](CHANGELOG-v2.0.md)** - Histórico de versões e alterações
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Guia para contribuidores
- **[DEBUG_GUIDE.md](DEBUG_GUIDE.md)** - Guia de depuração
- **[GUIA_TESTE.md](GUIA_TESTE.md)** - Manual de testes

## 🤝 Contribuições

Contribuições são muito bem-vindas! Este é um projeto open source e qualquer ajuda é apreciada.

### Como Contribuir

1. **Fork o projeto**
2. **Crie uma branch para sua feature**
   ```bash
   git checkout -b feature/MinhaNovaFeature
   ```
3. **Commit suas mudanças**
   ```bash
   git commit -m 'feat: Adiciona nova funcionalidade X'
   ```
4. **Push para a branch**
   ```bash
   git push origin feature/MinhaNovaFeature
   ```
5. **Abra um Pull Request**

### Padrão de Commits

Seguimos o padrão [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação, sem mudança de código
- `refactor:` Refatoração de código
- `test:` Adição ou correção de testes
- `chore:` Tarefas de manutenção

### Código de Conduta

Por favor, seja respeitoso e construtivo em todas as interações. Veja [CONTRIBUTING.md](CONTRIBUTING.md) para mais detalhes.

## 🐛 Reportar Bugs

Encontrou um bug? Por favor, [abra uma issue](https://github.com/claudemir1/criar-etp-com-gpt/issues) com:

- Descrição detalhada do problema
- Passos para reproduzir
- Comportamento esperado vs. comportamento atual
- Screenshots (se aplicável)
- Versão do Chrome e da extensão

## 💡 Roadmap

### Versão 2.1 (Planejado)

- [ ] Exportar ETP para Word (.docx)
- [ ] Sincronização entre dispositivos

### Versão 3.0 (Futuro)

- [ ] Desenvolvimento do TRP (termo de referencia preliminar)
- [ ] Modo colaborativo
- [ ] Análise de qualidade do ETP

## 📊 Estatísticas do Projeto

- **Linhas de código**: ~3,500
- **Arquivos**: 20+
- **Versão atual**: 2.0
- **Última atualização**: Outubro 2025

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

```
MIT License - Copyright (c) 2025 Claudemir Andrade
```

## 👤 Autor

**Claudemir Andrade**

- GitHub: [@claudemir1](https://github.com/claudemir1)
- Email: claudemir.andrade@usp.br

## 🙏 Agradecimentos

- ChatGPT pela API que tornou tudo possível
- Comunidade open source por compartilhar conhecimento
- Todos os usuários que testam e fornecem feedback

---

<div align="center">

**⭐ Se este projeto te ajudou, considere dar uma estrela!**

[Reportar Bug](https://github.com/claudemir1/criar-etp-com-gpt/issues) •
[Solicitar Feature](https://github.com/claudemir1/criar-etp-com-gpt/issues) •
[Documentação](https://github.com/claudemir1/criar-etp-com-gpt/wiki)

</div>
