const APPEALS = [];
let numberOfColumns = 6;

// === ▼ 編集機能関連の関数 ▼ ===

/**
 * .edit-icon がクリックされたときに、タイトルを編集可能にするイベントリスナーを付与します。
 */
function attachEditIconListeners() {
    document.querySelectorAll('.edit-icon').forEach(icon => {
        // 既設のリスナーを削除して重複を防ぐ
        const newIcon = icon.cloneNode(true);
        icon.parentNode.replaceChild(newIcon, icon);
        
        newIcon.addEventListener('click', function () {
            let th = this.parentElement;
            let key = th.getAttribute('data-key');
            let oldText = th.childNodes[0].nodeValue.trim();
            let input = document.createElement('input');
            input.type = 'text';
            input.value = oldText;
            th.innerHTML = '';
            th.appendChild(input);
            input.focus();

            input.addEventListener('blur', () => saveEdit(th, key, input));
            input.addEventListener('keydown', function (event) {
                if (event.key === 'Enter') saveEdit(th, key, input);
            });
        });
    });
}

/**
 * 編集されたタイトルを保存し、表示を更新します。
 * @param {HTMLElement} th - ヘッダー要素
 * @param {string} key - localStorageのキー
 * @param {HTMLInputElement} input - 入力フィールド
 */
function saveEdit(th, key, input) {
    let newText = input.value.trim();
    localStorage.setItem(key, newText); // タイトルを保存
    th.innerHTML = newText + '<span class="edit-icon">✏️</span>';
    updateClass(th, newText);
    attachEditIconListeners(); // アイコンに再度イベントを付与
}

/**
 * タイトルの内容に応じてセルの色（クラス）を更新します。
 * @param {HTMLElement} th - ヘッダー要素
 * @param {string} text - 新しいタイトルテキスト
 */
function updateClass(th, text) {
    text = text.toLowerCase();
    let newClass = '';
    if (text.includes('否定側') || text.includes('neg')) {
        newClass = 'blue';
    } else if (text.includes('肯定側') || text.includes('aff')) {
        newClass = 'red';
    }
    
    const table = th.closest('table');
    if (!table || !newClass) return;
    
    const thIndex = th.cellIndex;
    const rows = table.rows;
    for (let i = 0; i < rows.length; i++) {
        const td = rows[i].cells[thIndex];
        if (td) {
            td.classList.remove("red", "blue");
            td.classList.add(newClass);
        }
    }
}


function setOnFocus(){
    const border = document.getElementsByClassName("border");
    for(let i=border.length;i--;){
        border[i].addEventListener("focus",e => {
            const div = e.target.getElementsByClassName("text");
            e.target.contentEditable = false;
            div[0].focus();
        });
        border[i].getElementsByClassName("text")[0].addEventListener("blur",e => e.target.contentEditable = true);
    }

    const cells = document.querySelectorAll(".text,.quot");
    for(let i=cells.length;i--;){
        cells[i].addEventListener("focus",e => {
            if(!e.relatedTarget) return;
            if(e.relatedTarget === e.target) return;
            if(e.relatedTarget.className !== "quot") return;
            if(e.relatedTarget.parentNode.id <= e.target.parentNode.id) return;

            const parentclassName = e.relatedTarget.parentNode.className.match(/red|blue/g)?.[0];
            const color = parentclassName === "red"?"rgb(255, 0, 0,0.5)":"rgba(30, 130, 250, 0.5)";
            const line = new LeaderLine(
                e.target,
                e.relatedTarget,
                {color: color, size: 1 ,path:"straight"}
              ); 
            APPEALS.push({line:line,sheet:document.getElementById("flow").value});
            e.relatedTarget.style.backgroundColor = color;
            e.relatedTarget.focus();
            e.relatedTarget.value = "";
        });
    }
}

function hideLine(){
    if(!APPEALS.length) return;
    const { value } = document.getElementById("flow");
    for(let i=APPEALS.length;i--;){
        if (APPEALS[i].sheet !== value) {
            APPEALS[i].line.hide("none");
            continue;
        };
        APPEALS[i].line.show("none");
    }
}

function rePosition(){
    if(!APPEALS.length) return;
    for(let i=APPEALS.length;i--;){
        APPEALS[i].line.position();
    }
}

