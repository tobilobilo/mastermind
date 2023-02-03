const config = {
    rows: 10,
    pegs: 4,
    colorArray: ['blue', 'red', 'yellow', 'green', 'orange', 'pink', 'white', 'black', 'purple', 'cyan', 'teal'],
    colors: 6,
    lang: 'fr',
    texts: {
        'en': {
            choice: 'Choose your code',
            test: 'Let\'s test',
            ends: 'It\'s over',
            'wins': ', you won',
            'loss': ', you lost',
            restart: 'Restart',
            language: 'English',
            languageCode: 'en',
            'optionLangLabel': 'Language',
            'optionPegsLabel': 'Number of pegs',
            'optionColorsLabel': 'Number of colors',
            'optionColorsRows': 'Number of rows',
            'customizeOptions': 'Customize the game',
        },
        'fr': {
            choice: 'Entrer votre combinaison',
            test: 'Tester',
            ends: 'C\'est terminé',
            'wins': ', vous avez gagné',
            'loss': ', vous avez perdu',
            restart: 'Recommencer',
            language: 'Français',
            languageCode: 'fr',
            'optionLangLabel': 'Langue',
            'optionPegsLabel': 'Nombre de pattes',
            'optionColorsLabel': 'Nombre de couleurs',
            'optionColorsRows': 'Nombre de rangées',
            'customizeOptions': 'Personaliser le jeu',
        }
    },
};

const board = document.getElementById('board');
const isTouchDevice = 'ontouchstart' in document.documentElement;
if(isTouchDevice) board.classList.add('touch');

const game = {
    selector: '.board',
    solution: [],
    currentRow: 1,
    currentPeg: null,
    gameEnded: false,
    testRow: function() {
        const rows = document.querySelectorAll('.row');
        const activeRow = document.querySelector('.row.active');
        let feedback = [];
        let solutionProcess = [...this.solution];
        let rowProcess = [];
        for (let i = 0; i < solutionProcess.length; i++) { // test if a peg match color and location
            const hole = document.querySelectorAll(`.active .peg-hole`)[i];
            const holeColor = hole.getAttribute('data-color');
            if(holeColor == game.solution[i]) {
                feedback.push('red');
                solutionProcess[i] = '';
            } else { // if it doesn't match, push it to the next step (color matching only)
                rowProcess.push(holeColor);
            }
        }
        solutionProcess = solutionProcess.filter(Boolean); // remove empty element(matching peg)
        if(solutionProcess.length <= 0) {
            this.gameEnded = true;
        }
        for (let i = 0; i < rowProcess.length; i++) { // test if a peg match only color
            const holeColor = rowProcess[i];
            if(solutionProcess.includes(holeColor)) {
                feedback.push('white');
                solutionProcess[solutionProcess.indexOf(holeColor)] = '';
                solutionProcess = solutionProcess.filter(Boolean);
            }
        }
        for (let i = 0; i < feedback.length; i++) { // coloring feedback holes
            coloringHole(activeRow.querySelectorAll('.key-hole')[i], feedback[i]);
        }
        if(this.gameEnded) { // win the game if all pegs has been found
            game.gameover('wins');
            return;
        }
        if(this.currentRow >= config.rows) { // loose the game if it what the last row
            game.gameover('loss');
            return;
        }
        activeRow.classList.remove('active');
        this.currentRow = this.currentRow+=1;
        rows[config.rows - this.currentRow].classList.add('active');
    },
    gameover: function(state){
        game.gameEnded = true;
        document.querySelector('.row.active').classList.remove('active');
        action.updateTextNode(config.texts[config.lang].ends + config.texts[config.lang][state]);
        setTimeout(() => {
            action.updateTextNode(config.texts[config.lang].restart, false);
            return;
        }, 5000);
        document.querySelector('.head').classList.remove('hidden');
    },
    restart: function() {
        game.gameEnded = false;
        game.currentRow = 1;
        document.querySelectorAll('.row')[config.rows-1].classList.add('active');
        document.querySelector('.head').classList.add('hidden');
        [...document.querySelectorAll('.peg-hole, .key-hole')].forEach((hole) => {
            hole.setAttribute('data-color', '');
        });
        generateSolution();
        return;
    },
    reset: function() {
        game.gameEnded = false;
        game.currentRow = 1;
        changeLang();
        clearBoard();
        initBoard();
    },
    toggleOptions: function() {
        [...document.querySelectorAll('.menu-options, .option-opener-button')].forEach( (el) => {
            el.classList.toggle('visible');
        });
    },
}

