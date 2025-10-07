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
chrome.runtime.onInstalled.addListener(async (details) => {
  const currentVersion = chrome.runtime.getManifest().version;

  if (details.reason === 'install') {
    // Primeira instalação
    console.log('✅ Extensão Criar ETP com ChatGPT instalada com sucesso!');

    // Define flag para mostrar modal de boas-vindas
    await chrome.storage.local.set({
      showWelcome: true,
      version: currentVersion,
      installedDate: new Date().toISOString(),
    });
  } else if (details.reason === 'update') {
    // Atualização - busca a versão anterior do storage
    const stored = await chrome.storage.local.get(['version']);
    const previousVersion = stored.version || details.previousVersion || '1.0';
    
    console.log(
      `🔄 Extensão atualizada de ${previousVersion} para ${currentVersion}`
    );

    // Só mostra modal se as versões forem diferentes
    if (previousVersion !== currentVersion) {
      // Define flag para mostrar modal de novidades
      await chrome.storage.local.set({
        showWhatsNew: true,
        version: currentVersion,
        previousVersion: previousVersion,
        updatedDate: new Date().toISOString(),
      });
    }
  }
});
