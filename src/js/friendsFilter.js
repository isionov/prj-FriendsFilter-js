let template = require('../template.hbs');
let friendsColl;

VK.init({
   apiId: 6668768
});

function matchNames(elemLi, name) {
    return !!(~((elemLi.querySelector('.name').textContent.toLowerCase()).indexOf(name.toLowerCase())));
}

function getParentByClass(child, parentClass) {
    let parent = child;
    while (parent=parent.parentElement) {
        if (parent.classList.contains(parentClass)) {
            return parent;
        }
    }
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

auth()
.then(() => {
    return callAPI('friends.get', {fields: 'photo_100'});
})
.then(friends => {
    const html = template(friends);
    const result = document.querySelector('#user-template');

    result.innerHTML = html;

    const movedResult = document.querySelector('#list-second');
    const inputFirst = document.querySelector('#filter-input-first');
    const inputSecond = document.querySelector('#filter-input-second');

    const friendsColl = document.querySelectorAll('#first-list li');

    const resultUl = document.querySelector('#first-list');
    // Реализация логики + и х
    for (let index = 0; index < friendsColl.length; index++) {
        friendsColl[index].id=index;
        //   console.log(friendsColl);
        friendsColl[index].addEventListener('click', (e) => {
            let elem = getParentByClass(e.target, 'icon');
            if (elem && elem.id!=='moved-back') {
                elem.id = 'moved-back';
                let liElem = getParentByClass(elem, "list-elem");
                movedResult.appendChild(liElem);
                elem.querySelector('svg').innerHTML = '<use xlink:href="img/sprite.svg#close"></use>';
            } else if (elem && elem.id==='moved-back') {
                let liElem = getParentByClass(elem, "list-elem");
                elem.id = 'move-forward';
                elem.querySelector('svg').innerHTML = '<use xlink:href="img/sprite.svg#add"></use>';
                let sibling = getClosest(+liElem.id, resultUl);
                if (sibling) {
                    resultUl.insertBefore(liElem, sibling);
                } else {
                    resultUl.appendChild(liElem);
                }
                
            }
        });
        
    }
    // Конец реализация логики + и х
    
    // Реализация логики фильтрации друзей
    
    inputFirst.addEventListener('keyup', (e) => {
        let currentList = document.querySelectorAll('#first-list li');
        filterList(currentList, inputFirst)
    });
    
    inputSecond.addEventListener('keyup', (e) => {
        let currentList = document.querySelectorAll('#list-second li');
        filterList(currentList, inputSecond)
    });
    
    // Реализация логики фильтрации друзей

});

