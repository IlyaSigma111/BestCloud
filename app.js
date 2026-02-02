// ====================
// КОНФИГУРАЦИЯ NCC
// ====================
const NCC_CONFIG = {
    PASSWORD: "JojoTop1", // Пароль администратора
    MAX_FILES: 10,
    MAX_SIZE: 500 * 1024 * 1024, // 500MB
    APP_NAME: "NeoCascadeCloud"
};

// Конфигурация Firebase
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyC9OSllGc8U-au0281HfikJkI5caDkqOYc",
    authDomain: "goydacloud.firebaseapp.com",
    projectId: "goydacloud",
    storageBucket: "goydacloud.firebasestorage.app",
    messagingSenderId: "937429390580",
    appId: "1:937429390580:web:7be76b6755a07ff6ae7aa1"
};

// Инициализация Firebase
let firebaseApp, storageRef;

try {
    if (!firebase.apps.length) {
        firebaseApp = firebase.initializeApp(FIREBASE_CONFIG);
        console.log("✅ NCC: Firebase инициализирован");
    } else {
        firebaseApp = firebase.app();
        console.log("✅ NCC: Firebase уже инициализирован");
    }
    
    storageRef = firebase.storage().ref();
    console.log("✅ NCC: Хранилище готово");
} catch (error) {
    console.error("❌ NCC: Ошибка инициализации Firebase:", error);
    showToast("Ошибка подключения к NCC", "error");
}

// ====================
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ NCC
// ====================
let nccFiles = [];
let selectedFiles = [];
let isUploading = false;

// ====================
// ИНИЦИАЛИЗАЦИЯ NCC
// ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 NCC: Запуск системы...");
    
    initializeLockScreen();
    initializeNavigation();
    initializeFileUpload();
    initializeDashboard();
    updateClock();
    
    // Запускаем обновление времени
    setInterval(updateClock, 1000);
    
    console.log("✅ NCC: Система инициализирована");
});

// ====================
// ЭКРАН БЛОКИРОВКИ
// ====================
function initializeLockScreen() {
    const passwordInput = document.getElementById('password-input');
    const unlockBtn = document.getElementById('unlock-btn');
    const toggleBtn = document.getElementById('toggle-password');
    
    if (!passwordInput || !unlockBtn || !toggleBtn) {
        console.error("❌ NCC: Элементы блокировки не найдены");
        return;
    }
    
    // Фокус на поле пароля
    setTimeout(() => passwordInput.focus(), 500);
    
    // Показать/скрыть пароль
    toggleBtn.addEventListener('click', function() {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        this.innerHTML = `<i class="fas fa-${type === 'password' ? 'eye' : 'eye-slash'}"></i>`;
    });
    
    // Разблокировка по кнопке
    unlockBtn.addEventListener('click', unlockNCC);
    
    // Разблокировка по Enter
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            unlockNCC();
        }
    });
}

function unlockNCC() {
    const input = document.getElementById('password-input');
    const errorElement = document.getElementById('lock-error');
    const unlockBtn = document.getElementById('unlock-btn');
    
    if (!input.value.trim()) {
        showLockError("Введите пароль", errorElement);
        return;
    }
    
    if (input.value === NCC_CONFIG.PASSWORD) {
        // Успешная разблокировка
        unlockBtn.disabled = true;
        unlockBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Доступ разрешен';
        
        errorElement.textContent = "✅ NCC разблокирован";
        errorElement.style.color = "#38b000";
        errorElement.style.background = "rgba(56, 176, 0, 0.1)";
        errorElement.style.border = "1px solid rgba(56, 176, 0, 0.3)";
        
        // Анимация перехода
        setTimeout(() => {
            document.getElementById('lock-screen').classList.remove('active');
            document.getElementById('lock-screen').style.opacity = '0';
            
            setTimeout(() => {
                document.getElementById('lock-screen').style.display = 'none';
                document.getElementById('main-app').style.display = 'block';
                
                // Загружаем данные
                loadNCCData();
                
                // Показываем приветствие
                setTimeout(() => {
                    showToast(`Добро пожаловать в ${NCC_CONFIG.APP_NAME}!`, "success");
                }, 500);
            }, 300);
        }, 1000);
    } else {
        showLockError("Неверный пароль", errorElement);
        
        // Анимация ошибки
        input.style.animation = 'none';
        setTimeout(() => {
            input.style.animation = 'shakeError 0.5s ease';
            input.value = '';
            input.focus();
        }, 10);
    }
}

