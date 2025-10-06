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
        resposta: item.resposta || null, // Resposta do ChatGPT
        secoes: item.secoes || null, // Seções parseadas
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

  /**
   * Captura a resposta do ChatGPT
   */
  async captureResponse(tabId) {
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId },
        func: function () {
          // Aguarda a resposta aparecer
          return new Promise(resolve => {
            let attempts = 0;
            const maxAttempts = 240; // 120 segundos (ChatGPT pode demorar muito)
            let lastTextLength = 0;
            let stableCount = 0;

            const checkForResponse = setInterval(() => {
              attempts++;

              // Procura pela última resposta do assistente
              const articles = document.querySelectorAll('article');
              if (articles.length === 0) return;

              const lastArticle = articles[articles.length - 1];
              if (!lastArticle) return;

              const text = lastArticle.textContent;
              const currentLength = text.length;

              // Verifica se tem conteúdo mínimo
              if (currentLength > 500) {
                // Verifica se a resposta está completa
                // Procura por seções (pelo menos 5 seções diferentes)
                const secoesEncontradas = [];
                [
                  'I',
                  'II',
                  'III',
                  'IV',
                  'V',
                  'VI',
                  'VII',
                  'VIII',
                  'IX',
                  'X',
                  'XI',
                  'XII',
                  'XIII',
                ].forEach(num => {
                  const regex = new RegExp(`\\b${num}\\s*[-–—]`, 'i');
                  if (regex.test(text)) {
                    secoesEncontradas.push(num);
                  }
                });

                console.log(
                  `🔍 Tentativa ${attempts}: ${currentLength} chars, ${secoesEncontradas.length} seções`
                );

                // Se encontrou pelo menos 10 seções E o texto parou de crescer
                if (secoesEncontradas.length >= 10) {
                  // Verifica se texto está estável (não está mais crescendo)
                  if (currentLength === lastTextLength) {
                    stableCount++;
                  } else {
                    stableCount = 0;
                    lastTextLength = currentLength;
                  }

                  // Se ficou estável por 4 verificações (2 segundos), considera completo
                  if (stableCount >= 4) {
                    clearInterval(checkForResponse);

                    console.log('✅ Resposta completa capturada!');
                    console.log('📏 Tamanho:', text.length, 'caracteres');
                    console.log(
                      '📊 Seções encontradas:',
                      secoesEncontradas.join(', ')
                    );

                    // Extrai o texto formatado
                    const paragraphs = lastArticle.querySelectorAll(
                      'p, div[class*="markdown"]'
                    );
                    let formattedText = '';

                    if (paragraphs.length > 0) {
                      paragraphs.forEach(p => {
                        const pText = p.textContent.trim();
                        if (pText && !pText.startsWith('Copy code')) {
                          formattedText += pText + '\n\n';
                        }
                      });
                    } else {
                      formattedText = text;
                    }

                    resolve({ success: true, text: formattedText.trim() });
                    return;
                  }
                }
              }

              if (attempts >= maxAttempts) {
                clearInterval(checkForResponse);
                console.warn('⏱️ Timeout: 120 segundos atingidos');
                console.warn(
                  '📊 Último status:',
                  currentLength,
                  'chars,',
                  secoesEncontradas?.length || 0,
                  'seções'
                );

                // Se tiver pelo menos algum conteúdo, retorna mesmo com timeout
                if (currentLength > 500) {
                  console.log('⚠️ Retornando resposta parcial');
                  resolve({ success: true, text: text, partial: true });
                } else {
                  resolve({
                    success: false,
                    error: 'Timeout ao aguardar resposta',
                  });
                }
              }
            }, 500);
          });
        },
      });

      if (results && results[0] && results[0].result) {
        return results[0].result;
      }

      return { success: false, error: 'Nenhum resultado retornado' };
    } catch (error) {
      console.error('Erro ao capturar resposta:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Parseia a resposta em seções
   */
  parseSecoes(textoCompleto) {
    console.log('🔍 Iniciando parse de seções...');
    console.log('📏 Tamanho do texto:', textoCompleto.length);

    const secoes = {};
    const numerosRomanos = [
      'I',
      'II',
      'III',
      'IV',
      'V',
      'VI',
      'VII',
      'VIII',
      'IX',
      'X',
      'XI',
      'XII',
      'XIII',
    ];

    // Tenta extrair cada seção
    for (let i = 0; i < numerosRomanos.length; i++) {
      const secaoAtual = numerosRomanos[i];
      const secaoProxima = i < 12 ? numerosRomanos[i + 1] : null;

      // Regex mais robusto para encontrar a seção
      // Procura: "I - " ou "I-" ou "I –" seguido de texto
      const regexInicio = new RegExp(
        `^\\s*${secaoAtual}\\s*[-–—]\\s*[^\\n]+`,
        'im'
      );
      const matchInicio = textoCompleto.match(regexInicio);

      if (matchInicio) {
        console.log(
          `✅ Seção ${secaoAtual} encontrada:`,
          matchInicio[0].substring(0, 50) + '...'
        );

        const posInicio = textoCompleto.indexOf(matchInicio[0]);
        const posFimTitulo = posInicio + matchInicio[0].length;

        let conteudo = '';

        if (secaoProxima) {
          // Procura próxima seção
          const regexFim = new RegExp(`^\\s*${secaoProxima}\\s*[-–—]`, 'im');
          const matchFim = textoCompleto
            .substring(posFimTitulo)
            .match(regexFim);

          if (matchFim) {
            const posFim =
              posFimTitulo +
              textoCompleto.substring(posFimTitulo).indexOf(matchFim[0]);
            conteudo = textoCompleto.substring(posFimTitulo, posFim).trim();
          } else {
            conteudo = textoCompleto.substring(posFimTitulo).trim();
          }
        } else {
          // Última seção (XIII)
          conteudo = textoCompleto.substring(posFimTitulo).trim();
        }

        // Remove possíveis linhas vazias do início e fim
        conteudo = conteudo.replace(/^\s+|\s+$/g, '').trim();

        // Só salva se tiver conteúdo real (mais de 10 caracteres)
        if (conteudo.length > 10) {
          secoes[secaoAtual] = conteudo;
          console.log(`  📝 Conteúdo: ${conteudo.length} caracteres`);
        } else {
          console.warn(
            `  ⚠️ Seção ${secaoAtual} com conteúdo muito pequeno: ${conteudo.length} chars`
          );
        }
      } else {
        console.warn(`❌ Seção ${secaoAtual} NÃO encontrada no texto`);
      }
    }

    console.log('✅ Parse concluído:', Object.keys(secoes).length, 'seções');
    return secoes;
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

        const temResposta = item.secoes && Object.keys(item.secoes).length > 0;

        return `
        <div class="historico-item-wrapper">
          <div class="historico-item" data-index="${index}">
            <div class="historico-item-header">
              <div class="historico-item-info">
                <div class="historico-item-desc">${preview}</div>
                <div class="historico-item-date">📅 ${dateStr}</div>
              </div>
              <button class="btn-excluir-etp" data-index="${index}" title="Excluir ETP">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
              </button>
            </div>
          </div>
          ${
            temResposta
              ? `
            <button class="btn-ver-resposta" data-index="${index}">
              📋 Ver Resposta Completa
            </button>
          `
              : ''
          }
        </div>
      `;
      })
      .join('');

    // Event listeners para recarregar config
    document.querySelectorAll('.historico-item').forEach(item => {
      item.addEventListener('click', e => {
        // Não recarrega se clicou no botão excluir
        if (e.target.classList.contains('btn-excluir-etp')) return;

        const index = parseInt(e.currentTarget.dataset.index);
        this.loadConfig(historico[index]);
      });
    });

    // Event listeners para ver resposta
    document.querySelectorAll('.btn-ver-resposta').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const index = parseInt(e.currentTarget.dataset.index);
        this.showResposta(historico[index]);
      });
    });

    // Event listeners para excluir
    document.querySelectorAll('.btn-excluir-etp').forEach(btn => {
      btn.addEventListener('click', async e => {
        e.stopPropagation();
        const index = parseInt(e.currentTarget.dataset.index);
        this.showConfirmDelete(index, historico[index]);
      });
    });
  },

  /**
   * Mostra modal de confirmação de exclusão
   */
  showConfirmDelete(index, item) {
    const modal =
      document.getElementById('confirmModal') || this.createConfirmModal();
    const message = document.getElementById('confirmMessage');

    const preview =
      item.contexto.substring(0, 100) +
      (item.contexto.length > 100 ? '...' : '');
    message.innerHTML = `Deseja realmente excluir este ETP?<br><br><strong>"${preview}"</strong>`;

    modal.classList.remove('hidden');

    // Remove event listeners anteriores
    const btnCancel = document.getElementById('confirmCancel');
    const btnDelete = document.getElementById('confirmDelete');

    const newBtnCancel = btnCancel.cloneNode(true);
    const newBtnDelete = btnDelete.cloneNode(true);

    btnCancel.parentNode.replaceChild(newBtnCancel, btnCancel);
    btnDelete.parentNode.replaceChild(newBtnDelete, btnDelete);

    // Novos event listeners
    newBtnCancel.addEventListener('click', () => {
      modal.classList.add('hidden');
    });

    newBtnDelete.addEventListener('click', async () => {
      modal.classList.add('hidden');
      await this.delete(index);
    });
  },

  /**
   * Cria modal de confirmação
   */
  createConfirmModal() {
    const modal = document.createElement('div');
    modal.id = 'confirmModal';
    modal.className = 'confirm-modal hidden';
    modal.innerHTML = `
      <div class="confirm-modal-overlay"></div>
      <div class="confirm-modal-content">
        <div class="confirm-modal-title">
          ⚠️ Confirmar Exclusão
        </div>
        <div class="confirm-modal-message" id="confirmMessage"></div>
        <div class="confirm-modal-buttons">
          <button class="confirm-modal-btn confirm-modal-btn-cancel" id="confirmCancel">
            Cancelar
          </button>
          <button class="confirm-modal-btn confirm-modal-btn-delete" id="confirmDelete">
            Excluir
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Click no overlay fecha o modal
    modal
      .querySelector('.confirm-modal-overlay')
      .addEventListener('click', () => {
        modal.classList.add('hidden');
      });

    return modal;
  },

  /**
   * Exclui um item do histórico
   */
  async delete(index) {
    try {
      let historico = await this.load();
      historico.splice(index, 1);
      await chrome.storage.local.set({ historico });
      this.render();
    } catch (error) {
      console.error('Erro ao excluir item:', error);
    }
  },

  /**
   * Mostra modal com a resposta organizada por seções
   */
  showResposta(item) {
    if (!item.secoes) return;

    const modal =
      document.getElementById('respostaModal') || this.createModal();
    const content = document.getElementById('respostaContent');

    // Títulos completos das seções
    const tituloCompleto = {
      I: 'I - Descrição da Necessidade da Contratação',
      II: 'II - Demonstração da Previsão no PCA',
      III: 'III - Requisitos da Contratação',
      IV: 'IV - Estimativas das Quantidades',
      V: 'V - Levantamento de Mercado',
      VI: 'VI - Estimativa do Valor da Contratação',
      VII: 'VII - Descrição da Solução',
      VIII: 'VIII - Justificativas para o Parcelamento',
      IX: 'IX - Demonstrativo dos Resultados Pretendidos',
      X: 'X - Providências a Serem Adotadas',
      XI: 'XI - Contratações Correlatas e/ou Interdependentes',
      XII: 'XII - Descrição de Possíveis Impactos Ambientais',
      XIII: 'XIII - Posicionamento Conclusivo',
    };

    const secoesHtml = Object.keys(item.secoes)
      .sort()
      .map(secao => {
        const titulo = tituloCompleto[secao] || secao;
        const conteudo = item.secoes[secao];

        return `
          <div class="secao-item">
            <div class="secao-header">
              <h3>${titulo}</h3>
              </div>
              <div class="secao-conteudo" id="secao-${secao}">
              ${conteudo.replace(/\n/g, '<br>')}
              
            </div>
            <button class="btn-copiar-secao" data-secao="${secao}">
                📋 Copiar
              </button>
          </div>
        `;
      })
      .join('');

    content.innerHTML = `
      <div class="modal-header-resposta">
        <h2>📄 ETP Completo</h2>
        <div class="modal-meta">
          <span>📅 ${new Date(item.date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}</span>
          <button class="btn-copiar-tudo">📋 Copiar Tudo</button>
        </div>
      </div>
      <div class="secoes-container">
        ${secoesHtml}
      </div>
    `;

    modal.classList.remove('hidden');

    // Event listeners para copiar
    content.querySelectorAll('.btn-copiar-secao').forEach(btn => {
      btn.addEventListener('click', e => {
        const secao = e.currentTarget.dataset.secao;
        this.copiarSecao(secao, item.secoes[secao]);
      });
    });

    content.querySelector('.btn-copiar-tudo')?.addEventListener('click', () => {
      this.copiarTudo(item.secoes);
    });
  },

  /**
   * Cria o modal para exibir respostas
   */
  createModal() {
    const modal = document.createElement('div');
    modal.id = 'respostaModal';
    modal.className = 'resposta-modal hidden';
    modal.innerHTML = `
      <div class="resposta-modal-overlay"></div>
      <div class="resposta-modal-content">
        <button class="resposta-modal-close">✕</button>
        <div id="respostaContent"></div>
      </div>
    `;

    document.body.appendChild(modal);

    // Event listeners
    modal
      .querySelector('.resposta-modal-overlay')
      .addEventListener('click', () => {
        modal.classList.add('hidden');
      });

    modal
      .querySelector('.resposta-modal-close')
      .addEventListener('click', () => {
        modal.classList.add('hidden');
      });

    return modal;
  },

  /**
   * Copia uma seção específica
   */
  async copiarSecao(secao, conteudo) {
    try {
      await navigator.clipboard.writeText(conteudo);
      this.showCopyFeedback(secao);
    } catch (error) {
      console.error('Erro ao copiar:', error);
      alert('Erro ao copiar. Tente novamente.');
    }
  },

  /**
   * Copia todas as seções
   */
  async copiarTudo(secoes) {
    try {
      const textoCompleto = Object.keys(secoes)
        .sort()
        .map(secao => secoes[secao])
        .join('\n\n');

      await navigator.clipboard.writeText(textoCompleto);
      alert('✅ ETP completo copiado para a área de transferência!');
    } catch (error) {
      console.error('Erro ao copiar:', error);
      alert('Erro ao copiar. Tente novamente.');
    }
  },

  /**
   * Mostra feedback visual ao copiar
   */
  showCopyFeedback(secao) {
    const btn = document.querySelector(`[data-secao="${secao}"]`);
    if (btn) {
      const originalText = btn.textContent;
      btn.textContent = '✅ Copiado!';
      btn.style.background = '#10b981';

      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
      }, 2000);
    }
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

    // Auto-resize do textarea após carregar (com delay para garantir CSS aplicado)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        Utils.autoResizeTextarea(contextoField);
      });
    });

    // Mostra botão limpar
    const limparBtn = document.getElementById('limpar');
    if (limparBtn && config.contexto) {
      limparBtn.style.display = 'block';
    }

    // Atualiza botão
    Utils.updateSubmitButton();

    // Scroll para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
};

// Badges removidas - interface mais limpa

// Progress Bar removida - usando apenas spinner + status text

// ========================================
// UTILITÁRIOS
// ========================================
const Utils = {
  /**
   * Auto-resize do textarea
   */
  autoResizeTextarea(textarea) {
    if (!textarea) return;

    // Se o campo está vazio, define altura mínima
    if (!textarea.value || textarea.value.trim() === '') {
      textarea.style.height = '80px';
      return;
    }

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

        // Auto-resize após carregar (com delay para garantir CSS aplicado)
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            Utils.autoResizeTextarea(contextoField);
          });
        });

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

      // Salva configuração atual
      const config = {
        contexto,
        paragrafos: paragr,
        tabular,
        previsao,
        locacao,
      };

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

      // Aguarda e captura a resposta
      Utils.showStatus(
        'Aguardando resposta do ChatGPT... (pode demorar 1-2 min)'
      );
      const respostaResult = await Historico.captureResponse(tabId);

      // Parseia as seções se capturou a resposta
      if (respostaResult.success && respostaResult.text) {
        Utils.showStatus('Organizando resposta por seções...');
        config.resposta = respostaResult.text;
        config.secoes = Historico.parseSecoes(respostaResult.text);

        // Log de debug
        console.log('📊 Seções parseadas:', Object.keys(config.secoes).length);
        console.log(
          '📝 Seções encontradas:',
          Object.keys(config.secoes).join(', ')
        );
      } else {
        console.warn(
          '⚠️ Não foi possível capturar a resposta:',
          respostaResult.error
        );
      }

      // Salva no histórico
      Utils.showStatus('Salvando no histórico...');
      await Historico.save(config);

      Utils.showStatus('ETP gerado com sucesso! 🎉');

      // Animação de sucesso
      const button = document.getElementById('inserir');
      if (button) {
        button.classList.add('success-animation');
        setTimeout(() => button.classList.remove('success-animation'), 600);
      }

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
