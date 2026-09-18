let count = 0;
let tasks = [];

// Load stored data on page load
window.onload = function() {
    // Load Name
    let savedName = localStorage.getItem("user_name");
    if (savedName) {
        displayGreeting(savedName);
    }

    // Load Tasks & Counter from LocalStorage
    let savedTasks = localStorage.getItem("user_tasks");
    let savedCount = localStorage.getItem("task_count");

    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }
    if (savedCount) {
        count = parseInt(savedCount);
    }

    updateUI();
};

function saveName() {
    var name = document.getElementById("userName").value;
    if (name.trim() !== "") {
        localStorage.setItem("user_name", name);
        displayGreeting(name);
    }
}

function displayGreeting(name) {
    var greetingText = document.getElementById("greeting");
    greetingText.innerText = "Welcome back, " + name + "!";
    greetingText.style.color = "#27ae60";
}

function toggleTheme() {
    document.body.classList.toggle("dark-theme");
}

function addTask() {
    let taskInput = document.getElementById("taskInput");
    let taskText = taskInput.value.trim();

    if (taskText !== "") {
        tasks.push(taskText);
        taskInput.value = "";
        saveToLocalStorage();
        updateUI();
    }
}

function deleteTask(index) {
    tasks.splice(index, 1);
    count++; // Increment completed tasks count when deleted
    saveToLocalStorage();
    updateUI();
}

function saveToLocalStorage() {
    localStorage.setItem("user_tasks", JSON.stringify(tasks));
    localStorage.setItem("task_count", count);
}

function updateUI() {
    document.getElementById("count").innerText = count;

    let taskList = document.getElementById("taskList");
    taskList.innerHTML = "";

    tasks.forEach((task, index) => {
        let li = document.createElement("li");
        li.innerHTML = `
            <span>${task}</span>
            <button class="delete-btn" onclick="deleteTask(${index})">Done</button>
        `;
        taskList.appendChild(li);
    });
}