const action = {
    selector: '.action-btn',
    updateTextNode: function(text, active = true) {
        const btn = document.querySelector(this.selector);
        btn.innerHTML = text;
        btn.classList.add('inactive');
        if(!active) btn.classList.remove('inactive');
    },
    clickAction: function(){
        this.updateTextNode(config.texts[config.lang].choice);
        if(game.gameEnded) {
            game.restart();
            return;
        }
        if(activeRowIsFilled()) {
            game.testRow();
            return;
        }
    }
}

const coloringHole = (el, color) => {
    el.setAttribute('data-color', color);
}

const activeRowIsFilled = () => {
    let isFilled = true;
    // test if active row has all holes filled
    let activeRow = document.querySelectorAll('.active.row');
    let activeRowPegHole = document.querySelectorAll('.active.row .peg-hole');
    for (let i = 0; i < config.pegs; i++) {
        if(activeRowPegHole[i].getAttribute('data-color') == "") {
            isFilled = false;
            break;
        }
    }
    return isFilled;
}

const generateSolution = () => {
    game.solution = [];
    for (let i = 0; i < config.pegs; i++) {
        let setColor = config.colorArray[Math.floor(Math.random()*(config.colors))];
        document.querySelectorAll(`.head .peg-hole`)[i].setAttribute('data-color', setColor);
        game.solution.push(setColor);
    }
    console.log(`La solution est: "${game.solution}"... oui, oui, je sais c'est pas très efficace de tester les résultats en front-end, mais c'est comme ça!`);
    return;
}

const pegHoleMouseDownEvent = (pegHole, event) => {
    if(pegHole.parentNode.classList.contains('active')) {
        event.preventDefault();
        game.currentPeg = pegHole;
        showColorPalette(pegHole);
    }
}

const documentMouseUpEvent = () => {
    hideColorPalette();
    hideOptionsList();
}

const colorTabMouseEnterEvent = (colorTab) => {
    coloringHole(game.currentPeg, colorTab.getAttribute('data-color'));
    if(activeRowIsFilled()) {
        action.updateTextNode(config.texts[config.lang].test, false);
    }
}

const generatePegHoles = (parent) => {
    const isHead = parent.classList.contains("head");
    for (let j = 0; j < config.pegs; j++) {
        const pegHole = document.createElement('div');
        pegHole.classList.add('peg-hole');
        pegHole.setAttribute('data-color', '');
        parent.appendChild(pegHole);
        pegHole.addEventListener('mousedown', function(event){
            pegHoleMouseDownEvent(this, event);
        });
        pegHole.addEventListener('touchend', function(event){
            pegHoleMouseDownEvent(this, event);
        });
    }
    if(isHead) {
        const placeholdeBox2 = document.createElement('div');
        placeholdeBox2.classList.add('placeholder-hole');
        parent.appendChild(placeholdeBox2);
    }
}

const generateKeyHoles = (parent) => {
    const keyBox = document.createElement('div');
    keyBox.classList.add('key-box');
    const keyBoxWrapper = document.createElement('div');
    keyBoxWrapper.classList.add('key-box-wrapper');
    keyBox.appendChild(keyBoxWrapper);
    parent.appendChild(keyBox);
    for (let j = 0; j < config.pegs; j++) {
        const keyHole = document.createElement('div');
        keyHole.classList.add('key-hole');
        keyBoxWrapper.appendChild(keyHole);
    }
}

const generateActionBtn = (parent) => {
    const actionBtn = document.createElement('a');
    actionBtn.setAttribute('class', 'action-btn inactive');
    actionBtn.setAttribute('id', 'action-btn');
    actionBtn.appendChild(document.createTextNode(config.texts[config.lang].choice));
    actionBtn.addEventListener('click', function(){
        action.clickAction();
    });
    parent.appendChild(actionBtn);
}

