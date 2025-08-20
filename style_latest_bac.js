[⚠️ Suspicious Content] // Disnana Command Reference Script - Filter + Search Integration

let categoryConfig = {};
let allCommands = [];
let searchMode = 'name';
let searchTimeout = null;
let currentFilter = 'all'; // 現在のフィルタ状態を保持

function getElements() {
    return {
        commandsContainer: document.getElementById('commandsContainer'),
        commandsContainerMobile: document.getElementById('commandsContainerMobile'),
        loadingMessage: document.getElementById('loadingMessage'),
        noResults: document.getElementById('noResults'),
        searchInput: document.getElementById('searchInput'),
        commandCount: document.getElementById('commandCount'),
        filterButtons: document.getElementById('filterButtons'),
        nameSearchBtn: document.getElementById('nameSearchBtn'),
        fullSearchBtn: document.getElementById('fullSearchBtn'),
        expandAllBtn: document.getElementById('expandAllBtn'),
        collapseAllBtn: document.getElementById('collapseAllBtn')
    };
}

// ========== カード作成（前回と同じ） ==========
function createDesktopCard(command, index) {
    const config = categoryConfig[command.category];
    if (!config) return '';
    
    const wrapperId = `desktop_wrapper_${index}`;
    const detailsId = `desktop_details_${index}`;
    const iconId = `desktop_icon_${index}`;
    const buttonId = `desktop_button_${index}`;
    
    return `
        <div id="${wrapperId}" class="command-card-wrapper">
            <div class="command-card bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg" 
                 data-category="${command.category}" 
                 data-command="${command.name}">
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
                            <i class="fas fa-chevron-down text-sm transition-transform duration-200" 
                               id="${iconId}" 
                               style="transform: rotate(0deg);"></i>
                        </button>
                    </div>
                    
                    <p class="text-gray-700 mt-3 mb-2">${command.description}</p>
                    
                    <div class="flex flex-wrap gap-3 text-xs text-gray-500">
                        <span><i class="fas fa-terminal mr-1"></i>${command.usage}</span>
                        <span><i class="fas fa-shield-alt mr-1"></i>${command.permissions}</span>
                        ${command.cooldown ? `<span><i class="fas fa-clock mr-1"></i>${command.cooldown}</span>` : ''}
                    </div>
                </div>
                
                <div id="${detailsId}" style="display: none; position: relative; width: 100%;">
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
        </div>
    `;
}

function createMobileCard(command, index) {
    const config = categoryConfig[command.category];
    if (!config) return '';
    
    const wrapperId = `mobile_wrapper_${index}`;
    const detailsId = `mobile_details_${index}`;
    const iconId = `mobile_icon_${index}`;
    const buttonId = `mobile_button_${index}`;
    
    return `
        <div id="${wrapperId}" class="command-card-wrapper">
            <div class="command-card bg-white rounded-lg shadow-md border border-gray-200" 
                 data-category="${command.category}" 
                 data-command="${command.name}">
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
                            <i class="fas fa-chevron-down text-xs transition-transform duration-200" 
                               id="${iconId}"
                               style="transform: rotate(0deg);"></i>
                        </button>
                    </div>
                    
                    <p class="text-gray-700 text-sm mb-2">${command.description}</p>
                    
                    <div class="text-xs text-gray-500 space-y-1">
                        <div><i class="fas fa-terminal mr-1 w-3"></i>${command.usage}</div>
                        <div><i class="fas fa-shield-alt mr-1 w-3"></i>${command.permissions}</div>
                    </div>
                </div>
                
                <div id="${detailsId}" style="display: none; position: relative; width: 100%;">
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
        </div>
    `;
}

// ========== 開閉機能（前回と同じ） ==========
function createIndependentToggle(detailsId, iconId) {
    return function(event) {
        event.preventDefault();
        event.stopPropagation();
        
        const details = document.getElementById(detailsId);
        const icon = document.getElementById(iconId);
        
        if (!details || !icon) {
            console.error('Elements not found:', detailsId, iconId);
            return;
        }
        
        const isHidden = details.style.display === 'none';
        
        if (isHidden) {
            details.style.display = 'block';
            details.style.opacity = '0';
            details.style.transition = 'opacity 0.2s ease';
            
            requestAnimationFrame(() => {
                details.style.opacity = '1';
            });
            
            icon.style.transform = 'rotate(180deg)';
        } else {
            details.style.opacity = '0';
            
            setTimeout(() => {
                details.style.display = 'none';
                details.style.opacity = '';
            }, 200);
            
            icon.style.transform = 'rotate(0deg)';
        }
    };
}

