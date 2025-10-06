// ========================================
// CONSTANTES E CONFIGURAÇÕES
// ========================================
const CONFIG = {
  CHATGPT_URL: 'https://chatgpt.com/',
  SELECTORS: {
    PROMPT_TEXTAREA: '#prompt-textarea',
    SEND_BUTTON: 'button[aria-label="Enviar prompt"]',
    STAY_LOGGED_OUT: 'a:contains("Permanecer desconectado")',
    ARTICLES: 'article',
  },
  TIMEOUTS: {
    BUTTON_CHECK: 200,
    MAX_RETRIES: 50,
    ARTICLE_CLEANUP: 1000,
  },
};

// ========================================
// GERENCIAMENTO DE ESTADO
// ========================================
const state = {
  isProcessing: false,
  currentTabId: null,
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
    const pg = document.querySelector(
      'input[name="paragrafos"]:checked'
    )?.value;
    const tabular = document.querySelector(
      'input[name="tabular"]:checked'
    )?.value;
    const previsao = document.querySelector(
      'input[name="previsao"]:checked'
    )?.value;
    const locacao = document.querySelector(
      'input[name="locacao"]:checked'
    )?.value;

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
    const locacaoText =
      locacao === 'sim' ? 'e locação' : 'e outras opções de mercado';
    const complemento =
      tabular === 'não'
        ? '*Na seção VI, apresente o resultado da estimativa de preços em forma de texto, contendo até três valores para cada tipo de item nos últimos três meses, indicando as fontes e incluindo o valor médio de cada item.*'
        : '*Na seção VI, apresente o resultado da estimativa de preços em uma tabela, contendo até três valores para cada tipo de item nos últimos três meses, indicando as fontes e incluindo o valor médio de cada item.*';

    const previsaoText =
      previsao === 'sim' ? 'está prevista' : 'não está prevista';

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
  },
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
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      const currentTab = tabs[0];

      if (!currentTab.url?.includes('chatgpt.com')) {
        // Se não estiver no ChatGPT, abre uma nova aba
        const newTab = await chrome.tabs.create({
          url: CONFIG.CHATGPT_URL,
          active: true,
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
      // Função standalone para injeção (não pode ser método de objeto)
      const injectFunction = function(promptText) {
    console.log('🚀 ========== INICIANDO INJEÇÃO DO PROMPT ==========');
    console.log('📝 Tamanho do prompt:', promptText.length, 'caracteres');

    try {
      // ESTRATÉGIA 1: Procura por ID
      let promptInput = document.getElementById('prompt-textarea');

      // ESTRATÉGIA 2: Procura por seletor alternativo
      if (!promptInput) {
        console.log('⚠️ Tentando seletor alternativo...');
        promptInput = document.querySelector('[contenteditable="true"]');
      }

      // ESTRATÉGIA 3: Procura por placeholder
      if (!promptInput) {
        console.log('⚠️ Tentando por placeholder...');
        const elements = document.querySelectorAll('[contenteditable="true"]');
        for (const el of elements) {
          if (
            el.getAttribute('placeholder')?.includes('Mensagem') ||
            el.getAttribute('placeholder')?.includes('Message')
          ) {
            promptInput = el;
            break;
          }
        }
      }

      if (!promptInput) {
        console.error(
          '❌ ERRO: Campo de prompt não encontrado em nenhuma estratégia'
        );
        console.log(
          '🔍 Debug - contenteditable elements:',
          document.querySelectorAll('[contenteditable="true"]').length
        );
        return { error: 'Campo de prompt não encontrado' };
      }

      console.log('✅ Campo de prompt encontrado!');
      console.log('📍 Tag:', promptInput.tagName);
      console.log('📍 ID:', promptInput.id);
      console.log('📍 ContentEditable:', promptInput.contentEditable);

      // Limpa o campo primeiro
      promptInput.innerHTML = '';
      promptInput.textContent = '';
      promptInput.innerText = '';
      console.log('🧹 Campo limpo');

      // Foca no campo
      promptInput.focus();
      promptInput.click();
      console.log('🎯 Campo focado');

      // MÉTODO 1: Tenta com execCommand (melhor para contenteditable)
      try {
        const success = document.execCommand('insertText', false, promptText);
        console.log(
          '📝 execCommand insertText:',
          success ? '✅ Sucesso' : '❌ Falhou'
        );
      } catch (e) {
        console.warn('⚠️ execCommand não funcionou:', e.message);
      }

      // MÉTODO 2: Fallback com innerText
      if (!promptInput.textContent || promptInput.textContent.trim() === '') {
        console.log('🔄 Usando fallback innerText...');
        promptInput.innerText = promptText;
        console.log('✅ Texto inserido via innerText');
      }

      // Verifica se o texto foi inserido
      console.log(
        '✔️ Conteúdo atual (primeiros 100 chars):',
        promptInput.textContent.substring(0, 100) + '...'
      );

      // Dispara TODOS os eventos possíveis
      const events = ['input', 'change', 'keydown', 'keyup', 'keypress'];
      events.forEach(eventType => {
        const event = new Event(eventType, { bubbles: true, cancelable: true });
        promptInput.dispatchEvent(event);
      });
      console.log('📡 Eventos disparados:', events.join(', '));

      // Aguarda e procura o botão
      setTimeout(() => {
        console.log('🔍 Procurando botão de enviar...');

        // Lista de seletores para tentar
        const selectors = [
          'button[data-testid="send-button"]',
          'button[aria-label="Enviar prompt"]',
          'button[aria-label="Send prompt"]',
          'button[data-testid="fruitjuice-send-button"]',
          'button svg[data-icon="arrow-up"]',
        ];

        let sendButton = null;

        for (const selector of selectors) {
          sendButton = document.querySelector(selector);
          if (sendButton) {
            if (sendButton.tagName !== 'BUTTON') {
              sendButton = sendButton.closest('button');
            }
            console.log('✅ Botão encontrado com seletor:', selector);
            break;
          }
        }

        // Fallback: procura botão com SVG no footer
        if (!sendButton) {
          console.log('⚠️ Tentando método alternativo para encontrar botão...');
          const buttons = Array.from(document.querySelectorAll('button'));
          console.log('🔢 Total de botões na página:', buttons.length);

          sendButton = buttons.find(btn => {
            const hasSvg = btn.querySelector('svg');
            const isInForm = btn.closest('form');
            const notDisabled = !btn.disabled;
            return hasSvg && isInForm && notDisabled;
          });

          if (sendButton) {
            console.log('✅ Botão encontrado por método alternativo!');
          }
        }

        if (!sendButton) {
          console.error('❌ ERRO: Botão de enviar não encontrado');
          console.log(
            '💡 Dica: A página do ChatGPT pode ter mudado. Verifique se você está logado.'
          );
          return { error: 'Botão de enviar não encontrado' };
        }

        console.log('🎯 Botão encontrado:', {
          disabled: sendButton.disabled,
          tagName: sendButton.tagName,
          ariaLabel: sendButton.getAttribute('aria-label'),
        });

        // Função para clicar quando possível
        const tryClick = (attempt = 0) => {
          if (attempt > 50) {
            console.error('❌ Timeout: Botão nunca ficou habilitado');
            return;
          }

          if (!sendButton.disabled) {
            console.log('✅ Botão habilitado! Clicando...');
            sendButton.click();
            console.log('🚀 PROMPT ENVIADO COM SUCESSO!');
            console.log('🎉 ========== FIM DA INJEÇÃO ==========');

            // Remove o artigo após envio
            setTimeout(() => {
              const articles = document.querySelectorAll('article');
              let removed = 0;
              articles.forEach(article => {
                if (article.textContent.includes('Atue como demandante')) {
                  article.remove();
                  removed++;
                }
              });
              if (removed > 0) {
                console.log('🗑️ Artigo(s) do prompt removido(s):', removed);
              }
            }, 2000);

            return;
          }

          console.log(
            `⏳ Tentativa ${attempt + 1}/50 - Aguardando botão habilitar...`
          );
          setTimeout(() => tryClick(attempt + 1), 300);
        };

        tryClick();
      }, 500);

      return { success: true, message: 'Prompt injetado com sucesso' };
    } catch (error) {
      console.error('❌ ERRO CRÍTICO:', error);
      console.error('Stack:', error.stack);
      return { error: error.message, stack: error.stack };
    }
  }; // Fim da função injectFunction

      // Executa a função injetada
      const results = await chrome.scripting.executeScript({
        target: { tabId },
        func: injectFunction,
        args: [promptText],
      });

      console.log('Resultado da injeção:', results);

      // Verifica se houve erro
      if (results && results[0] && results[0].result) {
        if (results[0].result.error) {
          throw new Error(results[0].result.error);
        }
      }
    } catch (error) {
      console.error('Erro ao enviar prompt:', error);
      throw new Error('Erro ao enviar prompt: ' + error.message);
    }
  },
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
  },
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
      contextoField.addEventListener('input', e => {
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
      const paragr = document.querySelector(
        'input[name="paragrafos"]:checked'
      ).value;
      const tabular = document.querySelector(
        'input[name="tabular"]:checked'
      ).value;
      const previsao = document.querySelector(
        'input[name="previsao"]:checked'
      ).value;
      const locacao = document.querySelector(
        'input[name="locacao"]:checked'
      ).value;

      // Gera o prompt
      const promptText = Utils.generatePrompt(
        paragr,
        contexto,
        tabular,
        previsao,
        locacao
      );

      // Obtém a aba do ChatGPT
      Utils.showStatus('Preparando prompt...');
      const tabId = await ChatGPT.getCurrentChatGPTTab();
      state.currentTabId = tabId;

      // Delay maior para garantir que a página carregou completamente
      Utils.showStatus('Aguardando página carregar...');
      await new Promise(resolve => setTimeout(resolve, 3000));

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
  },
};

// ========================================
// INICIALIZAÇÃO
// ========================================
document.addEventListener('DOMContentLoaded', () => {
  EventHandlers.init();
});