function showLockError(message, element) {
    element.textContent = `❌ ${message}`;
    element.style.color = "#ff0054";
    element.style.background = "rgba(255, 0, 84, 0.1)";
    element.style.border = "1px solid rgba(255, 0, 84, 0.3)";
}

// ====================
// НАВИГАЦИЯ
// ====================
function initializeNavigation() {
    // Навигация по разделам
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const view = this.dataset.view;
            
            // Обновляем активный элемент
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            // Показываем выбранный раздел
            document.querySelectorAll('.view-section').forEach(section => {
                section.classList.remove('active');
            });
            
            document.getElementById(`${view}-view`).classList.add('active');
            
            // Загружаем данные для раздела
            switch(view) {
                case 'files':
                    loadNCCFiles();
                    break;
                case 'activity':
                    updateActivity();
                    break;
            }
        });
    });
    
    // Выход из системы
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            showModal(
                'Выход из NCC',
                'Вы уверены, что хотите выйти из системы?',
                [
                    {
                        text: 'Отмена',
                        class: 'modal-btn-secondary',
                        action: () => hideModal()
                    },
                    {
                        text: 'Выйти',
                        class: 'modal-btn-danger',
                        action: () => {
                            hideModal();
                            
                            // Плавный выход
                            document.getElementById('main-app').style.opacity = '0';
                            
                            setTimeout(() => {
                                document.getElementById('main-app').style.display = 'none';
                                document.getElementById('lock-screen').style.display = 'flex';
                                document.getElementById('lock-screen').classList.add('active');
                                
                                setTimeout(() => {
                                    document.getElementById('lock-screen').style.opacity = '1';
                                    document.getElementById('password-input').value = '';
                                    document.getElementById('password-input').focus();
                                }, 50);
                            }, 300);
                        }
                    }
                ]
            );
        });
    }
    
    // Обновление всех данных
    const refreshBtn = document.getElementById('refresh-all');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Обновление';
            this.disabled = true;
            
            Promise.all([
                loadNCCData(),
                loadNCCFiles()
            ]).then(() => {
                this.innerHTML = '<i class="fas fa-sync-alt"></i> Обновить';
                this.disabled = false;
                showToast('Данные NCC обновлены', 'success');
            });
        });
    }
}

// ====================
// ЗАГРУЗКА ФАЙЛОВ - ИСПРАВЛЕННАЯ ВЕРСИЯ
// ====================
function initializeFileUpload() {
    // Быстрая загрузка (dashboard)
    const quickDrop = document.getElementById('quick-drop');
    const quickInput = document.getElementById('quick-input');
    
    if (quickDrop && quickInput) {
        setupDropzone(quickDrop, quickInput);
    }
    
    // Основная загрузка
    const mainDrop = document.getElementById('main-dropzone');
    const mainInput = document.getElementById('main-file-input');
    
    if (mainDrop && mainInput) {
        setupDropzone(mainDrop, mainInput);
    }
    
    // Кнопки управления
    const startUploadBtn = document.getElementById('start-upload');
    const quickUploadBtn = document.getElementById('quick-upload-btn');
    const clearSelectionBtn = document.getElementById('clear-selection');
    
    if (startUploadBtn) {
        startUploadBtn.addEventListener('click', uploadFilesToNCC);
    }
    
    if (quickUploadBtn) {
        quickUploadBtn.addEventListener('click', uploadFilesToNCC);
    }
    
    if (clearSelectionBtn) {
        clearSelectionBtn.addEventListener('click', clearSelectedFiles);
    }
}