// ========== フィルタ + 検索統合（検索リセット対応版） ==========
function applyFilterAndSearch() {
    const elements = getElements();
    const searchTerm = elements.searchInput.value.toLowerCase().trim();
    const commandWrappers = document.querySelectorAll('.command-card-wrapper');
    let visibleCards = 0;

    commandWrappers.forEach((wrapper, index) => {
        const card = wrapper.querySelector('.command-card');
        if (!card) {
            console.warn('カードが見つかりません:', wrapper);
            wrapper.style.display = 'none';
            return;
        }

        const commandName = card.dataset.command.toLowerCase();
        const commandCategory = card.dataset.category;
        
        // ステップ1: カテゴリフィルタをチェック
        let passesFilter = (currentFilter === 'all' || commandCategory === currentFilter);
        
        // ステップ2: 検索条件をチェック
        let passesSearch = true; // デフォルトは通す
        
        // 検索ワードがある場合のみ検索条件を適用
        if (searchTerm.length > 0) {
            if (searchMode === 'name') {
                passesSearch = commandName.includes(searchTerm);
            } else {
                const cardText = wrapper.textContent.toLowerCase();
                passesSearch = cardText.includes(searchTerm);
            }
        }
        // 検索ワードが空の場合は passesSearch = true のまま
        
        // ステップ3: 表示/非表示の決定（両方の条件を満たす必要がある）
        const shouldShow = passesFilter && passesSearch;
        
        if (shouldShow) {
            wrapper.style.display = 'block';
            visibleCards++;
        } else {
            wrapper.style.display = 'none';
        }
    });

    elements.noResults.style.display = visibleCards === 0 ? 'block' : 'none';
}
// ========== 検索機能（リセット対応版） ==========
function performSearch() {
    const elements = getElements();
    const searchTerm = elements.searchInput.value.trim();
    applyFilterAndSearch();
}

// ========== debounce検索（リセット対応版） ==========
function debouncedSearch() {
    clearTimeout(searchTimeout);
    
    // 検索ワードが空の場合は即座に実行（遅延なし）
    const searchTerm = getElements().searchInput.value.trim();
    if (searchTerm.length === 0) {
        performSearch();
    } else {
        // 検索ワードがある場合は通常の遅延
        searchTimeout = setTimeout(performSearch, 150);
    }
}

// ========== フィルタ機能（リセット連携版） ==========
function filterCommands(category, clickedButton) {
    const elements = getElements();
    
    // 現在のフィルタ状態を更新
    const previousFilter = currentFilter;
    currentFilter = category;
    
    // 全てのボタンをリセット
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('bg-discord', 'text-white');
        btn.classList.add('bg-gray-200', 'text-gray-700');
    });
    
    // クリックされたボタンのみをアクティブ化
    if (clickedButton) {
        clickedButton.classList.remove('bg-gray-200', 'text-gray-700');
        clickedButton.classList.add('bg-discord', 'text-white');
    }
    
    // 統合フィルタ+検索を適用
    applyFilterAndSearch();
}

// ========== 検索モード切り替え（統合版） ==========
function toggleSearchMode(mode) {
    const elements = getElements();
    const previousMode = searchMode;
    searchMode = mode;
    
    if (mode === 'name') {
        elements.nameSearchBtn.classList.add('bg-white', 'text-discord');
        elements.nameSearchBtn.classList.remove('text-white');
        elements.fullSearchBtn.classList.remove('bg-white', 'text-discord');
        elements.fullSearchBtn.classList.add('text-white');
        elements.searchInput.placeholder = 'コマンド名で検索...';
    } else {
        elements.fullSearchBtn.classList.add('bg-white', 'text-discord');
        elements.fullSearchBtn.classList.remove('text-white');
        elements.nameSearchBtn.classList.remove('bg-white', 'text-discord');
        elements.nameSearchBtn.classList.add('text-white');
        elements.searchInput.placeholder = '全文検索...';
    }
    
    // 検索モード変更時も再検索を実行
    if (elements.searchInput.value.trim()) {
        applyFilterAndSearch();
    }
}

