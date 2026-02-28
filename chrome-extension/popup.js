// Elementos do DOM
const syncBtn = document.getElementById('syncBtn');
const syncBtnText = document.getElementById('syncBtnText');
const syncLoading = document.getElementById('syncLoading');
const successMessage = document.getElementById('successMessage');
const lastSyncEl = document.getElementById('lastSync');

// Atualizar status ao abrir o popup
function updateStatus() {
  chrome.runtime.sendMessage({ action: 'getStatus' }, (response) => {
    if (response) {
      const lastSync = new Date(response.lastSync);
      const formattedTime = lastSync.toLocaleString('pt-BR');
      lastSyncEl.textContent = formattedTime;
    }
  });
}

// Sincronizar histórico
syncBtn.addEventListener('click', async () => {
  syncBtnText.style.display = 'none';
  syncLoading.style.display = 'inline';
  syncBtn.disabled = true;

  chrome.runtime.sendMessage({ action: 'syncHistory' }, (response) => {
    syncBtnText.style.display = 'inline';
    syncLoading.style.display = 'none';
    syncBtn.disabled = false;

    if (response && response.success) {
      // Mostrar mensagem de sucesso
      successMessage.style.display = 'block';
      setTimeout(() => {
        successMessage.style.display = 'none';
      }, 3000);

      // Atualizar status
      updateStatus();
    }
  });
});

// Atualizar status ao abrir o popup
updateStatus();

// Atualizar a cada segundo
setInterval(updateStatus, 1000);