const generateColorPalette = (parent) => {
    const colorPalette = document.createElement('div');
    colorPalette.setAttribute('class', 'color-palette');
    parent.appendChild(colorPalette);
    for(let i = 0; i < config.colors; i++) {
        const colorTab = document.createElement('span');
        colorTab.setAttribute('class', 'color-tab');
        colorTab.setAttribute('data-color', config.colorArray[i]);
        colorTab.setAttribute('style', `transform: rotate(${(360 / config.colors) * i}deg);`);
        colorPalette.appendChild(colorTab);
        colorTab.addEventListener('mouseover', function(){
            colorTabMouseEnterEvent(this);
        });
        colorTab.addEventListener('touchstart', function(){
            colorTabMouseEnterEvent(this);
        });
    }
    
}

const showColorPalette = (ref) => {
    const colorPalette = document.querySelector('.color-palette');
    colorPalette.style.left = `${ref.offsetLeft}px`;
    colorPalette.style.top = (ref.offsetTop + ((ref.offsetHeight / 2) - (ref.offsetWidth / 2))) + 'px';
    colorPalette.style.width = `${ref.offsetWidth}px`;
    colorPalette.style.height = `${ref.offsetHeight}px`;
    colorPalette.classList.add('visible');
}

const hideColorPalette = () => {
    const colorPalette = document.querySelector('.color-palette');
    colorPalette.style.left = '-999px';
    colorPalette.style.top = '-999px';
    colorPalette.classList.remove('visible');
}

const hideOptionsList = () => {
    [...document.querySelectorAll('.option-opt-list')].forEach((list) => {
        list.classList.remove('visible');
    });
}

const changeLang = () => {
    [...document.querySelectorAll('[data-lang]')].forEach( (el) => {
        el.innerHTML = config.texts[config.lang][el.getAttribute('data-lang')];
    });
}

const clearBoard = () => {
    board.innerHTML = '';
}

const initBoard = () => {
    const head = document.createElement('div');
    head.classList.add('head', 'hidden');
    board.appendChild(head);
    generatePegHoles(head);
    generateSolution();
    for (let i = 0; i < config.rows; i++) {
        const row = document.createElement('div');
        row.classList.add('row');
        if (i == config.rows-1) row.classList.add('active');
        board.appendChild(row);
        generatePegHoles(row);
        generateKeyHoles(row);
    }
    generateActionBtn(board);
    generateColorPalette(board);
}

const options = [
    {
        item: 'lang',
        min: 1,
        max: Object.values(config.texts).length,
        label: 'optionLangLabel',
        default: config.texts[config.lang].language,
        datatype: Object.values(config.texts),
        datavalue: (nb) => {
            return Object.values(config.texts)[nb-1].languageCode;
        },
        datatext: (nb) => {
            return Object.values(config.texts)[nb-1].language;
        },
        action: (nb) => {
            config.lang = Object.values(config.texts)[nb-1].languageCode;
        },
    },
    {
        item: 'pegs',
        min: 4,
        max: 10,
        label: 'optionPegsLabel',
        default: config.pegs,
        datatype: 'number',
        action: (nb) => {
            config.pegs = nb;
        },
    },
    {
        item: 'colors',
        min: 2,
        max: config.colorArray.length,
        label: 'optionColorsLabel',
        default: config.colors,
        datatype: 'number',
        action: (nb) => {
            config.colors = nb;
        },
    },
    {
        item: 'rows',
        min: 5,
        max: 20,
        label: 'optionColorsRows',
        default: config.rows,
        datatype: 'number',
        action: (nb) => {
            config.rows = nb;
        },
    }
];

