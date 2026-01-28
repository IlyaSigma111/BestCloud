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
firebase.initializeApp(firebaseConfig);
const storage = firebase.storage();
const storageRef = storage.ref();

// ====================
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ====================
const CORRECT_PASSWORD = "JojoTop1";

// ====================
// АВТОРИЗАЦИЯ
// ====================
function checkPassword() {
    const input = document.getElementById('password-input').value;
    const errorElement = document.getElementById('error-message');
    
    if (input === CORRECT_PASSWORD) {
        errorElement.textContent = "✅ Успешный вход!";
        errorElement.style.color = "#4CAF50";
        
        setTimeout(() => {
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('cloud-screen').style.display = 'flex';
            loadFiles();
        }, 500);
    } else {
        errorElement.textContent = "❌ Неверный пароль!";
        errorElement.style.color = "#d50000";
        document.getElementById('password-input').value = '';
        document.getElementById('password-input').focus();
    }
}

function logout() {
    if (confirm("Выйти из GoydaCloud?")) {
        document.getElementById('cloud-screen').style.display = 'none';
        document.getElementById('login-screen').style.display = 'flex';
        document.getElementById('password-input').value = '';
        document.getElementById('error-message').textContent = '';
    }
}

// Enter для входа
document.getElementById('password-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkPassword();
});

// ====================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ====================
function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const icons = {
        pdf: '📕', doc: '📘', docx: '📘', txt: '📄',
        jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️',
        mp4: '🎬', avi: '🎬', mov: '🎬',
        mp3: '🎵', wav: '🎵',
        zip: '📦', rar: '📦',
        exe: '⚙️', msi: '⚙️',
        xls: '📊', xlsx: '📊',
        html: '🌐', css: '🎨', js: '📜',
        default: '📁'
    };
    return icons[ext] || icons.default;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Б';
    const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
}

// ====================
// ЗАГРУЗКА ФАЙЛОВ
// ====================
document.getElementById('file-input').addEventListener('change', function(e) {
    const files = e.target.files;
    const btn = document.getElementById('upload-btn');
    const info = document.getElementById('selected-files');
    
    if (files.length > 0) {
        btn.disabled = false;
        info.textContent = `Выбрано: ${files.length} файл(ов)`;
    } else {
        btn.disabled = true;
        info.textContent = 'Файлы не выбраны';
    }
});

function uploadFile() {
    const files = document.getElementById('file-input').files;
    if (files.length === 0) return;
    
    const progressContainer = document.getElementById('upload-progress');
    progressContainer.innerHTML = '';
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = file.name;
        const fileRef = storageRef.child(fileName);
        
        // Проверка на существующий файл
        const uploadTask = fileRef.put(file);
        
        // Создаем прогресс-бар
        const progressDiv = document.createElement('div');
        progressDiv.className = 'file-upload';
        progressDiv.innerHTML = `
            <p>${fileName}</p>
            <div class="progress-bar">
                <div class="progress-fill" id="progress-${i}">0%</div>
            </div>
        `;
        progressContainer.appendChild(progressDiv);
        
        // Отслеживание прогресса
        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                const progressFill = document.getElementById(`progress-${i}`);
                progressFill.style.width = progress + '%';
                progressFill.textContent = Math.round(progress) + '%';
            },
            (error) => {
                alert(`Ошибка загрузки ${fileName}: ${error.message}`);
            },
            () => {
                // Успешная загрузка
                document.getElementById(`progress-${i}`).style.background = '#4CAF50';
                setTimeout(() => {
                    loadFiles();
                }, 1000);
            }
        );
    }
    
    // Сброс формы
    setTimeout(() => {
        document.getElementById('file-input').value = '';
        document.getElementById('upload-btn').disabled = true;
        document.getElementById('selected-files').textContent = 'Файлы не выбраны';
    }, 3000);
}

// ====================
// ЗАГРУЗКА СПИСКА ФАЙЛОВ
// ====================
async function loadFiles() {
    const filesList = document.getElementById('files-list');
    const loading = document.getElementById('loading');
    
    filesList.innerHTML = '';
    loading.style.display = 'block';
    
    try {
        const listResult = await storageRef.listAll();
        
        if (listResult.items.length === 0) {
            filesList.innerHTML = `
                <div class="empty-state">
                    <p>📭 Файлов пока нет</p>
                    <small>Загрузите первый файл, чтобы начать</small>
                </div>
            `;
            loading.style.display = 'none';
            return;
        }
        
        // Загружаем информацию о каждом файле
        const filesPromises = listResult.items.map(async (itemRef) => {
            const metadata = await itemRef.getMetadata();
            const downloadURL = await itemRef.getDownloadURL();
            return {
                name: itemRef.name,
                size: metadata.size,
                time: metadata.timeCreated,
                url: downloadURL
            };
        });
        
        const files = await Promise.all(filesPromises);
        
        // Сортируем по дате (новые сверху)
        files.sort((a, b) => new Date(b.time) - new Date(a.time));
        
        // Отображаем файлы
        filesList.innerHTML = files.map(file => `
            <div class="file-item">
                <div class="file-icon">${getFileIcon(file.name)}</div>
                <div class="file-info">
                    <div class="file-name">${file.name}</div>
                    <div class="file-meta">
                        ${formatFileSize(file.size)} • ${new Date(file.time).toLocaleDateString('ru-RU')}
                    </div>
                </div>
                <div class="file-actions">
                    <button onclick="downloadFile('${file.url}', '${file.name}')" 
                            class="action-btn" title="Скачать">⤵️</button>
                    <button onclick="deleteFile('${file.name}')" 
                            class="action-btn" title="Удалить" style="color: #d50000;">🗑️</button>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        filesList.innerHTML = `
            <div class="empty-state">
                <p>❌ Ошибка загрузки</p>
                <small>${error.message}</small>
            </div>
        `;
    } finally {
        loading.style.display = 'none';
    }
}

// ====================
// ОПЕРАЦИИ С ФАЙЛАМИ
// ====================
function downloadFile(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

async function deleteFile(filename) {
    if (!confirm(`Удалить файл "${filename}"?`)) return;
    
    try {
        await storageRef.child(filename).delete();
        loadFiles();
    } catch (error) {
        alert(`Ошибка удаления: ${error.message}`);
    }
}

// ====================
// ПЕРЕТАСКИВАНИЕ ФАЙЛОВ
// ====================
const uploadArea = document.querySelector('.upload-area');
if (uploadArea) {
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#1a237e';
        uploadArea.style.background = '#f0f4ff';
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = '#ccc';
        uploadArea.style.background = '';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#ccc';
        uploadArea.style.background = '';
        
        const files = e.dataTransfer.files;
        const input = document.getElementById('file-input');
        
        // Устанавливаем файлы в input
        const dataTransfer = new DataTransfer();
        for (let file of files) {
            dataTransfer.items.add(file);
        }
        input.files = dataTransfer.files;
        
        // Запускаем событие change
        const event = new Event('change');
        input.dispatchEvent(event);
    });
}

// Автоматическое обновление каждые 30 секунд
setInterval(() => {
    if (document.getElementById('cloud-screen').style.display !== 'none') {
        loadFiles();
    }
}, 30000);
