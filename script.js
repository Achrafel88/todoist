document.addEventListener('DOMContentLoaded', () => {
    // --- State & Selectors ---
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    const todoForm = document.getElementById('todoForm');
    const todoInput = document.getElementById('todoInput');
    const pendingList = document.getElementById('pendingList');
    const completedList = document.getElementById('completedList');
    const remainingCount = document.getElementById('remainingCount');
    const clearCompletedBtn = document.getElementById('clearCompleted');
    const currentDateEl = document.getElementById('currentDate');
    const pendingBadge = document.getElementById('pendingBadge');
    const completedBadge = document.getElementById('completedBadge');
    
    // --- Initialization ---
    function init() {
        displayDate();
        renderTasks();
        setupEventListeners();
        lucide.createIcons();
    }

    // --- Core Functions ---
    function saveToLocalStorage() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function renderTasks() {
        pendingList.innerHTML = '';
        completedList.innerHTML = '';

        const pendingTasks = tasks.filter(t => !t.completed);
        const completedTasks = tasks.filter(t => t.completed);

        // Render Pending
        if (pendingTasks.length === 0) {
            document.getElementById('pendingEmpty').classList.add('visible');
        } else {
            document.getElementById('pendingEmpty').classList.remove('visible');
            pendingTasks.forEach(task => {
                pendingList.appendChild(createTaskElement(task));
            });
        }

        // Render Completed
        if (completedTasks.length === 0) {
            document.getElementById('completedEmpty').classList.add('visible');
        } else {
            document.getElementById('completedEmpty').classList.remove('visible');
            completedTasks.forEach(task => {
                completedList.appendChild(createTaskElement(task));
            });
        }

        // Update Stats
        updateStats(pendingTasks.length, completedTasks.length);
        
        // Refresh icons for new elements
        lucide.createIcons();
    }

    function createTaskElement(task) {
        const div = document.createElement('div');
        div.className = `task-item ${task.completed ? 'completed' : ''}`;
        div.setAttribute('data-id', task.id);

        div.innerHTML = `
            <div class="task-content">
                <div class="checkbox-wrapper" onclick="toggleTask('${task.id}')">
                    <div class="custom-checkbox">
                        ${task.completed ? '<i data-lucide="check" style="width:14px; color:white;"></i>' : ''}
                    </div>
                </div>
                <span class="task-text" ondblclick="editTask('${task.id}')">${task.text}</span>
            </div>
            <div class="task-actions">
                <button class="action-btn btn-edit" onclick="editTask('${task.id}')" title="Modifier">
                    <i data-lucide="edit-3" style="width:16px;"></i>
                </button>
                <button class="action-btn btn-delete" onclick="deleteTask('${task.id}')" title="Supprimer">
                    <i data-lucide="trash-2" style="width:16px;"></i>
                </button>
            </div>
        `;

        return div;
    }

    function addTask(e) {
        e.preventDefault();
        const text = todoInput.value.trim();
        
        if (text === '') return;

        const newTask = {
            id: Date.now().toString(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        tasks.unshift(newTask);
        saveToLocalStorage();
        renderTasks();
        todoInput.value = '';
        todoInput.focus();
    }

    window.toggleTask = function(id) {
        tasks = tasks.map(task => {
            if (task.id === id) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        saveToLocalStorage();
        renderTasks();
    };

    window.deleteTask = function(id) {
        const element = document.querySelector(`[data-id="${id}"]`);
        element.classList.add('removing');
        
        element.addEventListener('animationend', () => {
            tasks = tasks.filter(task => task.id !== id);
            saveToLocalStorage();
            renderTasks();
        }, { once: true });
    };

    window.editTask = function(id) {
        const task = tasks.find(t => t.id === id);
        const newText = prompt("Modifier la tâche :", task.text);
        
        if (newText !== null && newText.trim() !== '') {
            tasks = tasks.map(t => {
                if (t.id === id) {
                    return { ...t, text: newText.trim() };
                }
                return t;
            });
            saveToLocalStorage();
            renderTasks();
        }
    };

    function clearCompleted() {
        if (confirm("Voulez-vous supprimer toutes les tâches terminées ?")) {
            tasks = tasks.filter(t => !t.completed);
            saveToLocalStorage();
            renderTasks();
        }
    }

    function updateStats(pendingLen, completedLen) {
        remainingCount.textContent = pendingLen;
        pendingBadge.textContent = pendingLen;
        completedBadge.textContent = completedLen;
        
        // Hide/Show Clear Completed button
        if (completedLen > 0) {
            clearCompletedBtn.style.visibility = 'visible';
            clearCompletedBtn.style.opacity = '1';
        } else {
            clearCompletedBtn.style.visibility = 'hidden';
            clearCompletedBtn.style.opacity = '0';
        }
    }

    function displayDate() {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const today = new Date();
        const formattedDate = today.toLocaleDateString('fr-FR', options);
        currentDateEl.textContent = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    }

    function setupEventListeners() {
        todoForm.addEventListener('submit', addTask);
        clearCompletedBtn.addEventListener('click', clearCompleted);
    }

    init();
});