function toNextRow(e) {
    if (!e.metaKey && !e.ctrlKey) return;
    const cellDiv = e.target.closest(".text");
    if (!cellDiv) return;
    if (e.code !== "Enter") return;

    e.preventDefault();

    const selection = window.getSelection();
    let fragmentToMove = null;

    if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rangeToEnd = range.cloneRange();
        rangeToEnd.setEnd(cellDiv, cellDiv.childNodes.length);
        fragmentToMove = rangeToEnd.extractContents();
    }
    
    appendRow(e, fragmentToMove);
}

function updateTableColumns(newColumnCount) {
    if (newColumnCount < 1) return;
    numberOfColumns = newColumnCount;

    const tables = [document.getElementById("Aff"), document.getElementById("Neg")];
    
    tables.forEach(table => {
        if (!table) return;

        const theadRow = table.querySelector('.part tr');
        const tbody = table.querySelector('tbody');

        const headers = Array.from(theadRow.children);
        const currentHeaderCount = headers.length;

        if (currentHeaderCount < newColumnCount) {
            for (let i = currentHeaderCount; i < newColumnCount; i++) {
                const th = document.createElement('th');
                const key = `${table.id.toLowerCase()}-col${i + 1}`;
                th.setAttribute('data-key', key);
                th.classList.add(`col-${i}`); // 列クラスを追加
                const savedText = localStorage.getItem(key) || `新しい列 ${i + 1}`;
                th.innerHTML = `${savedText} <span class="edit-icon">✏️</span>`;
                theadRow.appendChild(th);
            }
        } else if (currentHeaderCount > newColumnCount) {
            for (let i = currentHeaderCount; i > newColumnCount; i--) {
                theadRow.lastChild.remove();
            }
        }
        
        // ヘッダーの色を復元
        theadRow.querySelectorAll('th').forEach(th => {
            const colorKey = th.getAttribute('data-key') + '-color';
            const savedColor = localStorage.getItem(colorKey) || '';
            applyColumnColor(th, savedColor);
        });

        const rows = tbody.querySelectorAll('tr');
        rows.forEach(row => {
            const cells = Array.from(row.children);
            const currentCellCount = cells.length;

            if (currentCellCount < newColumnCount) {
                for (let i = currentCellCount; i < newColumnCount; i++) {
                    const td = document.createElement('td');
                    td.className = `border col-${i}`; // 列クラスを追加
                    td.id = i;
                    // 色を適用
                    const header = theadRow.children[i];
                    if (header && header.dataset.colorClass) {
                        td.classList.add(header.dataset.colorClass);
                    }
                    const div = document.createElement('div');
                    div.className = "text";
                    div.contentEditable = true;
                    td.appendChild(div);
                    row.appendChild(td);
                }
            } else if (currentCellCount > newColumnCount) {
                for (let i = currentCellCount; i > newColumnCount; i--) {
                    row.lastChild.remove();
                }
            }
        });
    });

    attachEventListenersToHeaders();
    setOnStartEvidence();
    setOnFocus();
    setOnClick();
    rePosition();
}


function appendRow(e, contentToMove = null) {
    const currentSheet = document.getElementById("flow").value;
    const table = document.getElementById(currentSheet);
    const currentRow = e.target.closest('tr');
    const currentCell = e.target.closest('td');

    if (!currentRow || !currentCell) return;

    const currentCellIndex = currentCell.cellIndex;

    const colors = [];
    table.querySelectorAll('.part th').forEach(th => {
        colors.push(th.dataset.colorClass || '');
    });

    const newRow = table.insertRow(currentRow.rowIndex + 1);

    for (let i = 0; i < numberOfColumns; i++) {
        const td = document.createElement("td");
        td.className = `border col-${i} ${colors[i] || ''}`;
        td.id = i;
        const div = document.createElement("div");
        div.className = "text";
        div.contentEditable = true;
        td.appendChild(div);
        newRow.appendChild(td);
    }

    setOnStartEvidence();

    const newCell = newRow.cells[currentCellIndex];
    if (newCell) {
        const textDiv = newCell.querySelector('.text');
        if (textDiv) {
            if (contentToMove && contentToMove.hasChildNodes()) {
                textDiv.appendChild(contentToMove);
            }
            textDiv.focus();
            const newSelection = window.getSelection();
            if (newSelection) {
                const newRange = document.createRange();
                newRange.selectNodeContents(textDiv);
                newRange.collapse(false);
                newSelection.removeAllRanges();
                newSelection.addRange(newRange);
            }
        }
    }

    setOnFocus();
    setOnClick();
}
 
