var url = 'https://chatgpt.com/';
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  if (!tabs[0].url.includes('chatgpt'))
    chrome.tabs.update({ url: url, active: false });
  var cont = 0;
  var verificaBotao = setInterval(() => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: cont => {
        const entrar = document.querySelectorAll('a');
        Array.from(entrar).forEach(a => {
          if (a.textContent.includes('Permanecer desconectado')) a.click();
        });
        const prompt = document.getElementById('prompt-textarea');
        prompt.innerText = cont == 5 ? 'Olá' : '';
        const enterEvent = new KeyboardEvent('keydown', {
          key: 'Enter',
          code: 'Enter',
          keyCode: 13,
          which: 13,
          bubbles: true,
        });
        prompt.dispatchEvent(enterEvent);
        console.log('entrer', cont);
      },
      args: [cont],
    });
    if (cont > 5) clearInterval(verificaBotao);
    cont++;
  }, 1000);
});

var limpar = document.getElementById('limpar');
document.addEventListener('DOMContentLoaded', function () {
  chrome.storage.local.get('contexto', function (result) {
    const pegaTexto = result.contexto;
    if (pegaTexto) {
      document.getElementById('contexto').value = pegaTexto;
      limpar.style.display = 'block';
    }
  });
});

document.getElementById('contexto').addEventListener('input', function () {
  chrome.storage.local.set({ contexto: this.value });
  limpar.style.display = 'block';
});

document.getElementById('limpar').addEventListener('click', function () {
  document.getElementById('contexto').value = '';
  chrome.storage.local.remove('contexto');
  limpar.style.display = 'none';
});

document.addEventListener('change', function () {
  let contexto = document.getElementById('contexto')?.value;
  let pg = document.querySelector('input[name="paragrafos"]:checked')?.value;
  let tabular = document.querySelector('input[name="tabular"]:checked')?.value;
  let previsao = document.querySelector(
    'input[name="previsao"]:checked'
  )?.value;
  let locacao = document.querySelector('input[name="locacao"]:checked')?.value;
  if (previsao && contexto && pg && tabular && locacao) {
    document.getElementById('inserir').style.display = 'block';
  } else {
    document.getElementById('inserir').style.display = 'none';
  }
});

document.getElementById('inserir').addEventListener('click', function () {
  const contexto = document.getElementById('contexto').value.trim();
  var paragr = document.querySelector('input[name="paragrafos"]:checked').value;
  var tabular = document.querySelector('input[name="tabular"]:checked').value;
  let previsao = document.querySelector(
    'input[name="previsao"]:checked'
  )?.value;
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: manipulaDom,
      args: [paragr, contexto, tabular, previsao, locacao],
    });
  });
});

const manipulaDom = (paragr, contexto, tabular, previsao, locacao) => {
  function pegaElemento(paragr, contexto, tabular, previsao, locacao) {
    locacao = locacao == 'sim' ? 'e locação' : 'e outras opções de mercado';
    var complemento =
      tabular == 'não'
        ? '*Na seção VI, apresente o resultado da estimativa de preços em forma de texto, contendo até três valores para cada tipo de item nos últimos três meses, indicando as fontes e incluindo o valor médio de cada item.*'
        : `*Na seção VI, apresente o resultado da estimativa de preços em uma tabela, contendo até três valores para cada tipo de item nos últimos três meses, indicando as fontes e incluindo o valor médio de cada item.*`;

    var elemento = `Atue como demandante de área técnica de autarquia pública estadual, especialista na elaboração do estudo técnico preliminar (ETP).

O estudo técnico preliminar (ETP) é documento constitutivo da primeira etapa do planejamento de uma contratação pública que caracteriza o interesse público envolvido, conforme previsto na lei nº 14.133/21 e no Decreto Estadual n° 68.185, de 11 de dezembro de 2023, do governo do estado de São Paulo.

A sua tarefa é redigir, para cada seção do ETP delimitada por #, o que se pede em seguida, considerando o seguinte contexto: ${contexto}.

Mantenha coerência e alinhamento entre as seções do ETP. Demonstre concisão, clareza e perícia redacional.

Considere que a contratação ${previsao} no plano de contratações anual.

Utilize fontes distintas para destacar os incisos e inclua um título para o ETP.

Elabore, em até ${paragr} parágrafos, as descrições solicitadas em cada seção, considerado o problema a ser resolvido ou necessidade a ser atendida, sob a perspectiva do interesse público.
${complemento}

*Acrescente, na Seção V, uma comparação entre compra ${locacao}, avaliando qual alternativa oferece maior vantagem financeira. Caso haja outra opção além da compra ${locacao}, descreva-a detalhadamente. Com base na pesquisa de mercado ofereça sugestão do material ou serviço a ser contrato*

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
    return elemento;
  }

  const promptInput = document.getElementById('prompt-textarea');

  if (promptInput) {
    promptInput.innerText = '';
    promptInput.innerText = pegaElemento(
      paragr,
      contexto,
      tabular,
      previsao,
      locacao
    );
    promptInput.dispatchEvent(new Event('input', { bubbles: true }));
  } else {
    alert('Campo de prompt ou botão de enviar não encontrado!');
  }
  const verificaBotao = setInterval(() => {
    const botaoEnviar = document.querySelector(
      'button[aria-label="Enviar prompt"]'
    );
    if (!botaoEnviar.disabled) {
      botaoEnviar.click();
      clearInterval(verificaBotao);
    }
  }, 200);

  let cont = 0;
  const busca = setInterval(() => {
    const articles = document.querySelectorAll('article');
    Array.from(articles).forEach(article => {
      if (article.textContent.includes('Atue')) article.remove();
    });
    if (cont < 10) clearInterval(busca);
    cont++;
  }, 1000);

  document.querySelector(
    '/html/body/div[1]/div[2]/main/div[1]/div[1]'
  ).style.overflow = '';
};

function ocultarExibir(ocultar, exibir, tipo) {
  document.getElementById(ocultar).style.display = 'none';
  document.getElementById(exibir).style.display = tipo;
}

document.getElementById('sobre').addEventListener('mouseenter', () => {
  ocultarExibir('sobre', 'footer', 'block');
});

document.getElementById('footer').addEventListener('mouseleave', () => {
  ocultarExibir('footer', 'sobre', 'block');
});
document.getElementById('ajuda1').addEventListener('click', () => {
  ocultarExibir('ajuda1', 'ajuda_paragrafos', 'inline-flex');
});
document
  .getElementById('ajuda_paragrafos')
  .addEventListener('mouseleave', () => {
    ocultarExibir('ajuda_paragrafos', 'ajuda1', 'inline-flex');
  });
document.getElementById('ajuda2').addEventListener('click', () => {
  ocultarExibir('ajuda2', 'ajuda_tabular', 'inline-flex');
});
document.getElementById('ajuda_tabular').addEventListener('mouseleave', () => {
  ocultarExibir('ajuda_tabular', 'ajuda2', 'inline-flex');
});
