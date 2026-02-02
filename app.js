// ====================
// КОНФИГУРАЦИЯ FIREBASE
// ====================
const firebaseConfig = {
    // ⚠️ ВНИМАНИЕ: Это демо-ключи. В продакшене используйте переменные окружения!
    apiKey: "AIzaSyC9OSllGc8U-au0281HfikJkI5caDkqOYc",
    authDomain: "goydacloud.firebaseapp.com",
    projectId: "goydacloud",
    storageBucket: "goydacloud.firebasestorage.app",
    messagingSenderId: "937429390580",
    appId: "1:937429390580:web:7be76b6755a07ff6ae7aa1"
};

// Инициализация Firebase с проверкой
if (!firebase.apps.length) {
    try {
        firebase.initializeApp(firebaseConfig);
        console.log("✅ Firebase успешно инициализирован");
    } catch (error) {
        console.error("❌ Ошибка инициализации Firebase:", error);
        showToast('Ошибка подключения к облаку', 'error');
    }
}

const storage = firebase.storage();
const storageRef = storage.ref();

// ====================
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ====================
const CORRECT_PASSWORD = "JojoTop1";
let currentFiles = [];
let selectedFiles = [];

// ====================
// АВТОРИЗАЦИЯ
// ====================
function checkPassword() {
    const input = document.getElementById('password-input').value;
    const errorElement = document.getElementById('error-message');
    const loginBtn = document.getElementById('login-btn');
    
    if (!input) {
        errorElement.textContent = "⚠️ Введите пароль";
        errorElement.style.color = "#f9c74f";
        return;
    }
    
    if (input === CORRECT_PASSWORD) {
        // Анимация успеха
        errorElement.textContent = "✅ Успешный вход! Перенаправляем...";
        errorElement.style.color = "#4cc9f0";
        
        loginBtn.innerHTML = '<i class="fas fa-check"></i> Успешно!';
        loginBtn.style.background = 'linear-gradient(135deg, #4cc9f0, #4361ee)';
        loginBtn.disabled = true;
        
        // Плавный переход
        setTimeout(() => {
            document.getElementById('login-screen').style.opacity = '0';
            document.getElementById('login-screen').style.transform = 'translateY(-20px)';
            
            setTimeout(() => {
                document.getElementById('login-screen').style.display = 'none';
                document.getElementById('cloud-screen').style.display = 'flex';
                document.getElementById('cloud-screen').style.opacity = '0';
                document.getElementById('cloud-screen').style.transform = 'translateY(20px)';
                
                // Анимация появления облачного интерфейса
                setTimeout(() => {
                    document.getElementById('cloud-screen').style.opacity = '1';
                    document.getElementById('cloud-screen').style.transform = 'translateY(0)';
                    document.getElementById('cloud-screen').style.transition = 'all 0.5s ease';
                    loadFiles();
                }, 50);
            }, 300);
        }, 800);
    } else {
        // Анимация ошибки
        errorElement.textContent = "❌ Неверный пароль! Попробуйте снова";
        errorElement.style.color = "#ef233c";
        
        const passwordInput = document.getElementById('password-input');
        passwordInput.style.borderColor = '#ef233c';
        passwordInput.style.animation = 'shake 0.5s';
        
        loginBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Ошибка!';
        loginBtn.style.background = 'linear-gradient(135deg, #ef233c, #f9c74f)';
        
        setTimeout(() => {
            passwordInput.style.animation = '';
            passwordInput.value = '';
            passwordInput.focus();
            
            loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Войти в облако';
            loginBtn.style.background = 'linear-gradient(135deg, #4361ee, #7209b7)';
        }, 1000);
    }
}

// Показать/скрыть пароль
document.querySelector('.show-password').addEventListener('click', function() {
    const input = document.getElementById('password-input');
    const icon = this.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
        this.setAttribute('aria-label', 'Скрыть пароль');
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
        this.setAttribute('aria-label', 'Показать пароль');
    }
});

