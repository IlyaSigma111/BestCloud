// ====================
// КОНФИГУРАЦИЯ FIREBASE
// ====================
const firebaseConfig = {
    apiKey: "AIzaSyC9OSllGc8U-au0281HfikJkI5caDkqOYc",
    authDomain: "goydacloud.firebaseapp.com",
    projectId: "goydacloud",
    storageBucket: "goydacloud.firebasestorage.app",
    messagingSenderId: "937429390580",
    appId: "1:937429390580:web:7be76b6755a07ff6ae7aa1"
};

// Инициализация Firebase
let storage, storageRef;

try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        console.log("✅ Firebase успешно инициализирован");
    } else {
        firebase.app(); // если уже инициализирован
    }
    
    storage = firebase.storage();
    storageRef = storage.ref();
} catch (error) {
    console.error("❌ Ошибка инициализации Firebase:", error);
    showToast('Ошибка подключения к облаку', 'error');
}

// ====================
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ====================
const CORRECT_PASSWORD = "JojoTop1";
let currentFiles = [];
let selectedFiles = [];
let isUploading = false;

// ====================
// АВТОРИЗАЦИЯ
// ====================
function checkPassword() {
    const input = document.getElementById('password-input').value.trim();
    const errorElement = document.getElementById('error-message');
    const loginBtn = document.getElementById('login-btn');
    
    if (!input) {
        errorElement.textContent = "⚠️ Введите пароль";
        errorElement.style.color = "#f59e0b";
        return;
    }
    
    if (input === CORRECT_PASSWORD) {
        // Анимация успеха
        errorElement.textContent = "✅ Успешный вход!";
        errorElement.style.color = "#10b981";
        
        loginBtn.innerHTML = '<i class="fas fa-check"></i> Успешно!';
        loginBtn.style.background = 'linear-gradient(135deg, #10b981, #34d399)';
        loginBtn.disabled = true;
        
        // Плавный переход
        setTimeout(() => {
            document.getElementById('login-screen').style.opacity = '0';
            document.getElementById('login-screen').style.transform = 'scale(0.9)';
            
            setTimeout(() => {
                document.getElementById('login-screen').style.display = 'none';
                document.getElementById('cloud-screen').style.display = 'flex';
                document.getElementById('cloud-screen').style.opacity = '0';
                
                // Инициализация облака
                setTimeout(() => {
                    document.getElementById('cloud-screen').style.opacity = '1';
                    document.getElementById('cloud-screen').style.transition = 'opacity 0.5s ease';
                    
                    // Загружаем файлы с таймаутом для гарантии
                    setTimeout(() => {
                        if (storageRef) {
                            loadFiles();
                        } else {
                            showToast('Ошибка подключения к Firebase', 'error');
                        }
                    }, 300);
                }, 50);
            }, 300);
        }, 800);
    } else {
        // Анимация ошибки
        errorElement.textContent = "❌ Неверный пароль!";
        errorElement.style.color = "#ef4444";
        
        const passwordInput = document.getElementById('password-input');
        passwordInput.style.borderColor = '#ef4444';
        passwordInput.style.animation = 'shake 0.5s';
        
        loginBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Ошибка!';
        loginBtn.style.background = 'linear-gradient(135deg, #ef4444, #f59e0b)';
        
        setTimeout(() => {
            passwordInput.style.animation = '';
            passwordInput.value = '';
            passwordInput.focus();
            
            loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Войти в облако';
            loginBtn.style.background = 'linear-gradient(135deg, #6366f1, #8b5cf6)';
        }, 1000);
    }
}

// Привязка событий при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 DOM загружен, инициализируем приложение...");
    
    // Привязка кнопки входа
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', checkPassword);
        console.log("✅ Кнопка входа привязана");
    }
    
    // Автофокус на поле пароля
    const passwordInput = document.getElementById('password-input');
    if (passwordInput) {
        setTimeout(() => passwordInput.focus(), 300);
    }
    
    // Показать/скрыть пароль
    const showPasswordBtn = document.querySelector('.show-password');
    if (showPasswordBtn) {
        showPasswordBtn.addEventListener('click', function() {
            const input = document.getElementById('password-input');
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.className = 'fas fa-eye-slash';
            } else {
                input.type = 'password';
                icon.className = 'fas fa-eye';
            }
        });
    }
    
    // Вход по Enter
    if (passwordInput) {
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                checkPassword();
            }
        });
    }
    
    // Инициализация загрузки файлов
    initFileUpload();
    
    console.log("✅ Приложение инициализировано");
});