function setupDropzone(dropzone, fileInput) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(event => {
        dropzone.addEventListener(event, preventDefaults, false);
    });
    
    ['dragenter', 'dragover'].forEach(event => {
        dropzone.addEventListener(event, () => {
            dropzone.style.borderColor = 'var(--ncc-primary)';
            dropzone.style.background = 'rgba(0, 180, 216, 0.1)';
        }, false);
    });
    
    ['dragleave', 'drop'].forEach(event => {
        dropzone.addEventListener(event, () => {
            dropzone.style.borderColor = 'var(--border-color)';
            dropzone.style.background = '';
        }, false);
    });
    
    dropzone.addEventListener('drop', handleDrop, false);
    
    // КЛИК ПО ЗОНЕ: открываем окно выбора файлов
    dropzone.addEventListener('click', function(e) {
        if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            fileInput.click();
        }
    });
    
    // ИЗМЕНЕНИЕ INPUT: обрабатываем выбранные файлы
    fileInput.addEventListener('change', function(e) {
        if (this.files && this.files.length > 0) {
            handleFiles(this.files);
            // НЕ сбрасываем value - позволяем добавлять файлы при повторном клике
        }
    });
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files && files.length > 0) {
        handleFiles(files);
    }
}

function handleFiles(files) {
    if (!files || files.length === 0) return;
    
    // Ограничения
    if (files.length > NCC_CONFIG.MAX_FILES) {
        showToast(`Максимум ${NCC_CONFIG.MAX_FILES} файлов за раз`, 'warning');
        return;
    }
    
    // Проверка размера и добавление без дубликатов
    let addedCount = 0;
    let skippedCount = 0;
    
    Array.from(files).forEach(file => {
        // Проверка размера
        if (file.size > NCC_CONFIG.MAX_SIZE) {
            showToast(`Файл ${file.name} превышает 500MB`, 'warning');
            skippedCount++;
            return;
        }
        
        // Проверяем, нет ли уже такого файла (по имени, размеру и дате изменения)
        const isDuplicate = selectedFiles.some(existingFile => 
            existingFile.name === file.name && 
            existingFile.size === file.size &&
            existingFile.lastModified === file.lastModified
        );
        
        if (!isDuplicate) {
            selectedFiles.push(file);
            addedCount++;
        } else {
            skippedCount++;
        }
    });
    
    // Обновляем UI
    updateSelectedFilesUI();
    
    // Показываем сообщение о результате
    if (addedCount > 0) {
        showToast(`Добавлено ${addedCount} файлов${skippedCount > 0 ? `, ${skippedCount} пропущено` : ''}`, 'success');
    }
}