// Вход по Enter
document.getElementById('password-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        checkPassword();
    }
});

// 🔥 ИСПРАВЛЕНИЕ ГЛАВНОЙ ПРОБЛЕМЫ: Привязка кнопки входа
document.addEventListener('DOMContentLoaded', function() {
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', checkPassword);
        console.log("✅ Кнопка входа привязана");
    } else {
        console.error("❌ Кнопка входа не найдена!");
    }
    
    // Автофокус на поле пароля
    const passwordInput = document.getElementById('password-input');
    if (passwordInput) {
        setTimeout(() => passwordInput.focus(), 100);
    }
});

// Выход
document.getElementById('logout-btn').addEventListener('click', function() {
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
                // Плавная анимация выхода
                document.getElementById('cloud-screen').style.opacity = '0';
                document.getElementById('cloud-screen').style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    document.getElementById('cloud-screen').style.display = 'none';
                    document.getElementById('login-screen').style.display = 'flex';
                    document.getElementById('login-screen').style.opacity = '0';
                    
                    // Сброс формы
                    const passwordInput = document.getElementById('password-input');
                    const errorElement = document.getElementById('error-message');
                    const loginBtn = document.getElementById('login-btn');
                    
                    passwordInput.value = '';
                    errorElement.textContent = '';
                    loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Войти в облако';
                    loginBtn.style.background = 'linear-gradient(135deg, #4361ee, #7209b7)';
                    
                    // Плавное появление экрана входа
                    setTimeout(() => {
                        document.getElementById('login-screen').style.opacity = '1';
                        document.getElementById('login-screen').style.transform = 'translateY(0)';
                        document.getElementById('login-screen').style.transition = 'all 0.5s ease';
                        passwordInput.focus();
                    }, 50);
                }, 300);
            }
        }
    ]);
});

// ====================
// ЗАГРУЗКА ФАЙЛОВ
// ====================
const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');

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
    dropArea.style.borderColor = '#4361ee';
    dropArea.style.background = 'rgba(67, 97, 238, 0.1)';
    dropArea.style.transform = 'scale(1.02)';
}

function unhighlight() {
    dropArea.style.borderColor = '#e9ecef';
    dropArea.style.background = '#f8f9fa';
    dropArea.style.transform = 'scale(1)';
}

dropArea.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

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
    fileCount.textContent = `${selectedFiles.length} файл${getRussianPlural(selectedFiles.length)}`;
    
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
            <button class="file-preview-remove" onclick="removeFile(${index})" aria-label="Удалить файл">
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

