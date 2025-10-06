// Background Service Worker para gerenciar o Side Panel

// Abre o side panel quando o usuário clica no ícone da extensão
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId });
});

// Configuração automática do side panel para abas do ChatGPT
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.includes('chatgpt.com')) {
    chrome.sidePanel.setOptions({
      tabId,
      enabled: true
    });
  }
});

// Mantém o service worker ativo
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extensão Criar ETP com ChatGPT instalada com sucesso!');
});

