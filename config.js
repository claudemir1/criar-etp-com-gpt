// Configurações da Extensão Criar ETP com ChatGPT
// Arquivo de configuração para centralizar strings e constantes

/**
 * Template do prompt para geração de ETP
 * Contém todas as seções obrigatórias conforme Lei Federal 14.133/21
 */
const ETP_PROMPT_TEMPLATE = `Atue como demandante de área técnica de autarquia pública estadual, especialista na elaboração do estudo técnico preliminar (ETP).

O estudo técnico preliminar (ETP) é documento constitutivo da primeira etapa do planejamento de uma contratação pública que caracteriza o interesse público envolvido, conforme previsto na lei nº 14.133/21 e no Decreto Estadual n° 68.185, de 11 de dezembro de 2023, do governo do estado de São Paulo.

A sua tarefa é redigir, para cada seção do ETP delimitada por #, o que se pede em seguida, considerando o seguinte contexto: {{CONTEXTO}}.

Mantenha coerência e alinhamento entre as seções do ETP. Demonstre concisão, clareza e perícia redacional.

Considere que a contratação {{PREVISAO_TEXT}} no plano de contratações anual.

Utilize fontes distintas para destacar os incisos e inclua um título para o ETP.

Elabore, em até {{PARAGRAFOS}} parágrafos, as descrições solicitadas em cada seção, considerado o problema a ser resolvido ou necessidade a ser atendida, sob a perspectiva do interesse público.
{{COMPLEMENTO}}

*Acrescente, na Seção V, uma comparação entre compra {{LOCACAO_TEXT}}, avaliando qual alternativa oferece maior vantagem financeira. Caso haja outra opção além da compra {{LOCACAO_TEXT}}, descreva-a detalhadamente. Com base na pesquisa de mercado ofereça sugestão do material ou serviço a ser contrato*

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

/**
 * Template do prompt para geração de ETP - Nova Ordem (Decreto Estadual 68.017/23)
 * Contém todas as seções obrigatórias conforme nova estrutura
 */
const ETP_PROMPT_TEMPLATE_NOVA = `Atue como demandante de área técnica de autarquia pública estadual, especialista na elaboração do estudo técnico preliminar (ETP).

O estudo técnico preliminar (ETP) é documento constitutivo da primeira etapa do planejamento de uma contratação pública que caracteriza o interesse público envolvido, conforme previsto na lei nº 14.133/21 e no Decreto Estadual n° 68.185, de 11 de dezembro de 2023, do governo do estado de São Paulo.

A sua tarefa é redigir, para cada seção do ETP delimitada por #, o que se pede em seguida, considerando o seguinte contexto: {{CONTEXTO}}.

Mantenha coerência e alinhamento entre as seções do ETP. Demonstre concisão, clareza e perícia redacional.

Considere que a contratação {{PREVISAO_TEXT}} no plano de contratações anual.

Utilize fontes distintas para destacar os incisos e inclua um título para o ETP.

Elabore, em até {{PARAGRAFOS}} parágrafos, as descrições solicitadas em cada seção, considerado o problema a ser resolvido ou necessidade a ser atendida, sob a perspectiva do interesse público.
{{COMPLEMENTO}}

*Acrescente, na Seção V, uma comparação entre compra {{LOCACAO_TEXT}}, avaliando qual alternativa oferece maior vantagem financeira. Caso haja outra opção além da compra {{LOCACAO_TEXT}}, descreva-a detalhadamente. Com base na pesquisa de mercado ofereça sugestão do material ou serviço a ser contrato*

#I - descrição da necessidade da contratação, considerado o problema a ser resolvido sob a perspectiva do interesse público;#

#II - descrição dos requisitos da contratação necessários e suficientes à escolha da solução, prevendo critérios e práticas de sustentabilidade, em todas as suas dimensões, observadas as leis ou regulamentações específicas, bem como padrões mínimos de qualidade e desempenho;#

