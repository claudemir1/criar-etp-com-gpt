// Background Service Worker para gerenciar o Side Panel

// Abre o side panel quando o usuário clica no ícone da extensão
chrome.action.onClicked.addListener(tab => {
  chrome.sidePanel.open({ windowId: tab.windowId });
});

// Configuração automática do side panel para abas do ChatGPT
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.includes('chatgpt.com')) {
    chrome.sidePanel.setOptions({
      tabId,
      enabled: true,
    });
  }
});

// Detecta instalação ou atualização
chrome.runtime.onInstalled.addListener(details => {
  const currentVersion = chrome.runtime.getManifest().version;
  
  if (details.reason === 'install') {
    // Primeira instalação
    console.log('✅ Extensão Criar ETP com ChatGPT instalada com sucesso!');
    
    // Define flag para mostrar modal de boas-vindas
    chrome.storage.local.set({
      showWelcome: true,
      version: currentVersion,
      installedDate: new Date().toISOString()
    });
    
  } else if (details.reason === 'update') {
    // Atualização
    const previousVersion = details.previousVersion;
    console.log(`🔄 Extensão atualizada de ${previousVersion} para ${currentVersion}`);
    
    // Define flag para mostrar modal de novidades
    chrome.storage.local.set({
      showWhatsNew: true,
      version: currentVersion,
      previousVersion: previousVersion,
      updatedDate: new Date().toISOString()
    });
  }
});