// Инициализация загрузки файлов
function initFileUpload() {
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('file-input');
    
    if (!dropArea || !fileInput) {
        console.error("❌ Элементы загрузки не найдены");
        return;
    }
    
    // Обработка выбора файлов
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and Drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        dropArea.style.borderColor = '#6366f1';
        dropArea.style.background = 'rgba(99, 102, 241, 0.1)';
    }
    
    function unhighlight() {
        dropArea.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        dropArea.style.background = 'rgba(255, 255, 255, 0.03)';
    }
    
    dropArea.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }
    
    // Привязка кнопки загрузки
    const uploadBtn = document.getElementById('upload-btn');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', uploadFile);
    }
    
    // Привязка кнопки обновления
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadFiles();
            showToast('Список файлов обновлен', 'info');
        });
    }
    
    // Привязка поиска
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const fileItems = document.querySelectorAll('.file-item');
            
            fileItems.forEach(item => {
                const fileName = item.querySelector('.file-name').textContent.toLowerCase();
                item.style.display = fileName.includes(searchTerm) ? 'flex' : 'none';
            });
        });
    }
    
    // Привязка сортировки
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', loadFiles);
    }
    
    // Привязка выхода
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            showModal('Подтверждение выхода', 'Вы уверены, что хотите выйти из GoydaCloud?', [
                {
                    text: 'Отмена',
                    class: 'btn-secondary',
                    action: () => hideModal()
                },
                {
                    text: 'Выйти',
                    class: 'btn-danger',
                    action: () => {
                        hideModal();
                        document.getElementById('cloud-screen').style.display = 'none';
                        document.getElementById('login-screen').style.display = 'flex';
                        document.getElementById('password-input').value = '';
                        document.getElementById('error-message').textContent = '';
                        document.getElementById('login-btn').innerHTML = '<i class="fas fa-sign-in-alt"></i> Войти в облако';
                        document.getElementById('login-btn').style.background = 'linear-gradient(135deg, #6366f1, #8b5cf6)';
                        setTimeout(() => {
                            document.getElementById('password-input').focus();
                        }, 100);
                    }
                }
            ]);
        });
    }
    
    console.log("✅ Загрузка файлов инициализирована");
}

// Обработка файлов
function handleFileSelect(e) {
    const files = e.target.files;
    handleFiles(files);
}

function handleFiles(files) {
    if (!files || files.length === 0) return;
    
    // Ограничение на количество файлов
    if (files.length > 20) {
        showToast('Максимально 20 файлов за раз', 'warning');
        return;
    }
    
    // Проверка размера файлов
    const maxSize = 500 * 1024 * 1024; // 500MB
    let validFiles = [];
    
    Array.from(files).forEach(file => {
        if (file.size > maxSize) {
            showToast(`Файл ${file.name} слишком большой (макс. 500MB)`, 'warning');
        } else {
            validFiles.push(file);
        }
    });
    
    selectedFiles = [...selectedFiles, ...validFiles];
    updateSelectedFilesUI();
}

