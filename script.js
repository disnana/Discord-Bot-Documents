// Disnana Command Reference Script

// グローバル変数
let categoryConfig = {};
let commandsContainer, commandsContainerMobile, loadingMessage, noResults;
let searchInput, commandCount, filterButtons;
let nameSearchBtn, fullSearchBtn, expandAllBtn, collapseAllBtn;
let searchMode = 'name';
let allCommands = [];
let searchTimeout = null;

// 初期化
function initializeElements() {
    commandsContainer = document.getElementById('commandsContainer');
    commandsContainerMobile = document.getElementById('commandsContainerMobile');
    loadingMessage = document.getElementById('loadingMessage');
    noResults = document.getElementById('noResults');
    searchInput = document.getElementById('searchInput');
    commandCount = document.getElementById('commandCount');
    filterButtons = document.getElementById('filterButtons');
    nameSearchBtn = document.getElementById('nameSearchBtn');
    fullSearchBtn = document.getElementById('fullSearchBtn');
    expandAllBtn = document.getElementById('expandAllBtn');
    collapseAllBtn = document.getElementById('collapseAllBtn');
}

// 個別のアニメーション関数
function animateExpand(element) {
    element.style.display = 'block';
    element.style.height = 'auto';
    const height = element.offsetHeight;
    element.style.height = '0px';
    element.style.overflow = 'hidden';
    element.style.transition = 'height 0.3s ease-out';
    
    // Force reflow
    element.offsetHeight;
    
    element.style.height = height + 'px';
    
    setTimeout(() => {
        element.style.height = 'auto';
        element.style.overflow = 'visible';
    }, 300);
}

function animateCollapse(element) {
    element.style.height = element.offsetHeight + 'px';
    element.style.overflow = 'hidden';
    element.style.transition = 'height 0.3s ease-out';
    
    // Force reflow
    element.offsetHeight;
    
    element.style.height = '0px';
    
    setTimeout(() => {
        element.style.display = 'none';
        element.style.height = '';
        element.style.overflow = '';
        element.style.transition = '';
    }, 300);
}