function updateSelectedFilesUI() {
    const selectedList = document.getElementById('selected-files-list');
    const startBtn = document.getElementById('start-upload');
    const quickBtn = document.getElementById('quick-upload-btn');
    const totalSpan = document.getElementById('selected-total');
    const sizeSpan = document.getElementById('selected-total-size');
    
    if (!selectedList) return;
    
    // Обновляем статистику
    const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);
    
    if (totalSpan) totalSpan.textContent = `${selectedFiles.length} файлов`;
    if (sizeSpan) sizeSpan.textContent = formatFileSize(totalSize);
    
    // Обновляем список
    if (selectedFiles.length === 0) {
        selectedList.innerHTML = `
            <div class="empty-mini">
                <i class="fas fa-folder-open"></i>
                <span>Файлы не выбраны</span>
            </div>
        `;
    } else {
        selectedList.innerHTML = selectedFiles.map((file, index) => `
            <div class="file-item">
                <div class="file-icon">
                    ${getFileIcon(file.name)}
                </div>
                <div class="file-details">
                    <div class="file-name" title="${file.name}">${file.name}</div>
                    <div class="file-info">
                        <span>${formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span>${file.type || 'Неизвестный тип'}</span>
                    </div>
                </div>
                <button class="file-remove" onclick="removeSelectedFile(${index})" title="Удалить из списка">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }
    
    // Обновляем кнопки
    const isEnabled = selectedFiles.length > 0 && !isUploading;
    if (startBtn) {
        startBtn.disabled = !isEnabled;
        startBtn.innerHTML = isEnabled 
            ? '<i class="fas fa-rocket"></i> Начать загрузку' 
            : '<i class="fas fa-rocket"></i> Выберите файлы';
    }
    
    if (quickBtn) {
        quickBtn.disabled = !isEnabled;
        quickBtn.innerHTML = isEnabled
            ? '<i class="fas fa-rocket"></i> Загрузить выбранное'
            : '<i class="fas fa-rocket"></i> Выберите файлы';
    }
}

function removeSelectedFile(index) {
    if (index >= 0 && index < selectedFiles.length) {
        const removedFile = selectedFiles.splice(index, 1)[0];
        updateSelectedFilesUI();
        showToast(`Файл "${removedFile.name}" удален из списка`, 'info');
    }
}

function clearSelectedFiles() {
    if (selectedFiles.length === 0) return;
    
    const count = selectedFiles.length;
    selectedFiles = [];
    updateSelectedFilesUI();
    showToast(`Список файлов очищен (${count} файлов удалено)`, 'info');
}

// ====================
// ЗАГРУЗКА ФАЙЛОВ В NCC
// ====================
async function uploadFilesToNCC() {
    if (selectedFiles.length === 0) {
        showToast('Нет файлов для загрузки', 'warning');
        return;
    }
    
    if (isUploading) {
        showToast('Загрузка уже выполняется', 'warning');
        return;
    }
    
    if (!storageRef) {
        showToast('Ошибка подключения к NCC', 'error');
        return;
    }
    
    isUploading = true;
    const progressArea = document.getElementById('upload-progress-area');
    
    // Настраиваем UI для загрузки
    document.querySelectorAll('[id*="upload"], [id*="start-upload"]').forEach(btn => {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Загрузка...';
    });
    
    // Показываем область прогресса
    if (progressArea) {
        progressArea.style.display = 'block';
        progressArea.innerHTML = `
            <h4><i class="fas fa-sync-alt fa-spin"></i> Загрузка файлов в NCC</h4>
            <div class="upload-progress-list"></div>
        `;
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    // Загружаем файлы последовательно
    for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const fileName = `ncc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${file.name}`;
        
        try {
            const fileRef = storageRef.child(fileName);
            
            // Создаем элемент прогресса
            const progressItem = document.createElement('div');
            progressItem.className = 'progress-item';
            progressItem.innerHTML = `
                <div class="progress-header">
                    <span class="progress-name" title="${file.name}">${file.name}</span>
                    <span class="progress-percent">0%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 0%"></div>
                </div>
            `;
            
            if (progressArea) {
                progressArea.querySelector('.upload-progress-list').appendChild(progressItem);
            }
            
            const progressPercent = progressItem.querySelector('.progress-percent');
            const progressFill = progressItem.querySelector('.progress-fill');
            
            // Загружаем файл
            await new Promise((resolve, reject) => {
                const uploadTask = fileRef.put(file);
                
                uploadTask.on('state_changed',
                    (snapshot) => {
                        // Обновляем прогресс
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        const rounded = Math.round(progress);
                        
                        progressPercent.textContent = `${rounded}%`;
                        progressFill.style.width = `${progress}%`;
                        
                        // Меняем цвет
                        if (progress < 30) {
                            progressFill.style.background = 'linear-gradient(90deg, #ff0054, #ffbe0b)';
                        } else if (progress < 70) {
                            progressFill.style.background = 'linear-gradient(90deg, #ffbe0b, #00b4d8)';
                        } else {
                            progressFill.style.background = 'linear-gradient(90deg, #00b4d8, #38b000)';
                        }
                    },
                    (error) => {
                        console.error('Ошибка загрузки:', error);
                        progressPercent.textContent = '❌ Ошибка';
                        progressFill.style.background = '#ff0054';
                        progressFill.style.width = '100%';
                        errorCount++;
                        resolve(); // Продолжаем несмотря на ошибку
                    },
                    async () => {
                        try {
                            // Получаем URL загруженного файла
                            await fileRef.getDownloadURL();
                            progressPercent.textContent = '✅ Загружен';
                            progressFill.style.background = 'linear-gradient(90deg, #00b4d8, #38b000)';
                            progressFill.style.width = '100%';
                            successCount++;
                            resolve();
                        } catch (urlError) {
                            console.error('Ошибка получения URL:', urlError);
                            progressPercent.textContent = '⚠️ Загружен без URL';
                            progressFill.style.background = '#ffbe0b';
                            errorCount++;
                            resolve();
                        }
                    }
                );
            });
            
        } catch (error) {
            console.error(`Ошибка загрузки файла ${file.name}:`, error);
            errorCount++;
        }
        
        // Небольшая пауза между файлами
        if (i < selectedFiles.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    
    // Завершение загрузки
    isUploading = false;
    
    // Обновляем UI
    document.querySelectorAll('[id*="upload"], [id*="start-upload"]').forEach(btn => {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-rocket"></i> Начать загрузку';
    });
    
    // Обновляем данные NCC
    await Promise.all([loadNCCData(), loadNCCFiles()]);
    
    // Очищаем выбранные файлы
    selectedFiles = [];
    updateSelectedFilesUI();
    
    // Показываем результат
    if (errorCount === 0) {
        showToast(`Успешно загружено ${successCount} файлов в NCC`, 'success');
    } else if (successCount === 0) {
        showToast('Не удалось загрузить файлы', 'error');
    } else {
        showToast(`Загружено ${successCount} из ${successCount + errorCount} файлов`, 'warning');
    }
    
    // Скрываем прогресс через 5 секунд
    if (progressArea) {
        setTimeout(() => {
            progressArea.style.display = 'none';
            progressArea.innerHTML = '';
        }, 5000);
    }
}

// ====================
// ЗАГРУЗКА ДАННЫХ NCC
// ====================
async function loadNCCData() {
    console.log("📊 NCC: Загрузка данных...");
    
    try {
        if (!storageRef) {
            throw new Error('Хранилище не инициализировано');
        }
        
        // Загружаем список файлов
        const result = await storageRef.listAll();
        nccFiles = [];
        
        // Получаем информацию о файлах
        for (const itemRef of result.items) {
            try {
                const metadata = await itemRef.getMetadata();
                const downloadURL = await itemRef.getDownloadURL();
                
                nccFiles.push({
                    name: itemRef.name,
                    originalName: extractOriginalName(itemRef.name),
                    size: metadata.size,
                    time: metadata.timeCreated,
                    url: downloadURL,
                    ref: itemRef
                });
            } catch (error) {
                console.warn('Не удалось получить метаданные для:', itemRef.name, error);
            }
        }
        
        // Обновляем статистику
        updateNCCStats();
        updateRecentFiles();
        
        console.log(`✅ NCC: Загружено ${nccFiles.length} файлов`);
        return nccFiles;
        
    } catch (error) {
        console.error('❌ NCC: Ошибка загрузки данных:', error);
        showToast('Ошибка загрузки данных NCC', 'error');
        throw error;
    }
}

async function loadNCCFiles() {
    const filesContainer = document.getElementById('all-files');
    const loadingElement = document.getElementById('files-loading');
    
    if (!filesContainer || !loadingElement) return;
    
    // Показываем загрузку
    filesContainer.style.opacity = '0.5';
    loadingElement.style.display = 'flex';
    
    try {
        // Если файлы еще не загружены, загружаем их
        if (nccFiles.length === 0) {
            await loadNCCData();
        }
        
        // Сортируем файлы
        const sortType = document.getElementById('sort-files')?.value || 'newest';
        const sortedFiles = [...nccFiles].sort((a, b) => {
            switch(sortType) {
                case 'newest': return new Date(b.time) - new Date(a.time);
                case 'oldest': return new Date(a.time) - new Date(b.time);
                case 'name': return a.originalName.localeCompare(b.originalName);
                case 'size': return b.size - a.size;
                default: return 0;
            }
        });
        
        // Отображаем файлы
        if (sortedFiles.length === 0) {
            filesContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-cloud"></i>
                    </div>
                    <h3>Хранилище NCC пустое</h3>
                    <p>Начните загрузку файлов</p>
                </div>
            `;
        } else {
            filesContainer.innerHTML = sortedFiles.map(file => `
                <div class="file-card">
                    <div class="file-icon">
                        ${getFileIcon(file.originalName)}
                    </div>
                    <div class="file-details">
                        <div class="file-name" title="${file.originalName}">${file.originalName}</div>
                        <div class="file-info">
                            <span>${formatFileSize(file.size)}</span>
                            <span>•</span>
                            <span>${formatDate(file.time)}</span>
                        </div>
                    </div>
                    <div class="file-actions">
                        <button class="file-action-btn download-btn" onclick="downloadNCCFile('${encodeURIComponent(file.url)}', '${encodeURIComponent(file.originalName)}')">
                            <i class="fas fa-download"></i> Скачать
                        </button>
                        <button class="file-action-btn delete-btn" onclick="deleteNCCFile('${encodeURIComponent(file.name)}')">
                            <i class="fas fa-trash"></i> Удалить
                        </button>
                    </div>
                </div>
            `).join('');
        }
        
    } catch (error) {
        console.error('❌ NCC: Ошибка отображения файлов:', error);
        filesContainer.innerHTML = `
            <div class="empty-state error">
                <div class="empty-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3>Ошибка загрузки</h3>
                <p>${error.message || 'Не удалось загрузить файлы'}</p>
                <button onclick="loadNCCFiles()" class="action-btn" style="margin-top: 15px;">
                    <i class="fas fa-redo"></i> Повторить
                </button>
            </div>
        `;
    } finally {
        filesContainer.style.opacity = '1';
        loadingElement.style.display = 'none';
    }
}

