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
  MAX_HISTORY: 5,
};

// ========================================
// GERENCIAMENTO DE ESTADO
// ========================================
const state = {
  isProcessing: false,
  currentTabId: null,
  currentConfig: {},
};

// ========================================
// DARK MODE
// ========================================
const DarkMode = {
  init() {
    // Detecta preferência do sistema
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.body.classList.add('dark-mode');
      this.updateToggle(true);
    }

    // Event listener para mudança de preferência do sistema
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', e => {
        if (!localStorage.getItem('theme')) {
          if (e.matches) {
            document.body.classList.add('dark-mode');
            this.updateToggle(true);
          } else {
            document.body.classList.remove('dark-mode');
            this.updateToggle(false);
          }
        }
      });
  },

  toggle() {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    this.updateToggle(isDark);
  },

  updateToggle(isDark) {
    const toggle = document.getElementById('darkModeToggle');
    const icon = document.getElementById('themeIcon');
    if (toggle) {
      if (isDark) {
        toggle.classList.add('active');
        icon.textContent = '🌙';
      } else {
        toggle.classList.remove('active');
        icon.textContent = '☀️';
      }
    }
  },
};

// ========================================
// HISTÓRICO DE ETPs
// ========================================
const Historico = {
  async load() {
    try {
      const result = await chrome.storage.local.get('historico');
      return result.historico || [];
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      return [];
    }
  },

  async save(item) {
    try {
      let historico = await this.load();

      // Adiciona novo item no início
      historico.unshift({
        contexto: item.contexto,
        paragrafos: item.paragrafos,
        tabular: item.tabular,
        previsao: item.previsao,
        locacao: item.locacao,
        date: new Date().toISOString(),
      });

      // Mantém apenas os últimos CONFIG.MAX_HISTORY itens
      if (historico.length > CONFIG.MAX_HISTORY) {
        historico = historico.slice(0, CONFIG.MAX_HISTORY);
      }

      await chrome.storage.local.set({ historico });
      this.render();
    } catch (error) {
      console.error('Erro ao salvar histórico:', error);
    }
  },

  async render() {
    const historico = await this.load();
    const list = document.getElementById('historicoList');

    if (!list) return;

    if (historico.length === 0) {
      list.innerHTML =
        '<div class="historico-empty">Nenhum ETP gerado ainda. Crie seu primeiro!</div>';
      return;
    }

    list.innerHTML = historico
      .map((item, index) => {
        const date = new Date(item.date);
        const dateStr = date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        const preview =
          item.contexto.substring(0, 50) +
          (item.contexto.length > 50 ? '...' : '');

        return `
        <div class="historico-item" data-index="${index}">
          <div class="historico-item-desc">${preview}</div>
          <div class="historico-item-date">📅 ${dateStr}</div>
        </div>
      `;
      })
      .join('');

    // Adiciona event listeners
    document.querySelectorAll('.historico-item').forEach(item => {
      item.addEventListener('click', e => {
        const index = parseInt(e.currentTarget.dataset.index);
        this.loadConfig(historico[index]);
      });
    });
  },

  loadConfig(config) {
    // Preenche os campos com a configuração do histórico
    const contextoField = document.getElementById('contexto');
    contextoField.value = config.contexto;
    
    document.querySelector(
      `input[name="paragrafos"][value="${config.paragrafos}"]`
    ).checked = true;
    document.querySelector(
      `input[name="tabular"][value="${config.tabular}"]`
    ).checked = true;
    document.querySelector(
      `input[name="previsao"][value="${config.previsao}"]`
    ).checked = true;
    document.querySelector(
      `input[name="locacao"][value="${config.locacao}"]`
    ).checked = true;

    // Auto-resize do textarea após carregar
    Utils.autoResizeTextarea(contextoField);
    
    // Mostra botão limpar
    const limparBtn = document.getElementById('limpar');
    if (limparBtn && config.contexto) {
      limparBtn.style.display = 'block';
    }

    // Atualiza badges e botão
    Utils.updateSubmitButton();
    Badges.update();

    // Scroll para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
};

// ========================================
// BADGES DE CONFIGURAÇÃO
// ========================================
const Badges = {
  update() {
    const container = document.getElementById('badgesContainer');
    if (!container) return;

    const contexto = document.getElementById('contexto')?.value.trim();
    const paragrafos = document.querySelector(
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

    if (!contexto && !paragrafos) {
      container.innerHTML = '';
      return;
    }

    let badges = [];

    if (paragrafos) {
      badges.push(`
        <div class="badge">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M14 17H4v2h10v-2zm6-8H4v2h16V9zM4 15h16v-2H4v2zM4 5v2h16V5H4z"/>
          </svg>
          ${paragrafos} §
        </div>
      `);
    }

    if (tabular) {
      badges.push(`
        <div class="badge">
          📊 Tabular: ${tabular === 'sim' ? 'Sim' : 'Não'}
        </div>
      `);
    }

    if (previsao) {
      badges.push(`
        <div class="badge">
          ✅ PCA: ${previsao === 'sim' ? 'Sim' : 'Não'}
        </div>
      `);
    }

    if (locacao) {
      badges.push(`
        <div class="badge">
          🏢 Locação: ${locacao === 'sim' ? 'Sim' : 'Não'}
        </div>
      `);
    }

    container.innerHTML = badges.join('');
  },
};

// ========================================
// PROGRESS BAR
// ========================================
const ProgressBar = {
  show() {
    const container = document.getElementById('progressContainer');
    if (container) {
      container.style.display = 'block';
      this.setProgress(0);
    }
  },

  hide() {
    const container = document.getElementById('progressContainer');
    if (container) {
      container.style.display = 'none';
      this.setProgress(0);
    }
  },

  setProgress(percent) {
    const fill = document.getElementById('progressFill');
    if (fill) {
      fill.style.width = `${percent}%`;
    }
  },
};

// ========================================
// UTILITÁRIOS
// ========================================
const Utils = {
  /**
   * Auto-resize do textarea
   */
  autoResizeTextarea(textarea) {
    // Reset altura para calcular a altura correta
    textarea.style.height = 'auto';
    
    // Define nova altura baseada no scrollHeight
    const newHeight = Math.min(Math.max(textarea.scrollHeight, 80), 400);
    textarea.style.height = newHeight + 'px';
  },

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
      const injectFunction = function (promptText) {
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
            const elements = document.querySelectorAll(
              '[contenteditable="true"]'
            );
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
            const success = document.execCommand(
              'insertText',
              false,
              promptText
            );
            console.log(
              '📝 execCommand insertText:',
              success ? '✅ Sucesso' : '❌ Falhou'
            );
          } catch (e) {
            console.warn('⚠️ execCommand não funcionou:', e.message);
          }

          // MÉTODO 2: Fallback com innerText
          if (
            !promptInput.textContent ||
            promptInput.textContent.trim() === ''
          ) {
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
            const event = new Event(eventType, {
              bubbles: true,
              cancelable: true,
            });
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
              console.log(
                '⚠️ Tentando método alternativo para encontrar botão...'
              );
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
        
        // Auto-resize após carregar
        Utils.autoResizeTextarea(contextoField);
        
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
    // Inicializa Dark Mode
    DarkMode.init();

    // Inicializa Histórico
    Historico.render();

    // Carrega contexto salvo
    Storage.loadContext();

    // Dark Mode Toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
      darkModeToggle.addEventListener('click', () => {
        DarkMode.toggle();
      });
    }

    // Campo de contexto
    const contextoField = document.getElementById('contexto');
    if (contextoField) {
      // Auto-resize inicial
      Utils.autoResizeTextarea(contextoField);
      
      contextoField.addEventListener('input', e => {
        const limparBtn = document.getElementById('limpar');
        Storage.saveContext(e.target.value);
        if (limparBtn) {
          limparBtn.style.display = e.target.value ? 'block' : 'none';
        }
        
        // Auto-resize ao digitar
        Utils.autoResizeTextarea(e.target);
        
        Utils.updateSubmitButton();
        Badges.update();
      });
    }

    // Botão limpar
    const limparBtn = document.getElementById('limpar');
    if (limparBtn) {
      limparBtn.addEventListener('click', () => {
        if (contextoField) {
          contextoField.value = '';
          // Reset altura do textarea
          Utils.autoResizeTextarea(contextoField);
        }
        Storage.clearContext();
        limparBtn.style.display = 'none';
        Utils.updateSubmitButton();
        Badges.update();
      });
    }

    // Radio buttons
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
      radio.addEventListener('change', () => {
        Utils.updateSubmitButton();
        Badges.update();
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

    // Atualiza botão e badges inicialmente
    Utils.updateSubmitButton();
    Badges.update();
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
      ProgressBar.show();
      ProgressBar.setProgress(10);
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

      // Salva configuração atual
      const config = {
        contexto,
        paragrafos: paragr,
        tabular,
        previsao,
        locacao,
      };

      ProgressBar.setProgress(25);

      // Gera o prompt
      const promptText = Utils.generatePrompt(
        paragr,
        contexto,
        tabular,
        previsao,
        locacao
      );

      ProgressBar.setProgress(40);

      // Obtém a aba do ChatGPT
      Utils.showStatus('Preparando prompt...');
      const tabId = await ChatGPT.getCurrentChatGPTTab();
      state.currentTabId = tabId;

      ProgressBar.setProgress(60);

      // Delay maior para garantir que a página carregou completamente
      Utils.showStatus('Aguardando página carregar...');
      await new Promise(resolve => setTimeout(resolve, 3000));

      ProgressBar.setProgress(80);

      // Envia o prompt
      Utils.showStatus('Enviando para o ChatGPT...');
      await ChatGPT.sendPrompt(tabId, promptText);

      ProgressBar.setProgress(95);

      // Salva no histórico
      await Historico.save(config);

      ProgressBar.setProgress(100);

      Utils.showStatus('ETP gerado com sucesso! 🎉');

      // Animação de sucesso
      const button = document.getElementById('inserir');
      if (button) {
        button.classList.add('success-animation');
        setTimeout(() => button.classList.remove('success-animation'), 600);
      }

      setTimeout(() => {
        Utils.hideStatus();
        ProgressBar.hide();
      }, 3000);
    } catch (error) {
      console.error('Erro ao gerar ETP:', error);
      Utils.showStatus('Erro: ' + error.message, true);
      ProgressBar.hide();
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