#III - levantamento de mercado, consistente na análise das alternativas possíveis, e justificativas técnica e econômica da escolha da solução a contratar, podendo, entre outras opções:

a) ser consideradas contratações similares feitas por outros órgãos e entidades públicas, bem como por organizações privadas, no contexto nacional ou internacional, com objetivo de identificar a existência de novas metodologias, tecnologias ou inovações que melhor atendam às necessidades da Administração;

b) ser realizada audiência e/ou consulta pública, preferencialmente na forma eletrônica, para coleta de contribuições;

c) em caso de possibilidade de compra, locação de bens ou outros instrumentos jurídicos para utilização de bens, ser avaliados os custos e os benefícios de cada opção para escolha da alternativa mais vantajosa, prospectando-se arranjos inovadores em sede de economia circular; e

d) ser consideradas outras opções logísticas menos onerosas à Administração, tais como chamamentos públicos de doação e permutas.#

#IV - descrição da solução como um todo, inclusive das exigências relacionadas à manutenção e à assistência técnica, quando for o caso;#

#V - estimativa das quantidades a serem contratadas, acompanhada das memórias de cálculo e dos documentos que lhe dão suporte, considerando a interdependência com outras contratações, de modo a possibilitar economia de escala;#

#VI - estimativa do valor da contratação, acompanhada dos preços unitários referenciais, das memórias de cálculo e dos documentos que lhe dão suporte, que poderão constar de anexo classificado, se a Administração optar por preservar o seu sigilo até a conclusão da licitação;#

#VII - justificativas para o parcelamento ou não da solução;#

#VIII - contratações correlatas e/ou interdependentes;#

#IX - demonstrativo da previsão da contratação no Plano de Contratações Anual, de modo a indicar o seu alinhamento com o planejamento da Administração, observadas as disposições do artigo 16 do Decreto n° 67.689, de 3 de maio de 2023.#

#X - demonstrativo dos resultados pretendidos, em termos de economicidade e de melhor aproveitamento dos recursos humanos, materiais e financeiros disponíveis;#

#XI - providências a serem adotadas pela Administração previamente à celebração do contrato, inclusive adaptações no ambiente do órgão ou da entidade, necessidade de obtenção de licenças, outorgas ou autorizações, capacitação de servidores ou de empregados para fiscalização e gestão contratual;#

#XII - descrição de possíveis impactos ambientais e respectivas medidas mitigadoras, incluídos requisitos de baixo consumo de energia e de outros recursos, bem como logística reversa para desfazimento e reciclagem de bens e refugos, quando aplicável;#

#XIII - manifestação conclusiva sobre a adequação da contratação para o atendimento da necessidade a que se destina.#`;

/**
 * Títulos das seções do ETP
 */
const ETP_SECTION_TITLES = {
  I: 'I - Descrição da Necessidade da Contratação',
  II: 'II - Demonstração da Previsão da Contratação',
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

/**
 * Configurações da extensão
 */
const EXTENSION_CONFIG = {
  VERSION: '2.0',
  MAX_HISTORY_ITEMS: 5,
  DEFAULT_PARAGRAPHS: '1',
  SUPPORTED_LANGUAGES: ['pt-BR'],
  CHATGPT_URL: 'https://chatgpt.com',
};

// Exportar para uso em outros arquivos
if (typeof module !== 'undefined' && module.exports) {
  // Node.js
  module.exports = {
    ETP_PROMPT_TEMPLATE,
    ETP_PROMPT_TEMPLATE_NOVA,
    ETP_SECTION_TITLES,
    EXTENSION_CONFIG,
  };
} else {
  // Browser - disponível globalmente
  window.EtpConfig = {
    ETP_PROMPT_TEMPLATE,
    ETP_PROMPT_TEMPLATE_NOVA,
    ETP_SECTION_TITLES,
    EXTENSION_CONFIG,
  };
}
