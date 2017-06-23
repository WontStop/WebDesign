/**
 *By Yongxun Li(Charles.li)
 *Mail: liyongxun@foxmail.com
 *Phone: (+86) 18221193236
 *Git: https://github.com/wontstop
 *Address: No.4800, Caoan Road, Jiading District, Tongji University, Shanghai, China.
 */

// Count of items not completed
var leftCount = 0;
// According to the time, generate ID of items
var time = new Date();
var ID = 'todo' +
    time.getYear().toString() +
    time.getMonth().toString() +
    time.getDay().toString() +
    time.getHours().toString() +
    time.getMinutes().toString() +
    time.getSeconds().toString();
var totalCount = 0;

function $(id) {
    return document.getElementById(id);
}
function $$(selector) {
    return document.querySelector(selector);
}

function $$$(selector) {
    return document.querySelectorAll(selector);
}

// Call function of input box
function addItem() {
    var todo = $('todoinput');
    if (todo.value === '')
        return;
    addLocal(todo.value, false);
    update();
    todo.value = '';
}

// Make items as completed
function deleteToDo(e) {
    var todo;
    for (var i = 0; i < localStorage.length; i++) {
        todo = readLocal(i);
        if (todo !== null && todo.message === e.target.parentNode.childNodes[1].innerText)
            updateLocal(localStorage.key(i), todo.message, !todo.status);
    }
    update();
}

// Reedit the items
function editToDo(event) {
    var tar = event.target;
    var box = document.createElement('input');
    box.classList.add('bigedit');
    box.setAttribute('autofocus', 'autofocus');
    box.value = tar.innerHTML;

    box.addEventListener('keyup', function (e) {
        if (e.keyCode !== 0xd)
            return;
        var oldmessage = tar.innerText;
        var todo;
        for (var i = 0; i < localStorage.length; i++) {
            todo = readLocal(i);
            if (todo !== null && todo.message === oldmessage)
                updateLocal(localStorage.key(i), box.value, todo.status);
        }
        update();
    });

    tar.parentNode.replaceChild(box, tar);
}

// Change the filter state
function filter(e) {
    var filters = $$$("#filters li");
    for (var i = 0; i < 3; i++) {
        if (e.target === filters[i])
            localStorage.setItem('display', i.toString());
    }
    update();
}

// Entrance of the project, init the event listener
function init() {
    $("add").addEventListener("click", addItem);
    $('todoinput').addEventListener("keyup", function (event) {
        if (event.keyCode === 0xd)
            addItem();
    });

    //Set filter
    var filters = $$$('#filters li');
    // forEach may not work in some browsers
    filters.forEach(function (t) {
        t.addEventListener('click', filter);
    });

    // Set clear function
    var clear = $('clear');
    clear.addEventListener('click', function () {
        for (var i = 0; i < localStorage.length; i++) {
            var todo = readLocal(i);
            if (todo && todo.status) {
                removeLocal(localStorage.key(i));
                i--;
            }
        }
        update();
    });

    // Set mark function
    $('mark').addEventListener('click',function(){
        // When user load the page first time, we should init the param
        if(localStorage.getItem('mark') === null){
            localStorage.setItem('mark',true);
        }
        var todo;
        var mark = localStorage.getItem('mark');
        for (var i = 0; i < localStorage.length; i++) {
            todo = readLocal(i);
            if (todo !== null)
                updateLocal(localStorage.key(i), todo.message,mark !== 'false');
        }
        localStorage.setItem('mark',mark === 'false');
        update();
    });
    // Flush the page
    update();
}

// Add the items to page according to message and status
function addToDo(message, completed) {
    var list = $('list');
    var left = $('left');

    //Add imark div
    var imark = document.createElement('div');
    imark.classList.add('imark');
    imark.innerText = '>';
    imark.addEventListener('click', deleteToDo);

    //Add icontent div
    var icontent = document.createElement('div');
    icontent.classList.add('icontent');
    icontent.innerText = message;
    icontent.addEventListener('dblclick', editToDo);

    //Add del div
    var del = document.createElement('button');
    del.classList.add('del');
    del.innerText = 'x';
    del.style.color = 'red';
    del.addEventListener('click', function (en) {
        var todo;
        for (var i = 0; i < localStorage.length; i++) {
            todo = readLocal(i);
            if (todo !== null && todo.message === en.target.parentNode.childNodes[1].innerText) {
                removeLocal(localStorage.key(i));
            }
        }
        update();
    });

    //Add item div
    var item = document.createElement('div');
    item.classList.add('item');
    // Change the appearance
    if (completed) {
        item.classList.add('completed');
        item.style.display = localStorage.getItem('display') === '1' ? 'none' : 'block';
    }
    else {
        item.style.display = localStorage.getItem('display') === '2' ? 'none' : 'block';
    }
    item.appendChild(imark);
    item.appendChild(icontent);
    item.appendChild(del);
    list.insertBefore(item, list.firstChild);

    //update the reminder
    left.innerText = (leftCount === 0 ? 'No' : leftCount.toString()) + ' ' + 'items left';
}

//Add item to database
function addLocal(msg, completed) {
    var todo = {
        message: msg,
        status: completed
    };
    totalCount++;
    // Make the count to 3 digits
    var str = '000'+totalCount.toString();
    localStorage.setItem(ID + str.substr(str.length-3), JSON.stringify(todo));
}

// Get data from database, get an object
function readLocal(i) {
    var key = localStorage.key(i);
    return key.startsWith('todo') ? JSON.parse(localStorage.getItem(key)) : null;
}

// Update data in database
function updateLocal(key, msg, completed) {
    var todo = {
        message: msg,
        status: completed
    };
    localStorage.setItem(key, JSON.stringify(todo));
}

//Delete data from database
function removeLocal(key) {
    localStorage.removeItem(key);
}

//Update the whole page
function update() {
    //Clear the list
    $('list').innerHTML = '';

    leftCount = 0;
    //Init the display param
    if (localStorage.getItem('display') === null) {
        localStorage.setItem('display', '0');
    }

    $$("#filters .filter-choose").classList.remove('filter-choose');
    $$$('#filters li')[localStorage.getItem('display')].classList.add('filter-choose');

    // Add all the items to page
    for (var i = 0; i < localStorage.length; i++) {
        var todo = readLocal(i);
        if (todo !== null) {
            if (!todo.status)
                leftCount++;
            addToDo(todo.message, todo.status);
        }
    }
    if (leftCount === 0)
        $('left').innerText = (leftCount === 0 ? 'No' : leftCount.toString()) + ' ' + 'items left';
}

window.addEventListener("load", init);