const generateHiddenOptions = () => {
    const optionsMenu = document.createElement('section');
    optionsMenu.setAttribute('class', 'menu-options');
    const optionsMenuContent = document.createElement('div');
    optionsMenuContent.setAttribute('class', 'content');

    for(let i = 0; i < options.length; i++) {
        const optionChoice = document.createElement('div');
        optionChoice.setAttribute('class', `option option-text-${options[i].item}`);
        const optionChoiceTextLabel = document.createElement('span');
        optionChoiceTextLabel.setAttribute('class', `option-text option-text-${options[i].item}`);
        optionChoiceTextLabel.setAttribute('data-lang', options[i].label);
        optionChoiceTextLabel.innerHTML = config.texts[config.lang][options[i].label];
        optionChoice.appendChild(optionChoiceTextLabel);
        const optionChoiceText = document.createElement('span');
        const optionChoiceTextNode = document.createElement('span');
        optionChoiceText.setAttribute('class', 'option-text option-text-opt');
        optionChoiceTextNode.setAttribute('class', 'option-opt');
        optionChoiceTextNode.innerHTML = options[i].default;
            const optionChoiceOpt = document.createElement('div');
            optionChoiceOpt.setAttribute('class', 'option-opt-list');
            for(let k = options[i].min;k <= options[i].max; k++){
                let optionChoiceTextOpt = document.createElement('span');
                let optionChoiceObjDataValue = k;
                let optionChoiceObjDataText = k;
                if(options[i].datatype != 'number') {
                    optionChoiceObjDataValue = options[i].datavalue(k);
                    optionChoiceObjDataText = options[i].datatext(k);
                }
                optionChoiceTextOpt.setAttribute('class', 'option-text option-text-opt-btn');
                optionChoiceTextOpt.setAttribute('data-value', optionChoiceObjDataValue);
                optionChoiceTextOpt.setAttribute('data-text', optionChoiceObjDataText);
                optionChoiceTextOpt.innerHTML = optionChoiceObjDataText;
                optionChoiceTextOpt.addEventListener('click', function() {
                    //
                    hideOptionsList();
                    //config.language = optionChoiceObj.languageCode;
                    options[i].action(k);
                    optionChoiceTextOpt.parentElement.previousSibling.innerText = optionChoiceObjDataText;
                });
                optionChoiceOpt.appendChild(optionChoiceTextOpt);
            }
        optionChoiceText.appendChild(optionChoiceTextNode);
        optionChoiceText.appendChild(optionChoiceOpt);
        optionChoice.appendChild(optionChoiceText);
        optionChoiceTextNode.addEventListener('click', () => {
            optionChoiceOpt.classList.toggle('visible');
        });
        optionsMenuContent.appendChild(optionChoice);
    }
    
    const optionButton = document.createElement('button');
    optionButton.setAttribute('class', 'option-button');
    optionButton.innerHTML = 'Go!';
    optionButton.addEventListener('click', () => {
        game.reset();
    });
    optionsMenuContent.appendChild(optionButton);
    optionsMenu.appendChild(optionsMenuContent);

    const optionOpenerButton = document.createElement('a');
    optionOpenerButton.setAttribute('class', 'option-opener-button');
    const optionOpenerButtonSpan = document.createElement('span');
    optionOpenerButtonSpan.setAttribute('data-lang', 'customizeOptions');
    optionOpenerButtonSpan.innerHTML = config.texts[config.lang]['customizeOptions'];
    const optionOpenerButtonArrow = document.createElement('span');
    optionOpenerButtonArrow.setAttribute('class', 'option-opener-button-arrow option-btn-arrow');
    optionOpenerButtonArrow.innerHTML = '';
    optionOpenerButton.addEventListener('click', () => {
        game.toggleOptions();
    });
    optionOpenerButton.appendChild(optionOpenerButtonSpan);
    optionOpenerButton.appendChild(optionOpenerButtonArrow);
    optionsMenuContent.appendChild(optionOpenerButton);

    document.querySelector('.top-banner').parentNode.insertBefore(optionOpenerButton, document.querySelector('.top-banner').nextSibling);
    document.querySelector('.top-banner').parentNode.insertBefore(optionsMenu, document.querySelector('.top-banner').nextSibling);
}

document.addEventListener('mouseup', function(event){
    documentMouseUpEvent();
});

document.addEventListener('touchend', function(event){
    if(!event.path[1].classList.contains('active') && !event.path[1].classList.contains('color-palette')) {
        documentMouseUpEvent();
    }
});

document.addEventListener("DOMContentLoaded",function(){
    generateHiddenOptions();
    initBoard();
});


//2S082182F6446214N
//300000263