// ========== 全体開閉機能（前回と同じ） ==========
function expandAllDetails() {
    allCommands.forEach((_, index) => {
        const desktopDetails = document.getElementById(`desktop_details_${index}`);
        const desktopIcon = document.getElementById(`desktop_icon_${index}`);
        if (desktopDetails && desktopDetails.style.display === 'none') {
            desktopDetails.style.display = 'block';
            desktopDetails.style.opacity = '1';
            if (desktopIcon) desktopIcon.style.transform = 'rotate(180deg)';
        }
        
        const mobileDetails = document.getElementById(`mobile_details_${index}`);
        const mobileIcon = document.getElementById(`mobile_icon_${index}`);
        if (mobileDetails && mobileDetails.style.display === 'none') {
            mobileDetails.style.display = 'block';
            mobileDetails.style.opacity = '1';
            if (mobileIcon) mobileIcon.style.transform = 'rotate(180deg)';
        }
    });
}

function collapseAllDetails() {
    allCommands.forEach((_, index) => {
        const desktopDetails = document.getElementById(`desktop_details_${index}`);
        const desktopIcon = document.getElementById(`desktop_icon_${index}`);
        if (desktopDetails && desktopDetails.style.display !== 'none') {
            desktopDetails.style.display = 'none';
            if (desktopIcon) desktopIcon.style.transform = 'rotate(0deg)';
        }
        
        const mobileDetails = document.getElementById(`mobile_details_${index}`);
        const mobileIcon = document.getElementById(`mobile_icon_${index}`);
        if (mobileDetails && mobileDetails.style.display !== 'none') {
            mobileDetails.style.display = 'none';
            if (mobileIcon) mobileIcon.style.transform = 'rotate(0deg)';
        }
    });
}

// ========== 読み込み（「全て」ボタン対応版） ==========
async function loadCommands() {
    const elements = getElements();
    
    try {
        allCommands = await loadCommandsData();
        
        if (allCommands.length === 0) {
            return;
        }

        elements.loadingMessage.style.display = 'none';
        
        const desktopCards = allCommands.map((command, index) => createDesktopCard(command, index)).join('');
        elements.commandsContainer.innerHTML = desktopCards;
        
        const mobileCards = allCommands.map((command, index) => createMobileCard(command, index)).join('');
        elements.commandsContainerMobile.innerHTML = mobileCards;
        
        // フィルタボタンを作成（「全て」ボタン付き）
        createFilterButtons();
        
        // 初期フィルタ状態を設定
        setInitialFilterState();
        
        // トグル機能を設定
        setupToggleHandlers();
        
        elements.commandCount.textContent = `全 ${allCommands.length} コマンド`;
        
        // 初期表示を確実に実行
        applyFilterAndSearch();
        
        // デバッグ関数をグローバルに設定
        window.debugCurrentState = debugCurrentState;
        window.resetFiltersAndSearch = resetFiltersAndSearch;
        
    } catch (error) {
        console.error('エラー:', error);
    }
}

function setupToggleHandlers() {
    allCommands.forEach((command, index) => {
        const desktopButton = document.getElementById(`desktop_button_${index}`);
        if (desktopButton) {
            desktopButton.onclick = createIndependentToggle(`desktop_details_${index}`, `desktop_icon_${index}`);
        }
        
        const mobileButton = document.getElementById(`mobile_button_${index}`);
        if (mobileButton) {
            mobileButton.onclick = createIndependentToggle(`mobile_details_${index}`, `mobile_icon_${index}`);
        }
    });
}

async function loadCommandsData() {
    const elements = getElements();
    
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
        
        elements.loadingMessage.innerHTML = `
            <i class="fas fa-exclamation-triangle text-red-500 text-2xl sm:text-4xl mb-2 sm:mb-4"></i>
            <h3 class="text-lg sm:text-xl font-semibold text-red-600 mb-1 sm:mb-2">データの読み込みに失敗しました</h3>
            <p class="text-gray-500 text-sm sm:text-base">ページを再読み込みしてください</p>
        `;
        return [];
    }
}

