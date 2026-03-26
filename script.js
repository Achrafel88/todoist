document.addEventListener('DOMContentLoaded', () => {
    // --- State & Selectors ---
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentTheme = localStorage.getItem('theme') || 'light';
    
    const body = document.body;
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const todoForm = document.getElementById('todoForm');
    const todoInput = document.getElementById('todoInput');
    const micBtn = document.getElementById('micBtn');
    const pendingList = document.getElementById('pendingList');
    const completedList = document.getElementById('completedList');
    const remainingCount = document.getElementById('remainingCount');
    const clearCompletedBtn = document.getElementById('clearCompleted');
    const currentDateEl = document.getElementById('currentDate');
    const greetingEl = document.getElementById('greeting');
    const pendingBadge = document.getElementById('pendingBadge');
    const completedBadge = document.getElementById('completedBadge');
    
    // --- Speech Recognition Setup ---
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition;
    let isRecording = false;

    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.lang = 'ar-MA';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            todoInput.value = transcript;
            
            setTimeout(() => {
                if (todoInput.value.trim() !== "") {
                    addTask(new Event('submit'));
                }
            }, 500);
        };

        recognition.onend = () => {
            isRecording = false;
            micBtn.classList.remove('recording');
            micBtn.innerHTML = '<i data-lucide="mic"></i>';
            lucide.createIcons();
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            stopRecording();
        };
    } else {
        if (micBtn) micBtn.style.display = 'none';
    }

    // --- Initialization ---
    function init() {
        applyTheme(currentTheme);
        displayDate();
        setGreeting();
        renderTasks();
        setupEventListeners();
        lucide.createIcons();
    }

    // --- Theme Management ---
    function applyTheme(theme) {
        body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        themeIcon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
        lucide.createIcons();
    }

    function toggleTheme() {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(currentTheme);
    }

    // --- Core Logic ---
    function saveToLocalStorage() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function setGreeting() {
        const hour = new Date().getHours();
        if (hour < 12) greetingEl.textContent = "🌅 Bonjour !";
        else if (hour < 18) greetingEl.textContent = "☀️ Bon après-midi !";
        else greetingEl.textContent = "🌙 Bonsoir !";
    }

    function renderTasks() {
        pendingList.innerHTML = '';
        completedList.innerHTML = '';

        const pendingTasks = tasks.filter(t => !t.completed);
        const completedTasks = tasks.filter(t => t.completed);

        if (pendingTasks.length === 0) {
            document.getElementById('pendingEmpty').classList.add('visible');
        } else {
            document.getElementById('pendingEmpty').classList.remove('visible');
            pendingTasks.forEach(task => {
                pendingList.appendChild(createTaskElement(task));
            });
        }

        if (completedTasks.length === 0) {
            document.getElementById('completedEmpty').classList.add('visible');
        } else {
            document.getElementById('completedEmpty').classList.remove('visible');
            completedTasks.forEach(task => {
                completedList.appendChild(createTaskElement(task));
            });
        }

        updateStats(pendingTasks.length, completedTasks.length);
        lucide.createIcons();
    }

    function createTaskElement(task) {
        const div = document.createElement('div');
        div.className = `task-item ${task.completed ? 'completed' : ''}`;
        div.setAttribute('data-id', task.id);

        div.innerHTML = `
            <div class="checkbox-wrapper" onclick="toggleTask('${task.id}')">
                ${task.completed ? '<i data-lucide="check" style="width:14px; color:white;"></i>' : ''}
            </div>
            <span class="task-text" ondblclick="editTask('${task.id}')">${task.text}</span>
            <div class="task-actions">
                <button class="action-btn" onclick="editTask('${task.id}')">
                    <i data-lucide="edit-3" style="width:14px;"></i>
                </button>
                <button class="action-btn btn-delete" onclick="deleteTask('${task.id}')">
                    <i data-lucide="trash-2" style="width:14px;"></i>
                </button>
            </div>
        `;

        return div;
    }

    function addTask(e) {
        if (e) e.preventDefault();
        const text = todoInput.value.trim();
        if (text === '') return;

        tasks.unshift({
            id: Date.now().toString(),
            text: text,
            completed: false
        });

        saveToLocalStorage();
        renderTasks();
        todoInput.value = '';
    }

    function startRecording() {
        if (!recognition) return;
        isRecording = true;
        micBtn.classList.add('recording');
        micBtn.innerHTML = '<i data-lucide="mic-off"></i>';
        lucide.createIcons();
        recognition.start();
    }

    function stopRecording() {
        if (!recognition) return;
        isRecording = false;
        recognition.stop();
    }

    window.toggleTask = function(id) {
        tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
        saveToLocalStorage();
        renderTasks();
    };

    window.deleteTask = function(id) {
        const el = document.querySelector(`[data-id="${id}"]`);
        if (!el) return;
        el.classList.add('removing');
        el.addEventListener('animationend', () => {
            tasks = tasks.filter(t => t.id !== id);
            saveToLocalStorage();
            renderTasks();
        }, { once: true });
    };

    window.editTask = function(id) {
        const task = tasks.find(t => t.id === id);
        const newText = prompt("Modifier la tâche :", task.text);
        if (newText && newText.trim()) {
            tasks = tasks.map(t => t.id === id ? { ...t, text: newText.trim() } : t);
            saveToLocalStorage();
            renderTasks();
        }
    };

    function clearCompleted() {
        if (confirm("Supprimer les tâches terminées ?")) {
            tasks = tasks.filter(t => !t.completed);
            saveToLocalStorage();
            renderTasks();
        }
    }

    function updateStats(pLen, cLen) {
        remainingCount.textContent = pLen;
        pendingBadge.textContent = pLen;
        completedBadge.textContent = cLen;
        clearCompletedBtn.style.opacity = cLen > 0 ? '1' : '0';
        clearCompletedBtn.style.pointerEvents = cLen > 0 ? 'auto' : 'none';
    }

    function displayDate() {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        currentDateEl.textContent = new Date().toLocaleDateString('fr-FR', options);
    }

    function setupEventListeners() {
        todoForm.addEventListener('submit', addTask);
        themeToggle.addEventListener('click', toggleTheme);
        clearCompletedBtn.addEventListener('click', clearCompleted);
        if (micBtn) {
            micBtn.addEventListener('click', () => {
                if (isRecording) stopRecording();
                else startRecording();
            });
        }
    }

    init();
});
