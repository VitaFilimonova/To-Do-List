// Find elements
const input = document.querySelector('input');
const listAllTasks = document.querySelector('#list');
const listAllDoneTasks = document.querySelector('#listDone');
const addButton = document.querySelector('#add-button')
const filter = document.querySelector('#filter-button');
const blockFilters = document.querySelector('#filters')
const emptyList = document.querySelector("#listEmpty");
const lastElement = document.querySelector('#deleteLastElement');
const firstElement = document.querySelector('#deleteFirstElement');
const evenElements = document.querySelector('#selectEvenElement');
const oddElements = document.querySelector('#selectOddElement');

// Arrays with tasks for LocaleStorage
let todo = [];
let completedTodo = [];

// Arrays for even and odd elements
let even = [];
let odd = [];

// Add handlers
addButton.addEventListener('click', addTask)
filter.addEventListener('click', filterTask);

listAllTasks.addEventListener('click', doneTask);
listAllTasks.addEventListener('click', changeTask);
listAllTasks.addEventListener('click', deleteTask);
listAllDoneTasks.addEventListener('click', deleteTask);

oddElements.addEventListener('click', selectOddElements);
evenElements.addEventListener('click', selectEvenElements);

firstElement.addEventListener('click', deleteFirstElement);
lastElement.addEventListener('click', deleteLastElement);

// Check tasks from localStorage
if (localStorage.getItem('todo')) {
    todo = JSON.parse(localStorage.getItem('todo'))
    todo.forEach((task) => renderTasks(task));
    nonCompletedTasks();
}

if (localStorage.getItem('completedTodo')) {
    completedTodo = JSON.parse(localStorage.getItem('completedTodo'))
    completedTodo.forEach((task) => renderDoneTasks(task));
    completedTasks();
}

checkEmptyList()

// Functions
// Add button
function addTask() {
    const inputText = input.value;

    // Describe the task as an object
    const newTask = {
        id: Date.now(),
        text: inputText,
    };

    const inputTextToHTML = `
            <li id ='${newTask.id}'class="list__item"> 
                <div id="text">${newTask.text}</div>
                <div class="list__buttons">
                    <button class="list__button list__button_done" data-action="done">
                        <img src="img/done.svg" alt="done">
                    </button>
                    <button class="list__button list__button_change" data-action="change">
                        <img src="img/change.svg" alt="change">
                    </button>
                    <button class="list__button list__button_delete" data-action="delete">
                        <img src="img/delete.svg" alt="delete">
                    </button>
                </div>
            </li>`;

    // Check valid value
    if (input.value ==='' || (input.value.length > 30 && input.value.trim().indexOf(' ') === -1) ) {
        alert('Слово слишком длинное (длина слова не может быть более 30 символов) или строка пустая. Попробуйте ввести задачу еще раз.');
    } else {
        listAllTasks.insertAdjacentHTML('afterbegin', inputTextToHTML);
        todo.unshift(newTask);

        // Clear input and focus cursor
        input.value = '';
        input.focus();

        // Save task to localStorage
        saveToLocalStorage();
    }

    // Check active buttons
    activeButtonEven();
    activeButtonOdd();

    checkEmptyList();

    // Update the number of non completed tasks
    nonCompletedTasks();
}

// Filter button
function filterTask() {
    blockFilters.classList.toggle('filters__active');
}