// Функция загрузки файлов
async function uploadFile() {
    if (selectedFiles.length === 0) {
        showToast('Выберите файлы для загрузки', 'warning');
        return;
    }
    
    const uploadBtn = document.getElementById('upload-btn');
    const progressContainer = document.getElementById('upload-progress');
    
    // Блокируем кнопку загрузки
    uploadBtn.disabled = true;
    uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Загрузка...';
    
    // Очищаем контейнер прогресса
    progressContainer.innerHTML = '';
    
    // Показываем прогресс-бар
    progressContainer.style.display = 'block';
    
    // Создаем прогресс-бары для каждого файла
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
    
    let uploadErrors = 0;
    
    // Загружаем файлы по очереди
    for (let i = 0; i < progressBars.length; i++) {
        const pb = progressBars[i];
        const file = pb.file;
        const fileName = `${Date.now()}_${i}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const fileRef = storageRef.child(fileName);
        
        try {
            // Начинаем загрузку
            const uploadTask = fileRef.put(file);
            
            // Обещание для ожидания завершения
            await new Promise((resolve, reject) => {
                uploadTask.on('state_changed',
                    (snapshot) => {
                        // Обновляем прогресс
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        const roundedProgress = Math.round(progress);
                        
                        pb.percentElement.textContent = `${roundedProgress}%`;
                        pb.fillElement.style.width = `${progress}%`;
                        
                        // Анимация цвета
                        if (progress < 50) {
                            pb.fillElement.style.background = 'linear-gradient(90deg, #ef233c, #f9c74f)';
                        } else if (progress < 100) {
                            pb.fillElement.style.background = 'linear-gradient(90deg, #f9c74f, #4cc9f0)';
                        }
                    },
                    (error) => {
                        // Ошибка загрузки
                        console.error('Ошибка загрузки:', error);
                        pb.percentElement.textContent = '❌ Ошибка';
                        pb.fillElement.style.background = '#ef233c';
                        pb.fillElement.style.width = '100%';
                        uploadErrors++;
                        resolve(); // Разрешаем промис даже при ошибке
                    },
                    () => {
                        // Успешная загрузка
                        pb.percentElement.textContent = '✅ Готово';
                        pb.fillElement.style.background = 'linear-gradient(90deg, #4cc9f0, #4361ee)';
                        pb.fillElement.style.width = '100%';
                        pb.element.style.animation = 'pulse 1s';
                        resolve();
                    }
                );
            });
            
        } catch (error) {
            console.error(`Ошибка загрузки файла ${file.name}:`, error);
            pb.percentElement.textContent = '❌ Ошибка';
            pb.fillElement.style.background = '#ef233c';
            pb.fillElement.style.width = '100%';
            uploadErrors++;
        }
    }
    
    // Восстанавливаем кнопку
    setTimeout(() => {
        uploadBtn.disabled = false;
        uploadBtn.innerHTML = '<i class="fas fa-rocket"></i> Начать загрузку';
        
        // Скрываем прогресс-бар
        setTimeout(() => {
            progressContainer.style.display = 'none';
            progressContainer.innerHTML = '';
        }, 2000);
        
        // Обновляем список файлов
        loadFiles();
        
        // Очищаем выбранные файлы
        selectedFiles = [];
        updateSelectedFilesUI();
        
        // Показываем уведомление об успехе/ошибках
        if (uploadErrors === 0) {
            showToast(`Все файлы успешно загружены!`, 'success');
        } else if (uploadErrors === progressBars.length) {
            showToast(`Все файлы не загрузились`, 'error');
        } else {
            showToast(`Загружено ${progressBars.length - uploadErrors} из ${progressBars.length} файлов`, 'warning');
        }
        
    }, 1500);
}

// Привязываем функцию загрузки к кнопке
document.getElementById('upload-btn').addEventListener('click', uploadFile);

// ====================
// РАБОТА С ФАЙЛАМИ
// ====================
function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const icons = {
        // Документы
        pdf: '<i class="fas fa-file-pdf"></i>',
        doc: '<i class="fas fa-file-word"></i>', docx: '<i class="fas fa-file-word"></i>',
        txt: '<i class="fas fa-file-alt"></i>',
        rtf: '<i class="fas fa-file-alt"></i>',
        
        // Изображения
        jpg: '<i class="fas fa-file-image"></i>', jpeg: '<i class="fas fa-file-image"></i>',
        png: '<i class="fas fa-file-image"></i>', gif: '<i class="fas fa-file-image"></i>',
        webp: '<i class="fas fa-file-image"></i>', svg: '<i class="fas fa-file-image"></i>',
        bmp: '<i class="fas fa-file-image"></i>', ico: '<i class="fas fa-file-image"></i>',
        
        // Видео
        mp4: '<i class="fas fa-file-video"></i>', avi: '<i class="fas fa-file-video"></i>',
        mov: '<i class="fas fa-file-video"></i>', mkv: '<i class="fas fa-file-video"></i>',
        wmv: '<i class="fas fa-file-video"></i>', flv: '<i class="fas fa-file-video"></i>',
        
        // Аудио
        mp3: '<i class="fas fa-file-audio"></i>', wav: '<i class="fas fa-file-audio"></i>',
        ogg: '<i class="fas fa-file-audio"></i>', flac: '<i class="fas fa-file-audio"></i>',
        
        // Архивы
        zip: '<i class="fas fa-file-archive"></i>', rar: '<i class="fas fa-file-archive"></i>',
        '7z': '<i class="fas fa-file-archive"></i>', tar: '<i class="fas fa-file-archive"></i>',
        gz: '<i class="fas fa-file-archive"></i>',
        
        // Программы
        exe: '<i class="fas fa-cog"></i>', msi: '<i class="fas fa-cog"></i>',
        apk: '<i class="fas fa-mobile-alt"></i>', dmg: '<i class="fas fa-laptop"></i>',
        
        // Таблицы
        xls: '<i class="fas fa-file-excel"></i>', xlsx: '<i class="fas fa-file-excel"></i>',
        csv: '<i class="fas fa-file-csv"></i>',
        
        // Презентации
        ppt: '<i class="fas fa-file-powerpoint"></i>', pptx: '<i class="fas fa-file-powerpoint"></i>',
        
        // Веб
        html: '<i class="fas fa-code"></i>', css: '<i class="fas fa-code"></i>',
        js: '<i class="fas fa-code"></i>', json: '<i class="fas fa-code"></i>',
        php: '<i class="fas fa-code"></i>', xml: '<i class="fas fa-code"></i>',
        
        // По умолчанию
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

function getRussianPlural(number) {
    if (number % 10 === 1 && number % 100 !== 11) return '';
    if ([2, 3, 4].includes(number % 10) && ![12, 13, 14].includes(number % 100)) return 'а';
    return 'ов';
}

// Загрузка списка файлов
async function loadFiles() {
    const filesList = document.getElementById('files-list');
    const loading = document.getElementById('loading');
    const totalFiles = document.getElementById('total-files');
    const totalSizeStats = document.getElementById('total-size-stats');
    
    if (!filesList || !loading) return;
    
    // Показываем загрузку
    loading.style.display = 'flex';
    filesList.style.opacity = '0.5';
    
    try {
        // Получаем список файлов
        const listResult = await storageRef.listAll();
        currentFiles = [];
        
        // Получаем метаданные для каждого файла
        const filePromises = listResult.items.map(async (itemRef) => {
            try {
                const metadata = await itemRef.getMetadata();
                const downloadURL = await itemRef.getDownloadURL();
                
                // Извлекаем оригинальное имя файла
                const fileName = itemRef.name;
                const originalName = fileName.includes('_') 
                    ? fileName.substring(fileName.indexOf('_', fileName.indexOf('_') + 1) + 1)
                    : fileName;
                
                return {
                    name: itemRef.name,
                    originalName: decodeURIComponent(originalName),
                    size: metadata.size,
                    time: metadata.timeCreated,
                    url: downloadURL,
                    fullPath: itemRef.fullPath
                };
            } catch (error) {
                console.error('Ошибка загрузки метаданных:', error);
                return null;
            }
        });
        
        const files = await Promise.all(filePromises);
        currentFiles = files.filter(file => file !== null);
        
        // Сортируем файлы
        const sortType = document.getElementById('sort-select').value;
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
        totalFiles.textContent = currentFiles.length;
        totalSizeStats.textContent = formatFileSize(totalSizeBytes);
        
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
        
        // Показываем уведомление об успешной загрузке
        if (currentFiles.length > 0) {
            console.log(`✅ Загружено ${currentFiles.length} файлов`);
        }
        
    } catch (error) {
        console.error('❌ Ошибка загрузки файлов:', error);
        filesList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon" style="color: #ef233c;">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3>Ошибка загрузки</h3>
                <p>${error.message || 'Не удалось загрузить файлы'}</p>
                <button onclick="loadFiles()" class="btn-primary-small" style="margin-top: 15px;">
                    <i class="fas fa-redo"></i> Повторить
                </button>
            </div>
        `;
        showToast('Ошибка загрузки файлов', 'error');
    } finally {
        loading.style.display = 'none';
        filesList.style.opacity = '1';
    }
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
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(decodedUrl);
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
    const displayName = decodedFilename.includes('_') 
        ? decodedFilename.substring(decodedFilename.indexOf('_', decodedFilename.indexOf('_') + 1) + 1)
        : decodedFilename;
    
    showModal('Подтверждение удаления', `Вы уверены, что хотите удалить файл<br><strong>"${displayName}"</strong>?`, [
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
                    showToast('Файл успешно удален', 'success');
                    loadFiles();
                    hideModal();
                } catch (error) {
                    console.error('Ошибка удаления:', error);
                    showToast('Ошибка при удалении файла', 'error');
                    hideModal();
                }
            }
        }
    ]);
}

