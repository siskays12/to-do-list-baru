
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskDate = document.getElementById("taskDate");
const taskList = document.getElementById("taskList");
const filterTasks = document.getElementById("filterTasks");

const totalTasks = document.getElementById("totalTasks");
const pendingTasks = document.getElementById("pendingTasks");
const completedTasks = document.getElementById("completedTasks");

let tasks = [];

try {
    const savedTasks = JSON.parse(
        localStorage.getItem("taskflow_tasks") || "[]"
    );

    if (Array.isArray(savedTasks)) {
        tasks = savedTasks.filter(task =>
            task &&
            typeof task.id === "string" &&
            typeof task.title === "string" &&
            typeof task.completed === "boolean"
        );
    }
} catch {
    tasks = [];
}

function saveTasks() {
    localStorage.setItem("taskflow_tasks", JSON.stringify(tasks));
}

function updateSummary() {
    totalTasks.textContent = tasks.length;

    pendingTasks.textContent = tasks.filter(
        task => !task.completed
    ).length;

    completedTasks.textContent = tasks.filter(
        task => task.completed
    ).length;
}

function renderTasks() {
    taskList.replaceChildren();

    const filter = filterTasks.value;

    const filteredTasks = tasks.filter(task => {
        if (filter === "pending") return !task.completed;
        if (filter === "completed") return task.completed;
        return true;
    });

    updateSummary();

    if (filteredTasks.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty-state";

        empty.textContent = tasks.length === 0
            ? "Belum ada tugas. Tambahkan tugas pertamamu!"
            : "Tidak ada tugas pada kategori ini.";

        taskList.appendChild(empty);
        return;
    }

    filteredTasks.forEach(task => {
        const item = document.createElement("div");
        item.className = "task-item";

        if (task.completed) {
            item.classList.add("completed");
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-check";
        checkbox.checked = task.completed;
        checkbox.setAttribute("aria-label", "Tandai tugas selesai");

        checkbox.addEventListener("change", () => {
            task.completed = checkbox.checked;
            saveTasks();
            renderTasks();
        });

        const content = document.createElement("div");
        content.className = "task-content";

        const title = document.createElement("h3");
        title.textContent = task.title;
        content.appendChild(title);

        const date = document.createElement("p");
        date.textContent = task.dueDate
            ? "Tenggat: " + task.dueDate
            : "Tidak ada tenggat waktu";

        content.appendChild(date);

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-button";
        deleteButton.textContent = "delete";

        deleteButton.addEventListener("click", () => {
            tasks = tasks.filter(item => item.id !== task.id);
            saveTasks();
            renderTasks();
        });

        item.append(checkbox, content, deleteButton);
        taskList.appendChild(item);
    });
}

taskForm.addEventListener("submit", event => {
    event.preventDefault();

    const title = taskInput.value.trim();

    if (!title) {
        taskInput.focus();
        return;
    }

    tasks.push({
        id: crypto.randomUUID(),
        title: title,
        dueDate: taskDate.value,
        completed: false
    });

    saveTasks();
    taskForm.reset();
    taskInput.focus();
    renderTasks();
});

filterTasks.addEventListener("change", renderTasks);

renderTasks();