// ====================
// ОБНОВЛЕНИЕ СТАТИСТИКИ
// ====================
function updateNCCStats() {
    // Общий размер
    const totalSize = nccFiles.reduce((sum, file) => sum + file.size, 0);
    const totalFiles = nccFiles.length;
    
    // Обновляем элементы
    const totalStorage = document.getElementById('total-storage');
    const totalFilesElement = document.getElementById('total-files');
    const filesCount = document.getElementById('files-count');
    const storageStatus = document.getElementById('storage-status');
    
    if (totalStorage) totalStorage.textContent = formatFileSize(totalSize);
    if (totalFilesElement) totalFilesElement.textContent = totalFiles;
    if (filesCount) filesCount.textContent = `${totalFiles} файлов`;
    if (storageStatus) storageStatus.textContent = formatFileSize(totalSize);
    
    // Обновляем график использования
    updateStorageChart(totalSize);
}

function updateRecentFiles() {
    const recentList = document.getElementById('recent-files-list');
    if (!recentList) return;
    
    // Берем 5 последних файлов
    const recentFiles = [...nccFiles]
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 5);
    
    if (recentFiles.length === 0) {
        recentList.innerHTML = `
            <div class="empty-mini">
                <i class="fas fa-file"></i>
                <span>Нет недавних файлов</span>
            </div>
        `;
    } else {
        recentList.innerHTML = recentFiles.map(file => `
            <div class="file-item" onclick="downloadNCCFile('${encodeURIComponent(file.url)}', '${encodeURIComponent(file.originalName)}')">
                <div class="file-icon">
                    ${getFileIcon(file.originalName)}
                </div>
                <div class="file-details">
                    <div class="file-name" title="${file.originalName}">${file.originalName}</div>
                    <div class="file-info">
                        <span>${formatDate(file.time)}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function updateStorageChart(usedSize) {
    // Для демо - считаем что общий размер 10GB
    const totalSize = 10 * 1024 * 1024 * 1024; // 10GB
    const percent = Math.min((usedSize / totalSize) * 100, 100);
    
    const fillElement = document.getElementById('storage-fill');
    const percentElement = document.getElementById('storage-percent');
    const usedElement = document.getElementById('used-storage');
    const freeElement = document.getElementById('free-storage');
    
    if (fillElement) {
        fillElement.style.background = `conic-gradient(var(--ncc-primary) ${percent}%, transparent ${percent}% 100%)`;
    }
    
    if (percentElement) percentElement.textContent = `${Math.round(percent)}%`;
    if (usedElement) usedElement.textContent = formatFileSize(usedSize);
    if (freeElement) freeElement.textContent = formatFileSize(totalSize - usedSize);
}

function updateActivity() {
    const activityList = document.getElementById('activity-list');
    if (!activityList) return;
    
    // Для демо - создаем тестовые события
    const activities = [
        { time: 'Только что', action: 'Система NCC запущена', icon: 'fa-play', color: 'success' },
        { time: '2 мин назад', action: 'Загружено 3 файла', icon: 'fa-cloud-upload-alt', color: 'primary' },
        { time: '15 мин назад', action: 'Удален файл "report.pdf"', icon: 'fa-trash', color: 'danger' },
        { time: '1 час назад', action: 'Вход администратора', icon: 'fa-user-shield', color: 'warning' },
        { time: '2 часа назад', action: 'Системное обновление', icon: 'fa-sync-alt', color: 'info' }
    ];
    
    activityList.innerHTML = activities.map(act => `
        <div class="activity-item">
            <div class="activity-icon ${act.color}">
                <i class="fas ${act.icon}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-text">${act.action}</div>
                <div class="activity-time">${act.time}</div>
            </div>
        </div>
    `).join('');
}

// ====================
// РАБОТА С ФАЙЛАМИ
// ====================
function downloadNCCFile(url, filename) {
    try {
        const decodedUrl = decodeURIComponent(url);
        const decodedFilename = decodeURIComponent(filename);
        
        const a = document.createElement('a');
        a.href = decodedUrl;
        a.download = decodedFilename;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            document.body.removeChild(a);
        }, 100);
        
        showToast(`Скачивание: ${decodedFilename}`, 'success');
        
        // Добавляем в историю активности
        addActivity(`Скачан файл: ${decodedFilename}`);
        
    } catch (error) {
        console.error('Ошибка скачивания:', error);
        showToast('Ошибка при скачивании файла', 'error');
    }
}

async function deleteNCCFile(filename) {
    const decodedName = decodeURIComponent(filename);
    const originalName = extractOriginalName(decodedName);
    
    showModal(
        'Удаление файла',
        `Вы уверены, что хотите удалить файл <strong>"${originalName}"</strong> из NCC?`,
        [
            {
                text: 'Отмена',
                class: 'modal-btn-secondary',
                action: () => hideModal()
            },
            {
                text: 'Удалить',
                class: 'modal-btn-danger',
                action: async () => {
                    try {
                        await storageRef.child(decodedName).delete();
                        showToast('Файл удален из NCC', 'success');
                        
                        // Обновляем данные
                        await loadNCCData();
                        await loadNCCFiles();
                        
                        // Добавляем в историю активности
                        addActivity(`Удален файл: ${originalName}`);
                        
                    } catch (error) {
                        console.error('Ошибка удаления:', error);
                        showToast('Ошибка при удалении файла', 'error');
                    } finally {
                        hideModal();
                    }
                }
            }
        ]
    );
}

// ====================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ====================
function extractOriginalName(storedName) {
    // Формат: ncc_timestamp_random_originalname
    const parts = storedName.split('_');
    if (parts.length >= 4) {
        return parts.slice(3).join('_');
    }
    return storedName;
}

function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const icons = {
        pdf: '<i class="fas fa-file-pdf"></i>',
        doc: '<i class="fas fa-file-word"></i>', docx: '<i class="fas fa-file-word"></i>',
        txt: '<i class="fas fa-file-alt"></i>',
        jpg: '<i class="fas fa-file-image"></i>', jpeg: '<i class="fas fa-file-image"></i>',
        png: '<i class="fas fa-file-image"></i>', gif: '<i class="fas fa-file-image"></i>',
        mp4: '<i class="fas fa-file-video"></i>', avi: '<i class="fas fa-file-video"></i>',
        mp3: '<i class="fas fa-file-audio"></i>', wav: '<i class="fas fa-file-audio"></i>',
        zip: '<i class="fas fa-file-archive"></i>', rar: '<i class="fas fa-file-archive"></i>',
        exe: '<i class="fas fa-cog"></i>', msi: '<i class="fas fa-cog"></i>',
        xls: '<i class="fas fa-file-excel"></i>', xlsx: '<i class="fas fa-file-excel"></i>',
        default: '<i class="fas fa-file"></i>'
    };
    return icons[ext] || icons.default;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Б';
    const k = 1024;
    const sizes = ['Б', 'КБ', 'МБ', 'ГБ', 'ТБ'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // Сегодня
    if (diff < 24 * 60 * 60 * 1000) {
        return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    }
    
    // Вчера
    if (diff < 48 * 60 * 60 * 1000) {
        return 'Вчера';
    }
    
    // За последнюю неделю
    if (diff < 7 * 24 * 60 * 60 * 1000) {
        const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
        return days[date.getDay()];
    }
    
    // Более недели назад
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
}

function updateClock() {
    const timeElement = document.getElementById('current-time');
    if (!timeElement) return;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    });
    
    timeElement.textContent = timeString;
}

function addActivity(text) {
    const activityList = document.getElementById('activity-list');
    if (!activityList) return;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    
    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';
    activityItem.innerHTML = `
        <div class="activity-icon primary">
            <i class="fas fa-info-circle"></i>
        </div>
        <div class="activity-content">
            <div class="activity-text">${text}</div>
            <div class="activity-time">${timeString}</div>
        </div>
    `;
    
    // Добавляем в начало
    activityList.insertBefore(activityItem, activityList.firstChild);
    
    // Ограничиваем количество записей
    while (activityList.children.length > 10) {
        activityList.removeChild(activityList.lastChild);
    }
}

function initializeDashboard() {
    // Инициализируем сортировку
    const sortSelect = document.getElementById('sort-files');
    if (sortSelect) {
        sortSelect.addEventListener('change', loadNCCFiles);
    }
    
    // Инициализируем поиск
    const searchInput = document.getElementById('search-files');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const term = e.target.value.toLowerCase();
            const fileCards = document.querySelectorAll('.file-card');
            
            fileCards.forEach(card => {
                const fileName = card.querySelector('.file-name').textContent.toLowerCase();
                card.style.display = fileName.includes(term) ? 'block' : 'none';
            });
        });
    }
}

// ====================
// UI ФУНКЦИИ
// ====================
function showModal(title, body, buttons) {
    const overlay = document.getElementById('modal-overlay');
    const titleElement = document.getElementById('modal-title');
    const bodyElement = document.getElementById('modal-body');
    const footerElement = document.getElementById('modal-footer');
    
    if (!overlay || !titleElement || !bodyElement || !footerElement) return;
    
    // Устанавливаем содержимое
    titleElement.textContent = title;
    bodyElement.innerHTML = body;
    footerElement.innerHTML = '';
    
    // Добавляем кнопки
    buttons.forEach(btn => {
        const button = document.createElement('button');
        button.className = `modal-btn ${btn.class}`;
        button.textContent = btn.text;
        button.onclick = btn.action;
        footerElement.appendChild(button);
    });
    
    // Показываем модалку
    overlay.style.display = 'flex';
    
    // Закрытие по клику вне модалки
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) hideModal();
    });
    
    // Закрытие по Escape
    document.addEventListener('keydown', function closeOnEscape(e) {
        if (e.key === 'Escape') {
            hideModal();
            document.removeEventListener('keydown', closeOnEscape);
        }
    });
}

function hideModal() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    // Удаляем старые тосты
    const oldToasts = container.querySelectorAll('.toast');
    oldToasts.forEach(toast => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    });
    
    // Создаем новый тост
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${icons[type] || icons.info}"></i>
        </div>
        <div class="toast-message">${message}</div>
        <button class="toast-close">&times;</button>
    `;
    
    container.appendChild(toast);
    
    // Анимация появления
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Закрытие по кнопке
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    });
    
    // Автоматическое закрытие
    setTimeout(() => {
        if (toast.parentNode) {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }
    }, 5000);
}

// ====================
// ЭКСПОРТ ГЛОБАЛЬНЫХ ФУНКЦИЙ
// ====================
window.removeSelectedFile = removeSelectedFile;
window.downloadNCCFile = downloadNCCFile;
window.deleteNCCFile = deleteNCCFile;
window.loadNCCFiles = loadNCCFiles;

console.log("🚀 NCC (NeoCascadeCloud) готов к работе!");
