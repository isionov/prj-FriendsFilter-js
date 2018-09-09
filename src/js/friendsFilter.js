let template = require('../template.hbs');
let storage = localStorage;
const inputFirst = document.querySelector('#filter-input-first');
const inputSecond = document.querySelector('#filter-input-second');
const closeBtn = document.querySelector('.close');

closeBtn.addEventListener('click', (e)=>{
    document.querySelector('.wrapper-content').style.display = 'none';
});


VK.init({
   apiId: 6668768
});

function matchNames(elemLi, name) {
    return !!(~((elemLi.querySelector('.name').textContent.toLowerCase()).indexOf(name.toLowerCase())));
}

function getParentByClass(child, parentClass) {
    let parent = child;
     do {
        if (parent.classList.contains(parentClass)) {
            return parent;
        }
    } while (parent=parent.parentElement)
    return null;
}

function getParentById(child, idElem) {
    let parent = child;
    while (parent=parent.parentElement) {
        if (parent.id === idElem) {
            return parent;
        }
    }
    return null;
}

function getClosest(id, parent){
    let childCol = parent.children;
    for (let index = 0; index < childCol.length; index++) {
        if ((+childCol[index].id)>id) {
            return childCol[index];
        }
    }

    return null;
}

function auth() {
    return new Promise((resolve, reject) => {
        VK.Auth.login(data => {
            if (data.session) {
                resolve();
            } else {
                reject(new Error('Не удалось авторизоваться'));
            }
        }, 2);
    });
}

function callAPI(method, params) {
    params.v = '5.76';

    return new Promise((resolve, reject) => {
        VK.api(method, params, (data) => {
            if (data.error) {
                reject(data.error);
            } else {
                resolve(data.response);
            }
        });
    });
}

function filterList(listColl, field) {
    for (let index = 0; index < listColl.length; index++) {
        if (matchNames(listColl[index], field.value)) {
            listColl[index].style.display = '';
        } else {
            listColl[index].style.display = 'none';
        }
    }
}

////////////////////////////////////////

function fillListHbs(arr, flag, wrapper) {
    let resultObj = {items: arr, open: flag};
    let htmlArr = template(resultObj);
    wrapper.innerHTML = htmlArr;
}



auth()
.then(() => {
    return callAPI('friends.get', {fields: 'photo_100'});
})
.then(friends => {
    function swapFriends(elemNum, from, wrapFrom, flagFrom, to, wrapTo, flagTo){
        to[elemNum] = from[elemNum];
        delete from[elemNum];
        fillListHbs(from, flagFrom, wrapFrom);
        fillListHbs(to, flagTo, wrapTo);
        friendsLeftColl = document.querySelectorAll('#left-list-wrap #first-list li');
        friendsRightColl = document.querySelectorAll('#right-list-wrap #first-list li');
        filterList(friendsLeftColl, inputFirst)
        filterList(friendsRightColl, inputSecond)
    }
    let [...friendsArrLeft] = friends.items;

    for (let index = 0; index < friendsArrLeft.length; index++) {
        friendsArrLeft[index].id = index;
    }
    
    let friendsArrRight = [];
    const resultLeftList = document.querySelector('#left-list-wrap');
    const resultRightList = document.querySelector('#right-list-wrap');

    fillListHbs(friendsArrLeft, true, resultLeftList);
    
    if (storage.getItem('leftList') || storage.getItem('rightList')) {
        friendsArrLeft = JSON.parse(storage['leftList']);
        friendsArrRight = JSON.parse(storage['rightList']);
        friendsArrLeft.forEach(function prepareArr(currentValue, index, array){
            if (!currentValue) {
                delete array[index];
            }
        });
        friendsArrRight.forEach(function prepareArr(currentValue, index, array){
            if (!currentValue) {
                delete array[index];
            }
        });
        fillListHbs(friendsArrLeft, true, resultLeftList);
        fillListHbs(friendsArrRight, false, resultRightList);
        friendsLeftColl = document.querySelectorAll('#left-list-wrap #first-list li');
        friendsRightColl = document.querySelectorAll('#right-list-wrap #first-list li');
        filterList(friendsLeftColl, inputFirst)
        filterList(friendsRightColl, inputSecond)
    }
    let friendsLeftColl = document.querySelectorAll('#left-list-wrap #first-list li');
    let friendsRightColl = document.querySelectorAll('#right-list-wrap #first-list li');



    const save = document.querySelector('.save');
    
    // Реализация логики + и х
        document.body.addEventListener('click', (e) => {
            let elem = getParentByClass(e.target, 'icon');
            let elemWrapLeft = getParentById(e.target, 'left-list-wrap');
            let elemWrapRight = getParentById(e.target, 'right-list-wrap');
            let li = getParentByClass(e.target, 'list-elem');
            let elemNum;
            if (li) {
                elemNum =  li.id;
            }
            

            if (elem && elemWrapLeft) {
                swapFriends(elemNum, friendsArrLeft, resultLeftList, true, friendsArrRight, resultRightList, false);
            } else if (elem && elemWrapRight) {
                swapFriends(elemNum, friendsArrRight, resultRightList, false, friendsArrLeft, resultLeftList, true);
            }
        });
        
    
    // Конец реализация логики + и х
    
    // Реализация логики фильтрации друзей
    
    inputFirst.addEventListener('keyup', (e) => {
        let currentList = document.querySelectorAll('#first-list li');
        filterList(friendsLeftColl, inputFirst)
    });
    
    inputSecond.addEventListener('keyup', (e) => {
        let currentList = document.querySelectorAll('#list-second li');
        filterList(friendsRightColl, inputSecond)
    });
    
    // Конец реализация логики фильтрации друзей

    // Реализация логики DnD

    let currentDrag;

    document.body.addEventListener("dragstart", (e) => {
        const elem = getParentByClass(e.target, 'list-elem');
        const zone = getParentByClass(e.target, 'template-wrapper');
        if (elem) {
            currentDrag = {startZone: zone, node: elem};
        }
    });

    document.body.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    document.body.addEventListener("drop", (e) => {
        
        event.preventDefault();
        const zoneL = getParentByClass(e.target, 'drag');
        const zoneR = getParentByClass(e.target, 'drop');
        if (zoneR && currentDrag.startZone.id === 'left-list-wrap') {
            swapFriends(+currentDrag.node.id, friendsArrLeft, resultLeftList, true, friendsArrRight, resultRightList, false);
        }
        if (zoneL && currentDrag.startZone.id === 'right-list-wrap') {
            swapFriends(+currentDrag.node.id, friendsArrRight, resultRightList, false,friendsArrLeft, resultLeftList, true);
        }
        currentDrag = {};
    });
      // Конец реализация логики DnD
      // Логика сохранения
      save.addEventListener('click', (e) => {
        //   console.log(JSON.parse(JSON.stringify(friendsArrLeft)));
          storage['leftList'] = JSON.stringify(friendsArrLeft);
          storage['rightList'] = JSON.stringify(friendsArrRight);
      });
});