// Done task
function doneTask(event) {
    if (event.target.getAttribute('data-action') === 'done') {
        const parentNode = event.target.closest(".list__item");

        // Define task id
        const id = Number(parentNode.id);

        // Delete task from to-do list and move to completed
        const task = todo.find((task) => task.id === id);
        completedTodo.push(task);

        const taskText = event.target.closest(".list__item").textContent
        const taskDoneToHTML = `
               <li id='${id}' class="list__item list__item_done"> ${taskText}
                    <div class="list__buttons">
                        <button class="list__button list__button_delete" data-action="delete">
                            <img src="img/delete.svg" alt="delete">
                        </button>
                    </div>
                </li>`;
        listAllDoneTasks.insertAdjacentHTML('beforeend', taskDoneToHTML);

        const index = todo.findIndex(task => task.id === id);
        todo.splice(index, 1);

        // Save task to localStorage
        saveToLocalStorage();
        saveToCompletedLocalStorage();

        // Delete the task from markup
        parentNode.remove()

        // Check active buttons
        activeButtonEven();
        activeButtonOdd();

        checkEmptyList();

        // Update numbers of non completed and completed tasks
        completedTasks();
        nonCompletedTasks();
    }
}

// Change task
function changeTask(event) {
    if (event.target.getAttribute('data-action') === 'change') {
        const parentNode = event.target.closest(".list__item");

        // Define task id
        const id = Number(parentNode.id);

        const index = todo.findIndex((task) => task.id === id);

        // Change task text
        const newText = prompt('Введите новый текст', '');

        // Check valid task text
        if (newText !== null && newText !== '' && newText.length<30) {
            todo[index].text = newText;
            const textChange = parentNode.querySelector('#text');
            textChange.textContent = '';
            textChange.insertAdjacentText('afterbegin', newText);

            // Save task to localStorage
            saveToLocalStorage();
        } else {
            alert('Слово слишком длинное (длина слова не может быть более 30 символов) или строка пустая. Попробуйте ввести задачу еще раз.')
        }
    }
}

// Delete task
function deleteTask(event) {
    if (event.target.getAttribute('data-action') === 'delete') {
        const parentNode = event.target.closest(".list__item");

        // Define task id
        const id = Number(parentNode.id);

        const index = todo.findIndex(task => task.id === id);

        // Check type task and delete from localStorage
        if (index !== -1) {
            todo.splice(index, 1);
            saveToLocalStorage();
        } else {
            const indexCompleted = completedTodo.findIndex(elem => elem.id === id);
            completedTodo.splice(indexCompleted, 1);
            saveToCompletedLocalStorage();
        }

        // Delete the task from markup
        parentNode.remove();

        // Check active buttons
        activeButtonEven();
        activeButtonOdd();

        checkEmptyList();

        // Update numbers of non completed and completed tasks
        nonCompletedTasks();
        completedTasks();
    }
}

// Select odd elements
function selectOddElements() {
    // Check where a function is called
    if (document.querySelector('.odd') && this.id === "selectOddElement") {
        odd.forEach(el => {
            document.getElementById(`${el.id}`).classList.remove('odd');
        })
    } else {
        odd.forEach(el => {
            if (document.getElementById(`${el.id}`)) {
                document.getElementById(`${el.id}`).classList.remove('odd');
            }
        })

        // Clear odd massive
        odd.splice(0, odd.length);

        // Choose all odd elements
        odd = todo.concat(completedTodo);
        odd.forEach((el, index) => {
            if (index % 2 === 0) {
                document.getElementById(`${el.id}`).classList.add('odd');
            }
        })
    }
}

// Select even elements
function selectEvenElements() {
    // Check where a function is called
    if (document.querySelector('.even') && this.id === "selectEvenElement") {
        even.forEach(el => {
            document.getElementById(`${el.id}`).classList.remove('even');
        })
    } else {
        even.forEach(el => {
            if (document.getElementById(`${el.id}`)) {
                document.getElementById(`${el.id}`).classList.remove('even');
            }
        })

        // Clear even massive
        even.splice(0, even.length);

        // Choose all even elements
        even = todo.concat(completedTodo);
        even.forEach((el, index) => {
            if (index % 2 === 1) {
                document.getElementById(`${el.id}`).classList.add('even');
            }
        })
    }
}

