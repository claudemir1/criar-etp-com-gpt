// ========================================
// CONSTANTES E CONFIGURAÇÕES
// ========================================
const CONFIG = {
  CHATGPT_URL: 'https://chatgpt.com/',
  SELECTORS: {
    PROMPT_TEXTAREA: '#prompt-textarea',
    SEND_BUTTON: 'button[aria-label="Enviar prompt"]',
    STAY_LOGGED_OUT: 'a:contains("Permanecer desconectado")',
    ARTICLES: 'article'
  },
  TIMEOUTS: {
    BUTTON_CHECK: 200,
    MAX_RETRIES: 50,
    ARTICLE_CLEANUP: 1000
  }
};

// ========================================
// GERENCIAMENTO DE ESTADO
// ========================================
const state = {
  isProcessing: false,
  currentTabId: null
};

// ========================================
// UTILITÁRIOS
// ========================================
const Utils = {
  /**
   * Mostra feedback visual de processamento
   */
  showStatus(message, isError = false) {
    const statusContainer = document.getElementById('status-container');
    const statusText = document.getElementById('status-text');
    
    if (statusContainer && statusText) {
      statusText.textContent = message;
      statusContainer.classList.remove('hidden');
      if (isError) {
        statusContainer.classList.add('error');
      } else {
        statusContainer.classList.remove('error');
      }
    }
  },

  /**
   * Esconde o feedback de status
   */
  hideStatus() {
    const statusContainer = document.getElementById('status-container');
    if (statusContainer) {
      statusContainer.classList.add('hidden');
    }
  },

  /**
   * Valida se todos os campos obrigatórios estão preenchidos
   */
  validateForm() {
    const contexto = document.getElementById('contexto')?.value.trim();
    const pg = document.querySelector('input[name="paragrafos"]:checked')?.value;
    const tabular = document.querySelector('input[name="tabular"]:checked')?.value;
    const previsao = document.querySelector('input[name="previsao"]:checked')?.value;
    const locacao = document.querySelector('input[name="locacao"]:checked')?.value;
    
    return !!(contexto && pg && tabular && previsao && locacao);
  },

  /**
   * Atualiza o estado do botão Gerar ETP
   */
  updateSubmitButton() {
    const button = document.getElementById('inserir');
    if (button) {
      if (this.validateForm()) {
        button.disabled = false;
        button.style.opacity = '1';
      } else {
        button.disabled = true;
        button.style.opacity = '0.5';
      }
    }
  },

  /**
   * Gera o prompt completo para o ChatGPT
   */
  generatePrompt(paragr, contexto, tabular, previsao, locacao) {
    const locacaoText = locacao === 'sim' ? 'e locação' : 'e outras opções de mercado';
    const complemento = tabular === 'não'
      ? '*Na seção VI, apresente o resultado da estimativa de preços em forma de texto, contendo até três valores para cada tipo de item nos últimos três meses, indicando as fontes e incluindo o valor médio de cada item.*'
      : '*Na seção VI, apresente o resultado da estimativa de preços em uma tabela, contendo até três valores para cada tipo de item nos últimos três meses, indicando as fontes e incluindo o valor médio de cada item.*';
    
    const previsaoText = previsao === 'sim' ? 'está prevista' : 'não está prevista';

    return `Atue como demandante de área técnica de autarquia pública estadual, especialista na elaboração do estudo técnico preliminar (ETP).

O estudo técnico preliminar (ETP) é documento constitutivo da primeira etapa do planejamento de uma contratação pública que caracteriza o interesse público envolvido, conforme previsto na lei nº 14.133/21 e no Decreto Estadual n° 68.185, de 11 de dezembro de 2023, do governo do estado de São Paulo.

A sua tarefa é redigir, para cada seção do ETP delimitada por #, o que se pede em seguida, considerando o seguinte contexto: ${contexto}.

Mantenha coerência e alinhamento entre as seções do ETP. Demonstre concisão, clareza e perícia redacional.

Considere que a contratação ${previsaoText} no plano de contratações anual.

Utilize fontes distintas para destacar os incisos e inclua um título para o ETP.

Elabore, em até ${paragr} parágrafos, as descrições solicitadas em cada seção, considerado o problema a ser resolvido ou necessidade a ser atendida, sob a perspectiva do interesse público.
${complemento}

*Acrescente, na Seção V, uma comparação entre compra ${locacaoText}, avaliando qual alternativa oferece maior vantagem financeira. Caso haja outra opção além da compra ${locacaoText}, descreva-a detalhadamente. Com base na pesquisa de mercado ofereça sugestão do material ou serviço a ser contrato*

#I - descrição da necessidade da contratação, considerado o problema a ser resolvido sob a perspectiva do interesse público;#

#II - demonstração da previsão da contratação no plano de contratações anual, sempre que elaborado, de modo a indicar o seu alinhamento com o planejamento da Administração;#

#III - requisitos da contratação;#

#IV - estimativas das quantidades para a contratação, acompanhadas das memórias de cálculo e dos documentos que lhes dão suporte, que considerem interdependências com outras contratações, de modo a possibilitar economia de escala;#

#V - levantamento de mercado, que consiste na análise das alternativas possíveis, e justificativa técnica e econômica da escolha do tipo de solução a contratar;#

#VI - estimativa do valor da contratação, acompanhada dos preços unitários referenciais, das memórias de cálculo e dos documentos que lhe dão suporte, que poderão constar de anexo classificado, se a Administração optar por preservar o seu sigilo até a conclusão da licitação;#

#VII - descrição da solução como um todo, inclusive das exigências relacionadas à manutenção e à assistência técnica, quando for o caso;#

#VIII - justificativas para o parcelamento ou não da contratação;#

#IX - demonstrativo dos resultados pretendidos em termos de economicidade e de melhor aproveitamento dos recursos humanos, materiais e financeiros disponíveis;#

#X - providências a serem adotadas pela Administração previamente à celebração do contrato, inclusive quanto à capacitação de servidores ou de empregados para fiscalização e gestão contratual;#

#XI - contratações correlatas e/ou interdependentes;#

#XII - descrição de possíveis impactos ambientais e respectivas medidas mitigadoras, incluídos requisitos de baixo consumo de energia e de outros recursos, bem como logística reversa para desfazimento e reciclagem de bens e refugos, quando aplicável;#

#XIII - posicionamento conclusivo sobre a adequação da contratação para o atendimento da necessidade a que se destina.#`;
  }
};

