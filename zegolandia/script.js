// Configuração
const REBRICKABLE_API_KEY = '37a9586213972f0a392705238b202f2d';
const JSON_FILE = 'meus_legos.json';

// Função de debug
function debugLog(message, data = null) {
    const debugContent = document.getElementById('debug-content');
    const timestamp = new Date().toLocaleTimeString();
    let logMessage = `[${timestamp}] ${message}`;
    
    if (data) {
        logMessage += '\n' + JSON.stringify(data, null, 2);
    }
    
    debugContent.innerHTML += '\n' + logMessage + '\n' + '─'.repeat(50);
    debugContent.scrollTop = debugContent.scrollHeight;
    
    console.log(message, data);
}

// Função para mostrar/ocultar debug
function toggleDebug() {
    const area = document.getElementById('debug-area');
    area.style.display = area.style.display === 'none' ? 'block' : 'none';
}

// Função para carregar os dados do JSON
async function loadMyLegos() {
    debugLog('📂 A carregar ficheiro JSON...');
    try {
        const response = await fetch(JSON_FILE);
        debugLog(`📡 Resposta do JSON: status ${response.status}`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        debugLog('✅ JSON carregado com sucesso!', data);
        return data;
    } catch (error) {
        debugLog('❌ Erro ao carregar JSON:', error.message);
        console.error('Erro detalhado:', error);
        return [];
    }
}

// Função para buscar dados de um set na Rebrickable
async function fetchSetData(setNumber) {
    const url = `https://rebrickable.com/api/v3/lego/sets/${setNumber}/`;
    debugLog(`🔍 A buscar set ${setNumber}...`);
    debugLog(`🌐 URL: ${url}?key=[OCULTA]`);
    
    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `key ${REBRICKABLE_API_KEY}`
            }
        });
        
        debugLog(`📡 Resposta da API: status ${response.status}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            debugLog(`❌ Erro HTTP ${response.status}:`, errorText);
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        debugLog(`✅ Dados do set ${setNumber} obtidos!`, data);
        return data;
    } catch (error) {
        debugLog(`❌ Erro ao buscar set ${setNumber}:`, error.message);
        console.error('Erro detalhado:', error);
        return null;
    }
}

// Função para criar um card HTML
function createCard(setNumber, personalData, apiData) {
    debugLog(`🏗️ A criar card para set ${setNumber}`);
    
    const card = document.createElement('div');
    card.className = 'card';
    
    // Dados da API ou fallback
    const nome = apiData?.name || `Set ${setNumber}`;
    const imagem = apiData?.set_img_url || 'https://via.placeholder.com/300x200?text=LEGO+Sem+Imagem';
    const pecas = apiData?.num_parts || 'N/A';
    const ano = apiData?.year || 'N/A';
    
    debugLog(`📊 Dados do card: Nome="${nome}", Peças=${pecas}, Ano=${ano}`);
    
    card.innerHTML = `
        <img src="${imagem}" alt="${nome}" class="card-image" loading="lazy" onerror="this.src='https://via.placeholder.com/300x200?text=Erro+Imagem'">
        <div class="card-content">
            <div class="card-title">${nome}</div>
            <div class="card-details">
                <span>📦 Set #${setNumber}</span>
                <span>🧩 ${pecas} peças</span>
                <span>📅 ${ano}</span>
            </div>
            <div class="card-personal">
                <span class="difficulty-badge">${personalData.dificuldade}</span>
                <span>⏱️ ${personalData.tempo}</span>
                <span>📆 ${new Date(personalData.data_final).toLocaleDateString('pt-PT')}</span>
            </div>
        </div>
    `;
    
    return card;
}

// Função principal
async function renderCards() {
    const container = document.getElementById('cards-container');
    container.innerHTML = '<div class="loading">⏳ A carregar a tua coleção...</div>';
    debugLog('🚀 Iniciar renderização...');
    
    try {
        // 1. Carregar os teus dados
        const myLegos = await loadMyLegos();
        
        if (myLegos.length === 0) {
            container.innerHTML = '<div class="error">📭 Ainda não tens conjuntos na tua coleção!</div>';
            debugLog('⚠️ Nenhum conjunto encontrado no JSON');
            return;
        }
        
        debugLog(`📋 Encontrados ${myLegos.length} conjuntos`);
        container.innerHTML = ''; // Limpa o loading
        
        // 2. Para cada set, buscar dados da API e criar card
        const promises = myLegos.map(async (item, index) => {
            debugLog(`🔄 Processando conjunto ${index + 1}/${myLegos.length}: ${item.conjunto}`);
            const apiData = await fetchSetData(item.conjunto);
            const card = createCard(item.conjunto, item, apiData);
            container.appendChild(card);
        });
        
        await Promise.all(promises);
        debugLog('✅ Renderização concluída!');
        
    } catch (error) {
        debugLog('❌ Erro fatal na renderização:', error.message);
        console.error('Erro detalhado:', error);
        container.innerHTML = '<div class="error">❌ Ocorreu um erro ao carregar a coleção. Verifica a consola de debug.</div>';
    }
}

// Executar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    debugLog('📄 Página carregada!');
    renderCards();
});