function updateSelectedFilesUI() {
    const container = document.getElementById('selected-files-container');
    const uploadBtn = document.getElementById('upload-btn');
    const totalSize = document.getElementById('total-size');
    const fileCount = document.getElementById('file-count');
    
    if (!container || !uploadBtn || !totalSize || !fileCount) return;
    
    if (selectedFiles.length === 0) {
        container.innerHTML = '';
        uploadBtn.disabled = true;
        totalSize.textContent = '0 Б';
        fileCount.textContent = '0 файлов';
        return;
    }
    
    // Обновляем статистику
    const totalSizeBytes = selectedFiles.reduce((sum, file) => sum + file.size, 0);
    totalSize.textContent = formatFileSize(totalSizeBytes);
    fileCount.textContent = `${selectedFiles.length} файлов`;
    
    // Обновляем список файлов
    container.innerHTML = selectedFiles.map((file, index) => `
        <div class="file-preview">
            <div class="file-preview-icon">
                ${getFileIcon(file.name)}
            </div>
            <div class="file-preview-info">
                <div class="file-preview-name" title="${file.name}">${file.name}</div>
                <div class="file-preview-size">${formatFileSize(file.size)}</div>
            </div>
            <button class="file-preview-remove" onclick="removeFile(${index})">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
    
    uploadBtn.disabled = false;
}

function removeFile(index) {
    selectedFiles.splice(index, 1);
    updateSelectedFilesUI();
    showToast('Файл удален из списка', 'info');
}

// 🔥 ИСПРАВЛЕННАЯ ФУНКЦИЯ ЗАГРУЗКИ ФАЙЛОВ
async function uploadFile() {
    if (selectedFiles.length === 0) {
        showToast('Выберите файлы для загрузки', 'warning');
        return;
    }
    
    if (isUploading) {
        showToast('Загрузка уже идет...', 'warning');
        return;
    }
    
    if (!storageRef) {
        showToast('Ошибка подключения к хранилищу', 'error');
        return;
    }
    
    const uploadBtn = document.getElementById('upload-btn');
    const progressContainer = document.getElementById('upload-progress');
    
    if (!uploadBtn || !progressContainer) return;
    
    isUploading = true;
    uploadBtn.disabled = true;
    uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Загрузка...';
    
    progressContainer.innerHTML = '';
    progressContainer.style.display = 'block';
    
    let uploadErrors = 0;
    let uploadSuccess = 0;
    
    // Создаем прогресс-бары
    const progressBars = selectedFiles.map((file, index) => {
        const progressDiv = document.createElement('div');
        progressDiv.className = 'progress-item';
        progressDiv.innerHTML = `
            <div class="progress-header">
                <span class="progress-filename" title="${file.name}">${file.name}</span>
                <span class="progress-percent" id="percent-${index}">0%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" id="progress-${index}" style="width: 0%"></div>
            </div>
        `;
        progressContainer.appendChild(progressDiv);
        
        return {
            element: progressDiv,
            percentElement: document.getElementById(`percent-${index}`),
            fillElement: document.getElementById(`progress-${index}`),
            file: file
        };
    });
    
    // Загружаем файлы последовательно
    for (let i = 0; i < progressBars.length; i++) {
        const pb = progressBars[i];
        const file = pb.file;
        
        // Генерируем уникальное имя файла
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const fileName = `${timestamp}_${random}_${safeName}`;
        
        try {
            const fileRef = storageRef.child(fileName);
            
            // Используем промис для загрузки
            await new Promise((resolve, reject) => {
                const uploadTask = fileRef.put(file);
                
                uploadTask.on('state_changed',
                    (snapshot) => {
                        // Прогресс загрузки
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        const roundedProgress = Math.round(progress);
                        
                        pb.percentElement.textContent = `${roundedProgress}%`;
                        pb.fillElement.style.width = `${progress}%`;
                        
                        // Меняем цвет в зависимости от прогресса
                        if (progress < 30) {
                            pb.fillElement.style.background = 'linear-gradient(90deg, #ef4444, #f59e0b)';
                        } else if (progress < 70) {
                            pb.fillElement.style.background = 'linear-gradient(90deg, #f59e0b, #10b981)';
                        } else {
                            pb.fillElement.style.background = 'linear-gradient(90deg, #10b981, #6366f1)';
                        }
                    },
                    (error) => {
                        console.error('Ошибка загрузки:', error);
                        pb.percentElement.textContent = '❌ Ошибка';
                        pb.fillElement.style.background = '#ef4444';
                        pb.fillElement.style.width = '100%';
                        uploadErrors++;
                        resolve(); // Продолжаем несмотря на ошибку
                    },
                    async () => {
                        // Успешная загрузка
                        try {
                            // Получаем URL файла
                            const downloadURL = await fileRef.getDownloadURL();
                            pb.percentElement.textContent = '✅ Готово';
                            pb.fillElement.style.background = 'linear-gradient(90deg, #10b981, #6366f1)';
                            pb.fillElement.style.width = '100%';
                            pb.element.style.animation = 'pulse 1s';
                            uploadSuccess++;
                            resolve();
                        } catch (urlError) {
                            console.error('Ошибка получения URL:', urlError);
                            pb.percentElement.textContent = '⚠️ Загружен, но ошибка URL';
                            pb.fillElement.style.background = '#f59e0b';
                            uploadErrors++;
                            resolve();
                        }
                    }
                );
            });
            
        } catch (error) {
            console.error(`Ошибка загрузки файла ${file.name}:`, error);
            pb.percentElement.textContent = '❌ Ошибка';
            pb.fillElement.style.background = '#ef4444';
            pb.fillElement.style.width = '100%';
            uploadErrors++;
        }
        
        // Небольшая пауза между файлами
        if (i < progressBars.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    
    // Завершение загрузки
    isUploading = false;
    
    setTimeout(() => {
        uploadBtn.disabled = false;
        uploadBtn.innerHTML = '<i class="fas fa-rocket"></i> Начать загрузку';
        
        // Скрываем прогресс через 3 секунды
        setTimeout(() => {
            progressContainer.style.display = 'none';
            progressContainer.innerHTML = '';
        }, 3000);
        
        // Обновляем список файлов
        loadFiles();
        
        // Очищаем выбранные файлы
        selectedFiles = [];
        updateSelectedFilesUI();
        
        // Показываем результат
        if (uploadErrors === 0) {
            showToast(`Все ${uploadSuccess} файлов успешно загружены!`, 'success');
        } else if (uploadSuccess === 0) {
            showToast('Не удалось загрузить ни одного файла', 'error');
        } else {
            showToast(`Загружено ${uploadSuccess} из ${progressBars.length} файлов`, 'warning');
        }
        
    }, 1000);
}

// 🔥 ИСПРАВЛЕННАЯ ФУНКЦИЯ ЗАГРУЗКИ СПИСКА ФАЙЛОВ
async function loadFiles() {
    console.log("📂 Загрузка списка файлов...");
    
    const filesList = document.getElementById('files-list');
    const loading = document.getElementById('loading');
    const totalFiles = document.getElementById('total-files');
    const totalSizeStats = document.getElementById('total-size-stats');
    
    if (!filesList || !loading) {
        console.error("❌ Элементы списка файлов не найдены");
        return;
    }
    
    // Показываем загрузку
    loading.style.display = 'flex';
    filesList.innerHTML = '';
    
    try {
        if (!storageRef) {
            throw new Error('Storage не инициализирован');
        }
        
        // Получаем список файлов
        const listResult = await storageRef.listAll();
        console.log(`📁 Найдено ${listResult.items.length} файлов`);
        
        currentFiles = [];
        
        // Получаем метаданные для каждого файла
        for (const itemRef of listResult.items) {
            try {
                const metadata = await itemRef.getMetadata();
                const downloadURL = await itemRef.getDownloadURL();
                
                // Извлекаем оригинальное имя файла
                const fileName = itemRef.name;
                let originalName = fileName;
                
                // Пытаемся извлечь оригинальное имя из имени файла
                const parts = fileName.split('_');
                if (parts.length >= 3) {
                    // Пропускаем timestamp и random часть
                    originalName = parts.slice(2).join('_');
                }
                
                currentFiles.push({
                    name: itemRef.name,
                    originalName: originalName,
                    size: metadata.size,
                    time: metadata.timeCreated,
                    url: downloadURL,
                    fullPath: itemRef.fullPath
                });
                
            } catch (error) {
                console.error('Ошибка загрузки метаданных для', itemRef.name, error);
            }
        }
        
        // Сортируем файлы
        const sortType = document.getElementById('sort-select')?.value || 'newest';
        currentFiles.sort((a, b) => {
            switch(sortType) {
                case 'newest': return new Date(b.time) - new Date(a.time);
                case 'oldest': return new Date(a.time) - new Date(b.time);
                case 'name': return a.originalName.localeCompare(b.originalName);
                case 'size': return b.size - a.size;
                default: return 0;
            }
        });
        
        // Обновляем статистику
        const totalSizeBytes = currentFiles.reduce((sum, file) => sum + file.size, 0);
        if (totalFiles) totalFiles.textContent = currentFiles.length;
        if (totalSizeStats) totalSizeStats.textContent = formatFileSize(totalSizeBytes);
        
        // Отображаем файлы
        if (currentFiles.length === 0) {
            filesList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-cloud"></i>
                    </div>
                    <h3>Облако пустое</h3>
                    <p>Перетащите файлы в область загрузки</p>
                </div>
            `;
        } else {
            filesList.innerHTML = currentFiles.map(file => `
                <div class="file-item">
                    <div class="file-icon">${getFileIcon(file.originalName)}</div>
                    <div class="file-info">
                        <div class="file-name" title="${file.originalName}">${file.originalName}</div>
                        <div class="file-meta">
                            <span>${formatFileSize(file.size)}</span>
                            <span>•</span>
                            <span>${formatDate(file.time)}</span>
                        </div>
                    </div>
                    <div class="file-actions">
                        <button class="btn-action btn-download" onclick="downloadFile('${encodeURIComponent(file.url)}', '${encodeURIComponent(file.originalName)}')" title="Скачать">
                            <i class="fas fa-download"></i>
                        </button>
                        <button class="btn-action btn-delete" onclick="deleteFile('${encodeURIComponent(file.name)}')" title="Удалить">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        }
        
        console.log(`✅ Загружено ${currentFiles.length} файлов`);
        
    } catch (error) {
        console.error('❌ Ошибка загрузки файлов:', error);
        filesList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon" style="color: #ef4444;">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3>Ошибка загрузки</h3>
                <p>${error.message || 'Не удалось подключиться к облаку'}</p>
                <button onclick="loadFiles()" class="btn" style="margin-top: 20px; background: rgba(99, 102, 241, 0.2); color: #6366f1; border: 1px solid rgba(99, 102, 241, 0.3);">
                    <i class="fas fa-redo"></i> Повторить
                </button>
            </div>
        `;
        showToast('Ошибка загрузки файлов: ' + error.message, 'error');
    } finally {
        loading.style.display = 'none';
    }
}

// Вспомогательные функции
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
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Скачивание файла
function downloadFile(url, filename) {
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
    } catch (error) {
        console.error('Ошибка скачивания:', error);
        showToast('Ошибка при скачивании файла', 'error');
    }
}