// ========================================
// INTERAÇÃO COM O CHATGPT
// ========================================
const ChatGPT = {
  /**
   * Verifica se a aba atual é do ChatGPT
   */
  async getCurrentChatGPTTab() {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const currentTab = tabs[0];
      
      if (!currentTab.url?.includes('chatgpt.com')) {
        // Se não estiver no ChatGPT, abre uma nova aba
        const newTab = await chrome.tabs.create({ 
          url: CONFIG.CHATGPT_URL, 
          active: true 
        });
        return newTab.id;
      }
      
      return currentTab.id;
    } catch (error) {
      console.error('Erro ao obter aba do ChatGPT:', error);
      throw new Error('Não foi possível acessar o ChatGPT');
    }
  },

  /**
   * Injeta o prompt no ChatGPT e envia
   */
  async sendPrompt(tabId, promptText) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        func: this.injectAndSendPrompt,
        args: [promptText]
      });
    } catch (error) {
      console.error('Erro ao enviar prompt:', error);
      throw new Error('Erro ao enviar prompt para o ChatGPT');
    }
  },

  /**
   * Função injetada na página do ChatGPT
   */
  injectAndSendPrompt(promptText) {
    return new Promise((resolve, reject) => {
      try {
        // Encontra o campo de texto do prompt
        const promptInput = document.getElementById('prompt-textarea');
        
        if (!promptInput) {
          reject('Campo de prompt não encontrado');
          return;
        }

        // Insere o texto
        promptInput.value = '';
        promptInput.textContent = promptText;
        promptInput.dispatchEvent(new Event('input', { bubbles: true }));

        // Aguarda o botão de enviar ficar disponível usando MutationObserver
        const sendButton = document.querySelector('button[aria-label="Enviar prompt"]');
        
        if (!sendButton) {
          reject('Botão de enviar não encontrado');
          return;
        }

        // Usa MutationObserver para detectar quando o botão fica habilitado
        const observer = new MutationObserver((mutations) => {
          if (!sendButton.disabled) {
            observer.disconnect();
            sendButton.click();
            
            // Remove o artigo com o prompt após um curto delay
            setTimeout(() => {
              const articles = document.querySelectorAll('article');
              articles.forEach(article => {
                if (article.textContent.includes('Atue como demandante')) {
                  article.remove();
                }
              });
            }, 1000);
            
            resolve('Prompt enviado com sucesso');
          }
        });

        observer.observe(sendButton, {
          attributes: true,
          attributeFilter: ['disabled']
        });

        // Timeout de segurança
        setTimeout(() => {
          observer.disconnect();
          if (sendButton.disabled) {
            reject('Timeout: botão de enviar não ficou disponível');
          }
        }, 10000);

      } catch (error) {
        reject('Erro ao processar prompt: ' + error.message);
      }
    });
  }
};

// ========================================
// GERENCIAMENTO DE STORAGE
// ========================================
const Storage = {
  /**
   * Carrega o contexto salvo
   */
  async loadContext() {
    try {
      const result = await chrome.storage.local.get('contexto');
      const contextoField = document.getElementById('contexto');
      const limparBtn = document.getElementById('limpar');
      
      if (result.contexto && contextoField) {
        contextoField.value = result.contexto;
        if (limparBtn) {
          limparBtn.style.display = 'block';
        }
      }
    } catch (error) {
      console.error('Erro ao carregar contexto:', error);
    }
  },

  /**
   * Salva o contexto
   */
  async saveContext(texto) {
    try {
      await chrome.storage.local.set({ contexto: texto });
    } catch (error) {
      console.error('Erro ao salvar contexto:', error);
    }
  },

  /**
   * Remove o contexto
   */
  async clearContext() {
    try {
      await chrome.storage.local.remove('contexto');
    } catch (error) {
      console.error('Erro ao limpar contexto:', error);
    }
  }
};