// ====================
// ПОИСК И СОРТИРОВКА
// ====================
document.getElementById('search-input').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase().trim();
    const fileItems = document.querySelectorAll('.file-item');
    
    if (!searchTerm) {
        fileItems.forEach(item => item.style.display = 'flex');
        return;
    }
    
    let foundCount = 0;
    fileItems.forEach(item => {
        const fileName = item.querySelector('.file-name').textContent.toLowerCase();
        if (fileName.includes(searchTerm)) {
            item.style.display = 'flex';
            item.style.animation = 'fadeIn 0.3s ease';
            foundCount++;
        } else {
            item.style.display = 'none';
        }
    });
    
    // Если ничего не найдено
    const filesList = document.getElementById('files-list');
    const noResults = filesList.querySelector('.no-results');
    
    if (foundCount === 0 && !noResults) {
        filesList.innerHTML += `
            <div class="empty-state no-results">
                <div class="empty-icon">
                    <i class="fas fa-search"></i>
                </div>
                <h3>Ничего не найдено</h3>
                <p>Попробуйте изменить запрос</p>
            </div>
        `;
    } else if (foundCount > 0 && noResults) {
        noResults.remove();
    }
});

document.getElementById('sort-select').addEventListener('change', loadFiles);

// Обновление по кнопке
document.getElementById('refresh-btn').addEventListener('click', () => {
    loadFiles();
    showToast('Список файлов обновлен', 'info');
});