// デスクトップ用カード作成
function createDesktopCard(command, index) {
    const config = categoryConfig[command.category];
    if (!config) return '';
    
    const cardId = `desktop-card-${index}`;
    const detailsId = `desktop-details-${index}`;
    const buttonId = `desktop-btn-${index}`;
    const iconId = `desktop-icon-${index}`;
    
    return `
        <div class="command-card bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg" 
             data-category="${command.category}" 
             data-command="${command.name}"
             id="${cardId}">
            <div class="p-4 border-b border-gray-100">
                <div class="flex items-start justify-between">
                    <div class="flex items-center">
                        <div class="w-10 h-10 ${config.bgColor} rounded-lg flex items-center justify-center mr-3">
                            <i class="${config.icon} ${config.textColor} text-lg"></i>
                        </div>
                        <div>
                            <h3 class="font-bold text-lg text-gray-900">${command.name}</h3>
                            <span class="inline-block px-2 py-1 text-xs font-medium ${config.bgColor} ${config.textColor} rounded-full mt-1">
                                ${config.name}
                            </span>
                        </div>
                    </div>
                    <button class="text-gray-400 hover:text-gray-600 p-2 rounded-md hover:bg-gray-100"
                            id="${buttonId}">
                        <i class="fas fa-chevron-down text-sm transform transition-transform duration-200" id="${iconId}"></i>
                    </button>
                </div>
                
                <p class="text-gray-700 mt-3 mb-2">${command.description}</p>
                
                <div class="flex flex-wrap gap-3 text-xs text-gray-500">
                    <span><i class="fas fa-terminal mr-1"></i>${command.usage}</span>
                    <span><i class="fas fa-shield-alt mr-1"></i>${command.permissions}</span>
                    ${command.cooldown ? `<span><i class="fas fa-clock mr-1"></i>${command.cooldown}</span>` : ''}
                </div>
            </div>
            
            <div id="${detailsId}" style="display: none;">
                <div class="p-4 space-y-4">
                    <div>
                        <h4 class="font-semibold text-gray-900 mb-2 text-sm">使用例</h4>
                        <div class="space-y-2">
                            ${command.examples.map(example => `
                                <div class="bg-gray-50 p-2 rounded text-xs">
                                    <div class="text-gray-600 mb-1">${example.description}:</div>
                                    <code class="text-green-600 font-mono">${example.command}</code>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    ${command.notes && command.notes.length > 0 ? `
                        <div>
                            <h4 class="font-semibold text-gray-900 mb-2 text-sm">注意事項・Tips</h4>
                            <div class="space-y-1">
                                ${command.notes.map(note => `
                                    <div class="text-xs text-gray-600 flex items-start">
                                        <i class="fas fa-lightbulb ${config.textColor} mr-1 mt-0.5 text-xs"></i>
                                        <span>${note}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

// モバイル用カード作成
function createMobileCard(command, index) {
    const config = categoryConfig[command.category];
    if (!config) return '';
    
    const cardId = `mobile-card-${index}`;
    const detailsId = `mobile-details-${index}`;
    const buttonId = `mobile-btn-${index}`;
    const iconId = `mobile-icon-${index}`;
    
    return `
        <div class="command-card bg-white rounded-lg shadow-md border border-gray-200" 
             data-category="${command.category}" 
             data-command="${command.name}"
             id="${cardId}">
            <div class="p-3">
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center">
                        <div class="w-8 h-8 ${config.bgColor} rounded-md flex items-center justify-center mr-2">
                            <i class="${config.icon} ${config.textColor} text-sm"></i>
                        </div>
                        <div>
                            <h3 class="font-bold text-base text-gray-900">${command.name}</h3>
                            <span class="inline-block px-1.5 py-0.5 text-xs font-medium ${config.bgColor} ${config.textColor} rounded">
                                ${config.name}
                            </span>
                        </div>
                    </div>
                    <button class="text-gray-400 hover:text-gray-600 p-2 rounded-md hover:bg-gray-100"
                            id="${buttonId}">
                        <i class="fas fa-chevron-down text-xs transform transition-transform duration-200" id="${iconId}"></i>
                    </button>
                </div>
                
                <p class="text-gray-700 text-sm mb-2">${command.description}</p>
                
                <div class="text-xs text-gray-500 space-y-1">
                    <div><i class="fas fa-terminal mr-1 w-3"></i>${command.usage}</div>
                    <div><i class="fas fa-shield-alt mr-1 w-3"></i>${command.permissions}</div>
                </div>
            </div>
            
            <div id="${detailsId}" style="display: none;">
                <div class="px-3 pb-3 border-t border-gray-100">
                    <div class="pt-3 space-y-3">
                        <div>
                            <h4 class="font-semibold text-gray-900 mb-1 text-sm">使用例</h4>
                            <div class="space-y-1">
                                ${command.examples.slice(0, 2).map(example => `
                                    <div class="bg-gray-50 p-2 rounded text-xs">
                                        <div class="text-gray-600 mb-1">${example.description}</div>
                                        <code class="text-green-600 font-mono">${example.command}</code>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        ${command.notes && command.notes.length > 0 ? `
                            <div>
                                <h4 class="font-semibold text-gray-900 mb-1 text-sm">Tips</h4>
                                <div class="space-y-1">
                                    ${command.notes.slice(0, 3).map(note => `
                                        <div class="text-xs text-gray-600">${note}</div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 個別のトグル機能を設定（直接イベントリスナー）
function setupIndividualToggle(buttonId, detailsId, iconId) {
    const button = document.getElementById(buttonId);
    const details = document.getElementById(detailsId);
    const icon = document.getElementById(iconId);
    
    if (button && details && icon) {
        // 既存のリスナーを削除
        button.onclick = null;
        
        // 新しいリスナーを追加
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const isVisible = details.style.display !== 'none';
            
            if (isVisible) {
                // 折りたたみ
                animateCollapse(details);
                icon.classList.remove('rotate-180');
                console.log('Collapsed:', detailsId);
            } else {
                // 展開
                animateExpand(details);
                icon.classList.add('rotate-180');
                console.log('Expanded:', detailsId);
            }
        });
        
        console.log('Toggle handler set for:', buttonId, detailsId, iconId);
    } else {
        console.error('Elements not found:', buttonId, detailsId, iconId);
    }
}

// 全体展開/折りたたみ機能
function expandAllDetails() {
    // デスクトップ
    allCommands.forEach((_, index) => {
        const details = document.getElementById(`desktop-details-${index}`);
        const icon = document.getElementById(`desktop-icon-${index}`);
        if (details && details.style.display === 'none') {
            animateExpand(details);
            if (icon) icon.classList.add('rotate-180');
        }
    });
    
    // モバイル
    allCommands.forEach((_, index) => {
        const details = document.getElementById(`mobile-details-${index}`);
        const icon = document.getElementById(`mobile-icon-${index}`);
        if (details && details.style.display === 'none') {
            animateExpand(details);
            if (icon) icon.classList.add('rotate-180');
        }
    });
}

function collapseAllDetails() {
    // デスクトップ
    allCommands.forEach((_, index) => {
        const details = document.getElementById(`desktop-details-${index}`);
        const icon = document.getElementById(`desktop-icon-${index}`);
        if (details && details.style.display !== 'none') {
            animateCollapse(details);
            if (icon) icon.classList.remove('rotate-180');
        }
    });
    
    // モバイル
    allCommands.forEach((_, index) => {
        const details = document.getElementById(`mobile-details-${index}`);
        const icon = document.getElementById(`mobile-icon-${index}`);
        if (details && details.style.display !== 'none') {
            animateCollapse(details);
            if (icon) icon.classList.remove('rotate-180');
        }
    });
}

// フィルターボタン作成
function createFilterButtons() {
    const categories = [...new Set(allCommands.map(cmd => cmd.category))];
    
    categories.forEach(category => {
        const config = categoryConfig[category];
        if (config) {
            const button = document.createElement('button');
            button.className = 'filter-btn bg-gray-200 text-gray-700 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors hover:bg-gray-300';
            button.innerHTML = `<i class="${config.icon} mr-1 sm:mr-2"></i>${config.name}`;
            button.onclick = () => filterCommands(category);
            filterButtons.appendChild(button);
        }
    });
}

// 検索モード切り替え
function toggleSearchMode(mode) {
    searchMode = mode;
    
    if (mode === 'name') {
        nameSearchBtn.classList.add('bg-white', 'text-discord');
        nameSearchBtn.classList.remove('text-white');
        fullSearchBtn.classList.remove('bg-white', 'text-discord');
        fullSearchBtn.classList.add('text-white');
        searchInput.placeholder = 'コマンド名で検索...';
    } else {
        fullSearchBtn.classList.add('bg-white', 'text-discord');
        fullSearchBtn.classList.remove('text-white');
        nameSearchBtn.classList.remove('bg-white', 'text-discord');
        nameSearchBtn.classList.add('text-white');
        searchInput.placeholder = '全文検索...';
    }
    
    if (searchInput.value) {
        performSearch();
    }
}

// 検索実行
function performSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    const commandCards = document.querySelectorAll('.command-card');
    let visibleCards = 0;

    commandCards.forEach(card => {
        const commandName = card.dataset.command.toLowerCase();
        let shouldShow = false;
        
        if (searchMode === 'name') {
            shouldShow = commandName.includes(searchTerm);
        } else {
            const cardText = card.textContent.toLowerCase();
            shouldShow = cardText.includes(searchTerm);
        }
        
        if (shouldShow) {
            card.style.display = 'block';
            visibleCards++;
        } else {
            card.style.display = 'none';
        }
    });

    noResults.style.display = visibleCards === 0 ? 'block' : 'none';
}

// debounce付き検索
function debouncedSearch() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(performSearch, 150);
}

