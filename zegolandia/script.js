// Configuração
const REBRICKABLE_API_KEY = 'TUA_API_KEY_AQUI'; // Regista-te em rebrickable.com
const JSON_FILE = 'meus_legos.json';

// Função para carregar os dados do JSON
async function loadMyLegos() {
    try {
        const response = await fetch(JSON_FILE);
        if (!response.ok) throw new Error('Erro ao carregar dados');
        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        return [];
    }
}

// Função para buscar dados de um set na Rebrickable
async function fetchSetData(setNumber) {
    const url = `https://rebrickable.com/api/v3/lego/sets/${setNumber}/?key=${REBRICKABLE_API_KEY}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Erro na API: ${response.status}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Erro ao buscar set ${setNumber}:`, error);
        return null;
    }
}

// Função para criar um card HTML
function createCard(setNumber, personalData, apiData) {
    const card = document.createElement('div');
    card.className = 'card';
    
    // Dados da API ou fallback
    const nome = apiData?.name || `Set ${setNumber}`;
    const imagem = apiData?.set_img_url || 'https://via.placeholder.com/300x200?text=LEGO';
    const pecas = apiData?.num_parts || 'N/A';
    const ano = apiData?.year || 'N/A';
    
    card.innerHTML = `
        <img src="${imagem}" alt="${nome}" class="card-image" loading="lazy">
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
    
    try {
        // 1. Carregar os teus dados
        const myLegos = await loadMyLegos();
        
        if (myLegos.length === 0) {
            container.innerHTML = '<div class="error">📭 Ainda não tens conjuntos na tua coleção!</div>';
            return;
        }
        
        container.innerHTML = ''; // Limpa o loading
        
        // 2. Para cada set, buscar dados da API e criar card
        const promises = myLegos.map(async (item) => {
            const apiData = await fetchSetData(item.conjunto);
            const card = createCard(item.conjunto, item, apiData);
            container.appendChild(card);
        });
        
        await Promise.all(promises);
        
    } catch (error) {
        console.error('Erro ao renderizar:', error);
        container.innerHTML = '<div class="error">❌ Ocorreu um erro ao carregar a coleção</div>';
    }
}

// Executar quando a página carregar
document.addEventListener('DOMContentLoaded', renderCards);
