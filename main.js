const taskInput = document.getElementById("taskInput"); 
const addTaskButton = document.getElementById("addTaskButton");
const taskList = document.getElementById("taskList");
var savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];

async function getRemoteTask() {
  const data = await fetch('https://jsonplaceholder.typicode.com/todos');
  const tasky = await data.json();
  savedTasks = tasky;
  loadTasks();
}

getRemoteTask();

function loadTasks() {
  savedTasks.forEach((task) => {
    const listItem = createTaskElement(task);
    taskList.appendChild(listItem);
  });
}

function saveTasks() {
  const tasks = Array.from(taskList.children).map(
    (listItem) => listItem.querySelector("span").textContent
  );
  localStorage.setItem("tasks", JSON.stringify(savedTasks));
}

function createTaskElement(taskText) {
  const listItem = document.createElement("li");
  listItem.setAttribute("data-id", taskText.id);
  listItem.innerHTML = 
    `<span>${taskText.title}</span>
    <div class="actions">
      <button class="edit">Edit</button>
      <button class="delete">Delete</button>
    </div>`;

  const editButton = listItem.querySelector(".edit");
  const deleteButton = listItem.querySelector(".delete");

  editButton.addEventListener("click", () => editTask(taskText));
  deleteButton.addEventListener("click", () => deleteTask(taskText));

  return listItem;
}

function addTask() {
  const taskText = taskInput.value;
  if (taskText === "") {
    alert("Please enter a task.");
    return;
  }


  const taskObject = { id: Date.now(), title: taskText };
  
  const listItem = createTaskElement(taskObject);
  taskList.appendChild(listItem);

 
  savedTasks.push(taskObject);

  taskInput.value = "";
  saveTasks();
}

function editTask(taskText) {
  const newTaskTitle = prompt("Edit task:", taskText.title);
  if (!newTaskTitle || newTaskTitle.trim() === "") {
    alert("Task cannot be empty.");
    return;
  }

  fetch(`https://jsonplaceholder.typicode.com/todos/${taskText.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title: newTaskTitle }),
  })
  .then((response) => {
    return response.json();
  })
  .then((taskText) => {
    const taskIndex = savedTasks.findIndex((task) => task.id === taskText.id);
    if (taskIndex > -1) {
      savedTasks[taskIndex].title = taskText.title;
    }

    const taskElement = document.querySelector(`[data-id="${taskText.id}"]`);
    if (taskElement) {
      taskElement.querySelector("span").textContent = taskText.title;
    }

    localStorage.setItem("tasks", JSON.stringify(savedTasks));
  })
}

function deleteTask(taskText) {
  savedTasks = savedTasks.filter((task) => task.id !== taskText.id);
  fetch(`https://jsonplaceholder.typicode.com/todos/${taskText.id}`, {
    method: "DELETE",
  });
  const taskElement = document.querySelector(`[data-id="${taskText.id}"]`);
  if (taskElement) {
    taskElement.remove();
  }
  localStorage.setItem("tasks", JSON.stringify(savedTasks));
}

addTaskButton.addEventListener("click", addTask);

taskInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    addTask();
  }
});