function onStartEvidence(element) {
    return e => {
        element.style.height = 'auto';
        const scrollHeight = element.scrollHeight;
        element.style.height = scrollHeight + 'px';
    
        if(e.target.textContent.endsWith('!')||e.target.textContent.endsWith("！")){
            e.target.innerHTML = e.target.innerHTML.replace(/!|！/,"");
            const child = appendEvidence(e.target.parentNode);          
            child.focus();
            child.setSelectionRange(0,2);
            child.value = "";
        }
    }
}
    
function appendEvidence(parent){
    const newElement = document.createElement("textarea");
    newElement.value = 'T';
    newElement.className = "quot";
    newElement.addEventListener("input",setTextareaHeight);
    return parent.appendChild(newElement);
}

function endEvidence(e){
    if(!e.metaKey && !e.ctrlKey) return;
    if(e.srcElement.className !== "quot") return;
    if(e.code !== "Enter") return
    const div = document.createElement("div");
    div.className = "text";
    div.contentEditable = true;
    const newNode = e.target.parentNode.appendChild(div);
    newNode.focus();    
    setOnFocus();
}

function deleteEvidence(e){
    if(!e.metaKey && !e.ctrlKey) return;
    if(e.srcElement.className !== "quot") return;   
    if(e.code !== "Backspace") return;
    
    const textDivs = e.srcElement.closest("td")?.querySelectorAll(".text");
    const lastTextDiv = textDivs ? textDivs[textDivs.length - 1] : null;
    lastTextDiv.focus();
    e.srcElement.remove();
}

function setTextareaHeight() {
    this.style.height = "auto";
    this.style.height = `${this.scrollHeight}px`;
}

function onChangeSheet(e){
    const { value } = document.getElementById("flow");
    if(value === "Neg") {
        document.getElementById("Aff").style.display = "none";
        document.getElementById("Neg").style.display = "block";
        document.getElementById("Neg").style.display = "";
    }else{
        document.getElementById("Neg").style.display = "none";
        document.getElementById("Aff").style.display = "blcok";
        document.getElementById("Aff").style.display = "";
    }
    hideLine();
}

function setOnStartEvidence(){
    const textareas = document.getElementsByClassName('border');
    for (let i = textareas.length; i--;){
        textareas[i].addEventListener('input', onStartEvidence(textareas[i]));
    }
    setOnFocus();
}

function setOnClick(){
    const cells = document.getElementsByClassName("border");
    for(let i=cells.length;i--;){
        cells[i].addEventListener("click",e => {
            if(e.target.className === "text") return;
            try{
                e.target.children[0].focus();
            }catch{}
        })
    }
}


document.addEventListener("DOMContentLoaded", () => {
    const savedColumnCount = localStorage.getItem('columnCount');
    if (savedColumnCount) {
        document.getElementById('columnCount').value = savedColumnCount;
        numberOfColumns = parseInt(savedColumnCount, 10);
    }

    document.querySelectorAll('th').forEach((th, i) => {
        th.classList.add(`col-${i}`);
        let key = th.getAttribute('data-key');
        let savedText = localStorage.getItem(key);
        if (savedText) {
            th.childNodes[0].nodeValue = savedText;
        }
        let colorKey = key + '-color';
        let savedColor = localStorage.getItem(colorKey) || '';
        applyColumnColor(th, savedColor);
    });

    updateTableColumns(numberOfColumns);
    
    document.getElementById("applyColumnCount").addEventListener("click", () => {
        const newCount = parseInt(document.getElementById("columnCount").value, 10);
        localStorage.setItem('columnCount', newCount);
        updateTableColumns(newCount);
    });

    document.addEventListener("keydown",toNextRow);
    document.addEventListener("keydown",endEvidence);
    document.addEventListener("keydown",deleteEvidence);
    document.getElementById("flow").addEventListener("change",onChangeSheet);
    document.getElementById("Neg").style.display = "none";
});