// フィルター機能
function filterCommands(category) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('bg-discord', 'text-white');
        btn.classList.add('bg-gray-200', 'text-gray-700');
    });
    
    event.target.classList.remove('bg-gray-200', 'text-gray-700');
    event.target.classList.add('bg-discord', 'text-white');

    const commandCards = document.querySelectorAll('.command-card');
    let visibleCards = 0;
    
    commandCards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
            card.style.display = 'block';
            visibleCards++;
        } else {
            card.style.display = 'none';
        }
    });

    noResults.style.display = visibleCards === 0 ? 'block' : 'none';
    searchInput.value = '';
}

// JSONデータ読み込み
async function loadCommandsData() {
    try {
        const response = await fetch('commands.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        categoryConfig = data.categories || {};
        return data.commands || [];
    } catch (error) {
        console.error('コマンドデータの読み込みに失敗しました:', error);
        
        loadingMessage.innerHTML = `
            <i class="fas fa-exclamation-triangle text-red-500 text-2xl sm:text-4xl mb-2 sm:mb-4"></i>
            <h3 class="text-lg sm:text-xl font-semibold text-red-600 mb-1 sm:mb-2">データの読み込みに失敗しました</h3>
            <p class="text-gray-500 text-sm sm:text-base">ページを再読み込みしてください</p>
        `;
        return [];
    }
}

// コマンド読み込みと表示
async function loadCommands() {
    try {
        allCommands = await loadCommandsData();
        
        if (allCommands.length === 0) {
            return;
        }

        loadingMessage.style.display = 'none';
        
        createFilterButtons();
        
        // カード生成
        const desktopCards = allCommands.map((command, index) => createDesktopCard(command, index)).join('');
        commandsContainer.innerHTML = desktopCards;
        
        const mobileCards = allCommands.map((command, index) => createMobileCard(command, index)).join('');
        commandsContainerMobile.innerHTML = mobileCards;
        
        // 各カードに個別のイベントハンドラーを設定
        allCommands.forEach((command, index) => {
            // デスクトップ版
            setupIndividualToggle(`desktop-btn-${index}`, `desktop-details-${index}`, `desktop-icon-${index}`);
            
            // モバイル版
            setupIndividualToggle(`mobile-btn-${index}`, `mobile-details-${index}`, `mobile-icon-${index}`);
        });
        
        commandCount.textContent = `全 ${allCommands.length} コマンド`;
        console.log('コマンドが正常に読み込まれました:', allCommands.length);
    } catch (error) {
        console.error('コマンドの読み込み処理でエラーが発生しました:', error);
    }
}

// イベントリスナー設定
function setupEventListeners() {
    nameSearchBtn.addEventListener('click', () => toggleSearchMode('name'));
    fullSearchBtn.addEventListener('click', () => toggleSearchMode('full'));
    searchInput.addEventListener('input', debouncedSearch);
    expandAllBtn.addEventListener('click', expandAllDetails);
    collapseAllBtn.addEventListener('click', collapseAllDetails);
    
    const backToTopBtn = document.getElementById('backToTop');
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.remove('opacity-0', 'pointer-events-none');
        } else {
            backToTopBtn.classList.add('opacity-0', 'pointer-events-none');
        }
    });
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// 初期化処理
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    setupEventListeners();
    loadCommands();
});