// Delete first element
function deleteFirstElement() {
    try {
        // Check place where first element will be deleted
        if (todo.length !== 0) {
            todo.splice(0, 1);

            // Save changes to localStorage
            saveToLocalStorage();

            // Check active buttons
            activeButtonOdd();
            activeButtonEven();

            // Delete the task from markup
            listAllTasks.firstElementChild.remove();

        } else {
            completedTodo.splice(0, 1);

            // Save changes to localStorage
            saveToCompletedLocalStorage();

            // Check active buttons
            activeButtonOdd();
            activeButtonEven();

            // Delete the task from markup
            listAllDoneTasks.firstElementChild.remove();
        }
    } catch (error) {
        console.log(`Ошибка: ${error.name}. Добавьте задачу.`);
    }

    checkEmptyList();

    // Update numbers of non completed and completed tasks
    nonCompletedTasks();
    completedTasks();
}

// Delete last element
function deleteLastElement() {
    try {
        // Check place where last element will be deleted
        if (completedTodo.length !== 0) {
            completedTodo.splice(-1, 1);

            // Save changes to localStorage
            saveToCompletedLocalStorage();

            // Check active buttons
            activeButtonOdd();
            activeButtonEven();

            // Delete the task from markup
            listAllDoneTasks.lastElementChild.remove();
        } else {
            todo.splice(-1, 1);

            // Save changes to localStorage
            saveToLocalStorage();

            // Check active buttons
            activeButtonOdd();
            activeButtonEven();

            // Delete the task from markup
            listAllTasks.lastElementChild.remove();
        }
    } catch (error) {
        console.log(`Ошибка: ${error.name}. Добавьте задачу.`);
    }

    checkEmptyList();

    // Update numbers of non completed and completed tasks
    nonCompletedTasks();
    completedTasks();
}

function renderTasks(task) {
    const inputTextToHTML = `
            <li id ="${task.id}" class="list__item">
                <div id="text">${task.text}</div>
                <div class="list__buttons">
                    <button class="list__button list__button_done" data-action="done">
                        <img src="img/done.svg" alt="done">
                    </button>
                    <button class="list__button list__button_change" data-action="change">
                        <img src="img/change.svg" alt="change">
                    </button>
                    <button class="list__button list__button_delete" data-action="delete">
                        <img src="img/delete.svg" alt="delete">
                    </button>
                </div>
            </li>`;
    listAllTasks.insertAdjacentHTML('beforeend', inputTextToHTML);
}

function renderDoneTasks(task) {
    const taskDoneToHTML = `
            <li id='${task.id}' class="list__item list__item_done"> 
                <div id="text">${task.text}</div>
                <div class="list__buttons">
                    <button class="list__button list__button_delete" data-action="delete">
                        <img src="img/delete.svg" alt="delete">
                    </button>
                </div>
            </li>`;
    listAllDoneTasks.insertAdjacentHTML('beforeend', taskDoneToHTML);
}

function checkEmptyList() {
    if (listAllTasks.children.length !== 0) {
        emptyList.classList.add('none')
        listAllTasks.classList.remove('list-done__padding')
    } else {
        emptyList.classList.remove('none')
        listAllTasks.classList.add('list-done__padding')
    }
    if (listAllDoneTasks.children.length !== 0) {
        listAllDoneTasks.classList.remove('list-done__padding')
    } else {
        listAllDoneTasks.classList.add('list-done__padding')
    }
}

function saveToLocalStorage() {
    localStorage.setItem('todo',JSON.stringify(todo))
}
function saveToCompletedLocalStorage() {
    localStorage.setItem('completedTodo',JSON.stringify(completedTodo))
}

function activeButtonEven() {
    if (document.querySelector('.even')) {
        selectEvenElements();
    }
}

function activeButtonOdd() {
    if (document.querySelector('.odd')) {
        selectOddElements();
    }
}

function nonCompletedTasks() {
    let count =todo.length
    document.querySelector('#nonCompleted').innerHTML = `Non completed: ${count}`
}

function completedTasks() {
    let countCompleted =completedTodo.length
    document.querySelector('#completed').innerHTML = `Completed: ${countCompleted}`
}