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
try {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase успешно инициализирован");
} catch (error) {
    console.error("Ошибка инициализации Firebase:", error);
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
    
    if (input === CORRECT_PASSWORD) {
        errorElement.textContent = "✅ Успешный вход! Перенаправляем...";
        errorElement.style.color = "#4cc9f0";
        
        // Добавляем анимацию успеха
        document.querySelector('.btn-primary').innerHTML = '<i class="fas fa-check"></i> Успешно!';
        document.querySelector('.btn-primary').style.background = 'linear-gradient(135deg, #4cc9f0, #4361ee)';
        
        setTimeout(() => {
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('cloud-screen').style.display = 'flex';
            loadFiles();
        }, 800);
    } else {
        errorElement.textContent = "❌ Неверный пароль! Попробуйте снова";
        errorElement.style.color = "#ef233c";
        
        // Анимация ошибки
        document.getElementById('password-input').style.borderColor = '#ef233c';
        document.getElementById('password-input').style.animation = 'shake 0.5s';
        
        setTimeout(() => {
            document.getElementById('password-input').style.animation = '';
            document.getElementById('password-input').value = '';
            document.getElementById('password-input').focus();
        }, 500);
    }
}

// Показать/скрыть пароль
document.querySelector('.show-password').addEventListener('click', function() {
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

// Вход по Enter
document.getElementById('password-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkPassword();
});

// Выход
document.getElementById('logout-btn').addEventListener('click', function() {
    showModal('Подтверждение', 'Вы уверены, что хотите выйти из GoydaCloud?', [
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
                document.querySelector('.btn-primary').innerHTML = '<i class="fas fa-sign-in-alt"></i> Войти в облако';
                document.querySelector('.btn-primary').style.background = 'linear-gradient(135deg, #4361ee, #7209b7)';
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
    selectedFiles = Array.from(files);
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
    fileCount.textContent = `${selectedFiles.length} файл${selectedFiles.length === 1 ? '' : 'а'}`;
    
    // Обновляем список файлов
    container.innerHTML = selectedFiles.map((file, index) => `
        <div class="file-preview">
            <div class="file-preview-icon">
                ${getFileIcon(file.name)}
            </div>
            <div class="file-preview-info">
                <div class="file-preview-name">${file.name}</div>
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
}

// Функция загрузки файлов
async function uploadFile() {
    if (selectedFiles.length === 0) return;
    
    const uploadBtn = document.getElementById('upload-btn');
    const progressContainer = document.getElementById('upload-progress');
    
    // Блокируем кнопку загрузки
    uploadBtn.disabled = true;
    uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Загрузка...';
    
    // Очищаем контейнер прогресса
    progressContainer.innerHTML = '';
    
    // Создаем прогресс-бары для каждого файла
    const progressBars = selectedFiles.map((file, index) => {
        const progressDiv = document.createElement('div');
        progressDiv.className = 'progress-item';
        progressDiv.innerHTML = `
            <div class="progress-header">
                <span class="progress-filename">${file.name}</span>
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
            fillElement: document.getElementById(`progress-${index}`)
        };
    });
    
    // Загружаем файлы по очереди
    for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const fileName = `${Date.now()}_${file.name}`;
        const fileRef = storageRef.child(fileName);
        
        try {
            // Начинаем загрузку
            const uploadTask = fileRef.put(file);
            
            // Обработка прогресса
            uploadTask.on('state_changed',
                (snapshot) => {
                    // Обновляем прогресс
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    const roundedProgress = Math.round(progress);
                    
                    progressBars[i].percentElement.textContent = `${roundedProgress}%`;
                    progressBars[i].fillElement.style.width = `${progress}%`;
                    
                    // Анимация цвета
                    if (progress < 50) {
                        progressBars[i].fillElement.style.background = 'linear-gradient(90deg, #ef233c, #f9c74f)';
                    } else if (progress < 100) {
                        progressBars[i].fillElement.style.background = 'linear-gradient(90deg, #f9c74f, #4cc9f0)';
                    }
                },
                (error) => {
                    // Ошибка загрузки
                    console.error('Ошибка загрузки:', error);
                    progressBars[i].percentElement.textContent = '❌ Ошибка';
                    progressBars[i].fillElement.style.background = '#ef233c';
                    progressBars[i].fillElement.style.width = '100%';
                },
                () => {
                    // Успешная загрузка
                    progressBars[i].percentElement.textContent = '✅ Готово';
                    progressBars[i].fillElement.style.background = 'linear-gradient(90deg, #4cc9f0, #4361ee)';
                    progressBars[i].fillElement.style.width = '100%';
                    
                    // Добавляем анимацию успеха
                    progressBars[i].element.style.animation = 'pulse 1s';
                }
            );
            
            // Ждем завершения загрузки этого файла перед следующим
            await uploadTask;
            
        } catch (error) {
            console.error(`Ошибка загрузки файла ${file.name}:`, error);
            progressBars[i].percentElement.textContent = '❌ Ошибка';
            progressBars[i].fillElement.style.background = '#ef233c';
        }
    }
    
    // Восстанавливаем кнопку
    setTimeout(() => {
        uploadBtn.disabled = false;
        uploadBtn.innerHTML = '<i class="fas fa-rocket"></i> Начать загрузку';
        
        // Обновляем список файлов
        loadFiles();
        
        // Очищаем выбранные файлы
        selectedFiles = [];
        updateSelectedFilesUI();
        
        // Показываем уведомление об успехе
        showToast('Все файлы успешно загружены!', 'success');
        
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
        
        // Изображения
        jpg: '<i class="fas fa-file-image"></i>', jpeg: '<i class="fas fa-file-image"></i>',
        png: '<i class="fas fa-file-image"></i>', gif: '<i class="fas fa-file-image"></i>',
        webp: '<i class="fas fa-file-image"></i>', svg: '<i class="fas fa-file-image"></i>',
        
        // Видео
        mp4: '<i class="fas fa-file-video"></i>', avi: '<i class="fas fa-file-video"></i>',
        mov: '<i class="fas fa-file-video"></i>', mkv: '<i class="fas fa-file-video"></i>',
        
        // Аудио
        mp3: '<i class="fas fa-file-audio"></i>', wav: '<i class="fas fa-file-audio"></i>',
        
        // Архивы
        zip: '<i class="fas fa-file-archive"></i>', rar: '<i class="fas fa-file-archive"></i>',
        '7z': '<i class="fas fa-file-archive"></i>', tar: '<i class="fas fa-file-archive"></i>',
        
        // Программы
        exe: '<i class="fas fa-cog"></i>', msi: '<i class="fas fa-cog"></i>',
        
        // Таблицы
        xls: '<i class="fas fa-file-excel"></i>', xlsx: '<i class="fas fa-file-excel"></i>',
        csv: '<i class="fas fa-file-csv"></i>',
        
        // Веб
        html: '<i class="fas fa-code"></i>', css: '<i class="fas fa-code"></i>',
        js: '<i class="fas fa-code"></i>', json: '<i class="fas fa-code"></i>',
        
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

// Загрузка списка файлов
async function loadFiles() {
    const filesList = document.getElementById('files-list');
    const loading = document.getElementById('loading');
    const totalFiles = document.getElementById('total-files');
    const totalSizeStats = document.getElementById('total-size-stats');
    
    // Показываем загрузку
    loading.style.display = 'flex';
    filesList.innerHTML = '';
    
    try {
        // Получаем список файлов
        const listResult = await storageRef.listAll();
        currentFiles = [];
        
        // Получаем метаданные для каждого файла
        for (const itemRef of listResult.items) {
            try {
                const metadata = await itemRef.getMetadata();
                const downloadURL = await itemRef.getDownloadURL();
                
                currentFiles.push({
                    name: itemRef.name,
                    originalName: itemRef.name.includes('_') ? itemRef.name.split('_').slice(1).join('_') : itemRef.name,
                    size: metadata.size,
                    time: metadata.timeCreated,
                    url: downloadURL,
                    fullPath: itemRef.fullPath
                });
            } catch (error) {
                console.error('Ошибка загрузки метаданных:', error);
            }
        }
        
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
                    <p>Загрузите свой первый файл</p>
                </div>
            `;
        } else {
            filesList.innerHTML = currentFiles.map(file => `
                <div class="file-item">
                    <div class="file-icon">${getFileIcon(file.originalName)}</div>
                    <div class="file-info">
                        <div class="file-name">${file.originalName}</div>
                        <div class="file-meta">
                            <span>${formatFileSize(file.size)}</span>
                            <span>•</span>
                            <span>${formatDate(file.time)}</span>
                        </div>
                    </div>
                    <div class="file-actions">
                        <button class="btn-action btn-download" onclick="downloadFile('${file.url}', '${file.originalName}')" title="Скачать">
                            <i class="fas fa-download"></i>
                        </button>
                        <button class="btn-action btn-delete" onclick="deleteFile('${file.name}')" title="Удалить">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        }
        
        // Показываем уведомление об успешной загрузке
        if (currentFiles.length > 0) {
            showToast(`Загружено ${currentFiles.length} файлов`, 'info');
        }
        
    } catch (error) {
        console.error('Ошибка загрузки файлов:', error);
        filesList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon" style="color: #ef233c;">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3>Ошибка загрузки</h3>
                <p>${error.message}</p>
            </div>
        `;
    } finally {
        loading.style.display = 'none';
    }
}

// Скачивание файла
function downloadFile(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    showToast(`Начинается скачивание: ${filename}`, 'success');
}

// Удаление файла
async function deleteFile(filename) {
    showModal('Подтверждение удаления', `Вы уверены, что хотите удалить файл "${filename.split('_').slice(1).join('_') || filename}"?`, [
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
                    await storageRef.child(filename).delete();
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
    const searchTerm = e.target.value.toLowerCase();
    const fileItems = document.querySelectorAll('.file-item');
    
    fileItems.forEach(item => {
        const fileName = item.querySelector('.file-name').textContent.toLowerCase();
        if (fileName.includes(searchTerm)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
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
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = `<p>${body}</p>`;
    
    const modalFooter = document.getElementById('modal-footer');
    modalFooter.innerHTML = '';
    
    buttons.forEach(btn => {
        const button = document.createElement('button');
        button.className = `btn ${btn.class}`;
        button.textContent = btn.text;
        button.addEventListener('click', btn.action);
        modalFooter.appendChild(button);
    });
    
    document.getElementById('modal').style.display = 'flex';
}

function hideModal() {
    document.getElementById('modal').style.display = 'none';
}

function showToast(message, type = 'info') {
    // Создаем элемент тоста
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-icon">
            ${type === 'success' ? '<i class="fas fa-check-circle"></i>' :
              type === 'error' ? '<i class="fas fa-exclamation-circle"></i>' :
              '<i class="fas fa-info-circle"></i>'}
        </div>
        <div class="toast-message">${message}</div>
        <button class="toast-close">&times;</button>
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

// Стили для тостов
const toastStyles = document.createElement('style');
toastStyles.textContent = `
    .toast {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: 12px;
        padding: 16px 20px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 10000;
        transform: translateX(150%);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        min-width: 300px;
        max-width: 400px;
        border-left: 4px solid;
    }
    
    .toast.show {
        transform: translateX(0);
    }
    
    .toast-success {
        border-left-color: #4cc9f0;
    }
    
    .toast-error {
        border-left-color: #ef233c;
    }
    
    .toast-info {
        border-left-color: #4361ee;
    }
    
    .toast-icon {
        font-size: 20px;
    }
    
    .toast-success .toast-icon {
        color: #4cc9f0;
    }
    
    .toast-error .toast-icon {
        color: #ef233c;
    }
    
    .toast-info .toast-icon {
        color: #4361ee;
    }
    
    .toast-message {
        flex: 1;
        font-size: 14px;
        font-weight: 500;
    }
    
    .toast-close {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: #8d99ae;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
    }
    
    .btn {
        padding: 10px 20px;
        border-radius: 8px;
        border: none;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
    }
    
    .btn-secondary {
        background: #edf2f4;
        color: #2b2d42;
    }
    
    .btn-danger {
        background: #ef233c;
        color: white;
    }
    
    .btn-danger:hover {
        background: #d90429;
    }
`;
document.head.appendChild(toastStyles);

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
    loadFiles();
}