// ========================================
// MANIPULADORES DE EVENTOS
// ========================================
const EventHandlers = {
  /**
   * Inicializa todos os event listeners
   */
  init() {
    // Carrega contexto salvo
    Storage.loadContext();

    // Campo de contexto
    const contextoField = document.getElementById('contexto');
    if (contextoField) {
      contextoField.addEventListener('input', (e) => {
        const limparBtn = document.getElementById('limpar');
        Storage.saveContext(e.target.value);
        if (limparBtn) {
          limparBtn.style.display = e.target.value ? 'block' : 'none';
        }
        Utils.updateSubmitButton();
      });
    }

    // Botão limpar
    const limparBtn = document.getElementById('limpar');
    if (limparBtn) {
      limparBtn.addEventListener('click', () => {
        if (contextoField) {
          contextoField.value = '';
        }
        Storage.clearContext();
        limparBtn.style.display = 'none';
        Utils.updateSubmitButton();
      });
    }

    // Radio buttons
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
      radio.addEventListener('change', () => {
        Utils.updateSubmitButton();
      });
    });

    // Botão gerar ETP
    const inserirBtn = document.getElementById('inserir');
    if (inserirBtn) {
      inserirBtn.addEventListener('click', this.handleGenerateETP);
    }

    // Sistema de ajuda
    this.initHelpSystem();

    // Sistema de sobre/footer
    this.initAboutSystem();

    // Atualiza botão inicialmente
    Utils.updateSubmitButton();
  },

  /**
   * Handler para gerar ETP
   */
  async handleGenerateETP() {
    if (state.isProcessing) {
      return;
    }

    try {
      state.isProcessing = true;
      Utils.showStatus('Conectando ao ChatGPT...');

      // Coleta dados do formulário
      const contexto = document.getElementById('contexto').value.trim();
      const paragr = document.querySelector('input[name="paragrafos"]:checked').value;
      const tabular = document.querySelector('input[name="tabular"]:checked').value;
      const previsao = document.querySelector('input[name="previsao"]:checked').value;
      const locacao = document.querySelector('input[name="locacao"]:checked').value;

      // Gera o prompt
      const promptText = Utils.generatePrompt(paragr, contexto, tabular, previsao, locacao);

      // Obtém a aba do ChatGPT
      Utils.showStatus('Preparando prompt...');
      const tabId = await ChatGPT.getCurrentChatGPTTab();
      state.currentTabId = tabId;

      // Pequeno delay para garantir que a página carregou
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Envia o prompt
      Utils.showStatus('Enviando para o ChatGPT...');
      await ChatGPT.sendPrompt(tabId, promptText);

      Utils.showStatus('ETP gerado com sucesso! ✓');
      setTimeout(() => {
        Utils.hideStatus();
      }, 3000);

    } catch (error) {
      console.error('Erro ao gerar ETP:', error);
      Utils.showStatus('Erro: ' + error.message, true);
      setTimeout(() => {
        Utils.hideStatus();
      }, 5000);
    } finally {
      state.isProcessing = false;
    }
  },

  /**
   * Sistema de ajuda
   */
  initHelpSystem() {
    const ajuda1 = document.getElementById('ajuda1');
    const ajudaParagrafos = document.getElementById('ajuda_paragrafos');
    const ajuda2 = document.getElementById('ajuda2');
    const ajudaTabular = document.getElementById('ajuda_tabular');

    if (ajuda1 && ajudaParagrafos) {
      ajuda1.addEventListener('click', () => {
        ajuda1.style.display = 'none';
        ajudaParagrafos.style.display = 'inline-flex';
      });

      ajudaParagrafos.addEventListener('mouseleave', () => {
        ajudaParagrafos.style.display = 'none';
        ajuda1.style.display = 'inline-flex';
      });
    }

    if (ajuda2 && ajudaTabular) {
      ajuda2.addEventListener('click', () => {
        ajuda2.style.display = 'none';
        ajudaTabular.style.display = 'inline-flex';
      });

      ajudaTabular.addEventListener('mouseleave', () => {
        ajudaTabular.style.display = 'none';
        ajuda2.style.display = 'inline-flex';
      });
    }
  },

  /**
   * Sistema de sobre/footer
   */
  initAboutSystem() {
    const sobre = document.getElementById('sobre');
    const footer = document.getElementById('footer');

    if (sobre && footer) {
      sobre.addEventListener('mouseenter', () => {
        sobre.style.display = 'none';
        footer.style.display = 'block';
      });

      footer.addEventListener('mouseleave', () => {
        footer.style.display = 'none';
        sobre.style.display = 'block';
      });
    }
  }
};

// ========================================
// INICIALIZAÇÃO
// ========================================
document.addEventListener('DOMContentLoaded', () => {
  EventHandlers.init();
});