// ====================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ====================
function showModal(title, body, buttons = []) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalFooter = document.getElementById('modal-footer');
    
    modalTitle.textContent = title;
    modalBody.innerHTML = body;
    modalFooter.innerHTML = '';
    
    buttons.forEach(btn => {
        const button = document.createElement('button');
        button.className = `btn ${btn.class}`;
        button.textContent = btn.text;
        button.onclick = btn.action;
        modalFooter.appendChild(button);
    });
    
    modal.style.display = 'flex';
    modal.style.opacity = '0';
    
    setTimeout(() => {
        modal.style.opacity = '1';
        modal.style.transition = 'opacity 0.3s ease';
    }, 10);
}

function hideModal() {
    const modal = document.getElementById('modal');
    modal.style.opacity = '0';
    
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
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
        <button class="toast-close" aria-label="Закрыть">&times;</button>
    `;
    
    // Добавляем в body
    document.body.appendChild(toast);
    
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

// Закрытие модального окна
document.querySelector('.modal-close').addEventListener('click', hideModal);
document.querySelector('.modal').addEventListener('click', function(e) {
    if (e.target === this) hideModal();
});

// Автоматическое обновление каждые 30 секунд
setInterval(() => {
    if (document.getElementById('cloud-screen').style.display !== 'none') {
        loadFiles();
    }
}, 30000);

// Запускаем загрузку файлов при старте
if (document.getElementById('cloud-screen').style.display !== 'none') {
    setTimeout(loadFiles, 500);
}

// Добавляем стили для анимаций
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes slideIn {
        from { opacity: 0; transform: translateX(-20px); }
        to { opacity: 1; transform: translateX(0); }
    }
    
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
    }
    
    .no-results {
        grid-column: 1 / -1;
        text-align: center;
        padding: 40px 20px;
    }
    
    .upload-progress {
        transition: all 0.3s ease;
    }
`;
document.head.appendChild(style);