// ========== フィルターボタン作成（「全て」ボタン追加版） ==========
function createFilterButtons() {
    const elements = getElements();
    const categories = [...new Set(allCommands.map(cmd => cmd.category))];
    
    // 既存のボタンを削除してから作成
    elements.filterButtons.innerHTML = '';
    
    // まず「全て」ボタンを作成
    const allButton = document.createElement('button');
    allButton.className = 'filter-btn bg-discord text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors';
    allButton.innerHTML = '<i class="fas fa-list mr-1 sm:mr-2"></i>全て';
    allButton.setAttribute('data-category', 'all');
    allButton.onclick = (e) => {
        e.preventDefault();
        filterCommands('all', allButton);
    };
    elements.filterButtons.appendChild(allButton);
    
    // 各カテゴリのボタンを作成
    categories.forEach(category => {
        const config = categoryConfig[category];
        if (config) {
            const button = document.createElement('button');
            button.className = 'filter-btn bg-gray-200 text-gray-700 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors hover:bg-gray-300';
            
            // アイコンを明確に設定
            button.innerHTML = `<i class="${config.icon} mr-1 sm:mr-2" data-category="${category}"></i>${config.name}`;
            button.setAttribute('data-category', category);
            button.onclick = (e) => {
                e.preventDefault();
                filterCommands(category, button);
            };
            
            elements.filterButtons.appendChild(button);
        }
    });
}

// ========== イベントリスナー設定（強化版） ==========
function setupEventListeners() {
    const elements = getElements();
    
    elements.nameSearchBtn.addEventListener('click', () => toggleSearchMode('name'));
    elements.fullSearchBtn.addEventListener('click', () => toggleSearchMode('full'));
    
    // 検索入力の設定（改良版）
    setupSearchInputListener();
    
    elements.expandAllBtn.addEventListener('click', expandAllDetails);
    elements.collapseAllBtn.addEventListener('click', collapseAllDetails);
    
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

// ========== 検索入力イベントの改良 ==========
function setupSearchInputListener() {
    const elements = getElements();
    
    // 入力イベント
    elements.searchInput.addEventListener('input', function(e) {
        const currentValue = e.target.value;
        debouncedSearch();
    });
    
    // キーボードイベント（Escapeキーでクリア）
    elements.searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            e.target.value = '';
            performSearch(); // 即座に実行
        }
    });
}

// ========== デバッグ関数（「全て」ボタン確認版） ==========
function debugCurrentState() {
    const elements = getElements();
    const searchTerm = elements.searchInput.value;
    
    // フィルタボタンの状態確認
    const allButton = document.querySelector('.filter-btn[data-category="all"]');
    const activeButton = document.querySelector('.filter-btn.bg-discord');
    
    const wrappers = document.querySelectorAll('.command-card-wrapper');
    const visible = Array.from(wrappers).filter(w => w.style.display !== 'none');
    const hidden = Array.from(wrappers).filter(w => w.style.display === 'none');
}

// F12コンソールで debugCurrentState() を実行してデバッグ可能
window.debugCurrentState = debugCurrentState;

// ========== 手動リセット機能 ==========
function resetFiltersAndSearch() {
    const elements = getElements();
    
    // 検索ワードをクリア
    elements.searchInput.value = '';
    
    // フィルタを「全て」に戻す
    currentFilter = 'all';
    
    // 「全て」ボタンをアクティブにし、他のボタンを非アクティブにする
    document.querySelectorAll('.filter-btn').forEach(btn => {
        const category = btn.getAttribute('data-category');
        if (category === 'all') {
            btn.classList.add('bg-discord', 'text-white');
            btn.classList.remove('bg-gray-200', 'text-gray-700');
        } else {
            btn.classList.remove('bg-discord', 'text-white');
            btn.classList.add('bg-gray-200', 'text-gray-700');
        }
    });
    
    // 表示を更新
    applyFilterAndSearch();
    
}

// ========== 初期フィルタ状態の設定 ==========
function setInitialFilterState() {
    // 初期状態では「全て」を選択状態にする
    currentFilter = 'all';
    
    const allButton = document.querySelector('.filter-btn[data-category="all"]');
    if (allButton) {
        allButton.classList.add('bg-discord', 'text-white');
        allButton.classList.remove('bg-gray-200', 'text-gray-700');
    }
}

// ========== 初期化（デバッグ機能付き） ==========
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadCommands();
});