// Удаление файла
async function deleteFile(filename) {
    const decodedFilename = decodeURIComponent(filename);
    const displayName = decodedFilename.split('_').slice(2).join('_') || decodedFilename;
    
    showModal('Подтверждение удаления', `Удалить файл <strong>"${displayName}"</strong>?`, [
        {
            text: 'Отмена',
            class: 'btn-secondary',
            action: () => hideModal()
        },
        {
            text: 'Удалить',
            class: 'btn-danger',
            action: async () => {
                try {
                    await storageRef.child(decodedFilename).delete();
                    showToast('Файл удален', 'success');
                    loadFiles();
                } catch (error) {
                    console.error('Ошибка удаления:', error);
                    showToast('Ошибка при удалении файла', 'error');
                } finally {
                    hideModal();
                }
            }
        }
    ]);
}

// Вспомогательные функции UI
function showModal(title, body, buttons = []) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalFooter = document.getElementById('modal-footer');
    
    if (!modal || !modalTitle || !modalBody || !modalFooter) return;
    
    modalTitle.textContent = title;
    modalBody.innerHTML = `<p>${body}</p>`;
    modalFooter.innerHTML = '';
    
    buttons.forEach(btn => {
        const button = document.createElement('button');
        button.className = `btn ${btn.class}`;
        button.textContent = btn.text;
        button.onclick = btn.action;
        modalFooter.appendChild(button);
    });
    
    modal.style.display = 'flex';
}

function hideModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function showToast(message, type = 'info') {
    // Удаляем старые тосты
    const oldToasts = document.querySelectorAll('.toast');
    oldToasts.forEach(toast => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    });
    
    // Создаем элемент тоста
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
    
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    });
    
    setTimeout(() => {
        if (toast.parentNode) {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }
    }, 5000);
}

// Закрытие модального окна
document.querySelector('.modal-close')?.addEventListener('click', hideModal);
document.querySelector('.modal')?.addEventListener('click', function(e) {
    if (e.target === this) hideModal();
});

// Добавляем недостающие стили для анимаций
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
    
    @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.8; transform: scale(1.05); }
    }
    
    @keyframes slideIn {
        from { opacity: 0; transform: translateX(-20px); }
        to { opacity: 1; transform: translateX(0); }
    }
`;
document.head.appendChild(style);

// Проверяем, если уже на экране облака, загружаем файлы
if (document.getElementById('cloud-screen')?.style.display !== 'none') {
    setTimeout(loadFiles, 500);
}
