document.addEventListener("DOMContentLoaded", () => {
    const themeToggleBtn = document.getElementById("themeToggleBtn");
    const nameInput = document.getElementById("nameInput");
    const saveNameBtn = document.getElementById("saveNameBtn");
    const greetingText = document.getElementById("greetingText");
    const taskInput = document.getElementById("taskInput");
    const categorySelect = document.getElementById("categorySelect");
    const prioritySelect = document.getElementById("prioritySelect");
    const addTaskBtn = document.getElementById("addTaskBtn");
    const taskList = document.getElementById("taskList");
    const completedCount = document.getElementById("completedCount");
    const progressBar = document.getElementById("progressBar");
    const resetDataBtn = document.getElementById("resetDataBtn");
    const filterBtns = document.querySelectorAll(".filter-btn");

    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let currentFilter = "all";

    // Load saved settings
    if (localStorage.getItem("darkMode") === "enabled") document.body.classList.add("dark-mode");
    if (localStorage.getItem("userName")) displayGreeting(localStorage.getItem("userName"));

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
            tasks.push({ text, category: categorySelect.value, priority: prioritySelect.value, completed: false });
            taskInput.value = "";
            saveAndRender();
        }
    });

    function renderTasks() {
        taskList.innerHTML = "";
        let completed = 0;

        tasks.forEach((task, index) => {
            if (task.completed) completed++;
            
            if (currentFilter === "active" && task.completed) return;
            if (currentFilter === "completed" && !task.completed) return;

            const li = document.createElement("li");
            if (task.completed) li.classList.add("completed");
            li.innerHTML = `
                <span>${task.text} <small>(${task.category} - ${task.priority})</small></span>
                <div>
                    <button onclick="toggleTask(${index})">✓</button>
                    <button onclick="deleteTask(${index})">✕</button>
                </div>
            `;
            taskList.appendChild(li);
        });

        completedCount.textContent = `Completed Tasks: ${completed}`;
        progressBar.style.width = tasks.length ? `${(completed / tasks.length) * 100}%` : "0%";
    }

    window.toggleTask = (index) => {
        tasks[index].completed = !tasks[index].completed;
        saveAndRender();
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
