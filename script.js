document.addEventListener("DOMContentLoaded", () => {
    const themeToggleBtn = document.getElementById("themeToggleBtn");
    const nameInput = document.getElementById("nameInput");
    const saveNameBtn = document.getElementById("saveNameBtn");
    const greetingText = document.getElementById("greetingText");
    const taskInput = document.getElementById("taskInput");
    const categorySelect = document.getElementById("categorySelect");
    const prioritySelect = document.getElementById("prioritySelect");
    const dueDateInput = document.getElementById("dueDateInput");
    const addTaskBtn = document.getElementById("addTaskBtn");
    const taskList = document.getElementById("taskList");
    const completedCount = document.getElementById("completedCount");
    const progressBar = document.getElementById("progressBar");
    const resetDataBtn = document.getElementById("resetDataBtn");
    const filterBtns = document.querySelectorAll(".filter-btn");
    const searchInput = document.getElementById("searchInput");
    const exportJsonBtn = document.getElementById("exportJsonBtn");
    const exportCsvBtn = document.getElementById("exportCsvBtn");
    const importFile = document.getElementById("importFile");

    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let currentFilter = "all";
    let searchQuery = "";

    if (localStorage.getItem("darkMode") === "enabled") document.body.classList.add("dark-mode");
    if (localStorage.getItem("userName")) displayGreeting(localStorage.getItem("userName"));

    function playCompleteSound() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = "sine";
            osc.frequency.setValueAtTime(587.33, ctx.currentTime);
            osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.3);
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
        } catch (e) {}
    }

    themeToggleBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        localStorage.setItem("darkMode", document.body.classList.contains("dark-mode") ? "enabled" : "disabled");
    });

    saveNameBtn.addEventListener("click", () => {
        const name = nameInput.value.trim();
        if (name) {
            localStorage.setItem("userName", name);
            displayGreeting(name);
            nameInput.value = "";
        }
    });

    function displayGreeting(name) {
        greetingText.textContent = `Welcome back, ${name} !`;
        greetingText.classList.remove("hidden");
    }

    addTaskBtn.addEventListener("click", () => {
        const text = taskInput.value.trim();
        if (text) {
            tasks.push({ 
                text, 
                category: categorySelect.value, 
                priority: prioritySelect.value, 
                dueDate: dueDateInput.value, 
                completed: false 
            });
            taskInput.value = "";
            dueDateInput.value = "";
            saveAndRender();
        }
    });

    searchInput.addEventListener("input", (e) => {
        searchQuery = e.target.value.toLowerCase();
        renderTasks();
    });

    function renderTasks() {
        taskList.innerHTML = "";
        let completed = 0;
        const today = new Date().toISOString().split("T")[0];

        tasks.forEach((task, index) => {
            if (task.completed) completed++;
            
            if (currentFilter === "active" && task.completed) return;
            if (currentFilter === "completed" && !task.completed) return;

            if (searchQuery && !task.text.toLowerCase().includes(searchQuery) && !task.category.toLowerCase().includes(searchQuery)) {
                return;
            }

            const li = document.createElement("li");
            li.setAttribute("draggable", "true");
            li.dataset.index = index;
            if (task.completed) li.classList.add("completed");

            let dueText = "";
            if (task.dueDate) {
                const isOverdue = task.dueDate < today && !task.completed;
                dueText = `<span class="due-badge ${isOverdue ? '' : 'ok'}">${isOverdue ? 'Overdue: ' : 'Due: '}${task.dueDate}</span>`;
            }

            const categoryClass = `badge-${task.category.toLowerCase()}`;

            li.innerHTML = `
                <div class="task-info">
                    <div>
                        <strong>${task.text}</strong>
                        <span class="badge ${categoryClass}">${task.category}</span>
                    </div>
                    <span class="priority-tag">${task.priority}</span>
                    ${dueText}
                </div>
                <div class="task-actions">
                    <button onclick="toggleTask(${index})">✓</button>
                    <button onclick="editTask(${index})">✎</button>
                    <button onclick="deleteTask(${index})">✕</button>
                </div>
            `;

            // Drag and Drop listeners
            li.addEventListener("dragstart", (e) => {
                li.classList.add("dragging");
                e.dataTransfer.setData("text/plain", index);
            });

            li.addEventListener("dragend", () => {
                li.classList.remove("dragging");
            });

            li.addEventListener("dragover", (e) => {
                e.preventDefault();
            });

            li.addEventListener("drop", (e) => {
                e.preventDefault();
                const draggedIndex = e.dataTransfer.getData("text/plain");
                const targetIndex = li.dataset.index;

                if (draggedIndex !== undefined && targetIndex !== undefined && draggedIndex !== targetIndex) {
                    const draggedItem = tasks.splice(draggedIndex, 1)[0];
                    tasks.splice(targetIndex, 0, draggedItem);
                    saveAndRender();
                }
            });

            taskList.appendChild(li);
        });

        completedCount.textContent = `Completed Tasks: ${completed}`;
        progressBar.style.width = tasks.length ? `${(completed / tasks.length) * 100}%` : "0%";
    }

    window.toggleTask = (index) => {
        tasks[index].completed = !tasks[index].completed;
        if (tasks[index].completed) playCompleteSound();
        saveAndRender();
    };

    window.editTask = (index) => {
        const newText = prompt("Edit your task:", tasks[index].text);
        if (newText !== null && newText.trim() !== "") {
            tasks[index].text = newText.trim();
            saveAndRender();
        }
    };

    window.deleteTask = (index) => {
        tasks.splice(index, 1);
        saveAndRender();
    };

    filterBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            filterBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });

    exportJsonBtn.addEventListener("click", () => {
        downloadFile("tasks.json", JSON.stringify(tasks, null, 2), "application/json");
    });

    exportCsvBtn.addEventListener("click", () => {
        let csv = "Text,Category,Priority,DueDate,Completed\n";
        tasks.forEach(t => {
            csv += `"${t.text}","${t.category}","${t.priority}","${t.dueDate || ''}",${t.completed}\n`;
        });
        downloadFile("tasks.csv", csv, "text/csv");
    });

    importFile.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                tasks = JSON.parse(event.target.result);
                saveAndRender();
            } catch (err) {
                alert("Invalid JSON file");
            }
        };
        reader.readAsText(file);
    });

    function downloadFile(filename, content, type) {
        const blob = new Blob([content], { type });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
    }

    resetDataBtn.addEventListener("click", () => {
        localStorage.clear();
        tasks = [];
        document.body.classList.remove("dark-mode");
        greetingText.classList.add("hidden");
        renderTasks();
    });

    function saveAndRender() {
        localStorage.setItem("tasks", JSON.stringify(tasks));
        renderTasks();
    }

    renderTasks();
});
