const APPEALS = [];
let numberOfColumns = 6;
const colorClasses = ['', 'color-red', 'color-blue'];

// === ▼ 編集機能・色変更関連の関数 ▼ ===

function attachEventListenersToHeaders() {
    document.querySelectorAll('th').forEach(th => {
        const newTh = th.cloneNode(true);
        th.parentNode.replaceChild(newTh, th);
        newTh.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-icon')) {
                enterEditMode(newTh);
            } else {
                cycleHeaderColor(newTh);
            }
        });
    });
}

function enterEditMode(th) {
    let key = th.getAttribute('data-key');
    let oldText = th.childNodes[0].nodeValue.trim();
    let input = document.createElement('input');
    input.type = 'text';
    input.value = oldText;
    th.innerHTML = '';
    th.appendChild(input);
    input.focus();
    const finishEditing = () => saveEdit(th, key, input);
    input.addEventListener('blur', finishEditing);
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            input.removeEventListener('blur', finishEditing);
            finishEditing();
        }
    });
}

function cycleHeaderColor(th) {
    const key = th.getAttribute('data-key') + '-color';
    const currentIndex = colorClasses.indexOf(th.dataset.colorClass || '');
    const nextIndex = (currentIndex + 1) % colorClasses.length;
    const newColorClass = colorClasses[nextIndex];
    localStorage.setItem(key, newColorClass);
    applyColumnColor(th, newColorClass);
}

function applyColumnColor(th, colorClass) {
    const table = th.closest('table');
    const thIndex = th.cellIndex;
    const validColorClasses = colorClasses.filter(c => c);
    th.classList.remove(...validColorClasses);
    th.dataset.colorClass = colorClass;
    if (colorClass) {
        th.classList.add(colorClass);
    }
    table.querySelectorAll('tbody tr').forEach(row => {
        const cell = row.cells[thIndex];
        if (cell) {
            cell.classList.remove(...validColorClasses);
            if (colorClass) {
                cell.classList.add(colorClass);
            }
        }
    });
}

function saveEdit(th, key, input) {
    let newText = input.value.trim();
    localStorage.setItem(key, newText);
    th.innerHTML = newText + '<span class="edit-icon">✏️</span>';
}

function setOnFocus(){const border=document.getElementsByClassName("border");for(let e=border.length;e--;){border[e].addEventListener("focus",e=>{const t=e.target.getElementsByClassName("text");e.target.contentEditable=!1,t[0].focus()}),border[e].getElementsByClassName("text")[0].addEventListener("blur",e=>e.target.contentEditable=!0)}const e=document.querySelectorAll(".text,.quot");for(let t=e.length;t--;)e[t].addEventListener("focus",e=>{if(!e.relatedTarget)return;if(e.relatedTarget===e.target)return;if("quot"!==e.relatedTarget.className)return;if(e.relatedTarget.parentNode.id<=e.target.parentNode.id)return;const t=e.relatedTarget.parentNode.className.match(/red|blue/g)?.[0],n="red"===t?"rgb(255, 0, 0,0.5)":"rgba(30, 130, 250, 0.5)",o=new LeaderLine(e.target,e.relatedTarget,{color:n,size:1,path:"straight"});APPEALS.push({line:o,sheet:document.getElementById("flow").value}),e.relatedTarget.style.backgroundColor=n,e.relatedTarget.focus(),e.relatedTarget.value=""})}
function hideLine(){if(!APPEALS.length)return;const{value:e}=document.getElementById("flow");for(let t=APPEALS.length;t--;)APPEALS[t].sheet!==e?APPEALS[t].line.hide("none"):APPEALS[t].line.show("none")}
function rePosition(){if(!APPEALS.length)return;for(let e=APPEALS.length;e--;)APPEALS[e].line.position()}

function toNextRow(e) {
    const cellDiv = e.target.closest(".text");
    if (!cellDiv || e.key !== "Enter") return;
    if (e.metaKey || e.ctrlKey) {
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
        return;
    }
    setTimeout(() => {
        const content = cellDiv.innerHTML.trim();
        const doubleBrPattern = /<br\s*\/?>\s*<br\s*\/?>$/;
        const doubleDivPattern = /(<div>\s*(<br\s*\/?>)?\s*<\/div>\s*){2}$/;
        if (doubleBrPattern.test(content) || doubleDivPattern.test(content)) {
            if (doubleDivPattern.test(content)) {
                cellDiv.innerHTML = content.replace(doubleDivPattern, '');
            } else if (doubleBrPattern.test(content)) {
                cellDiv.innerHTML = content.replace(doubleBrPattern, '');
            }
            appendRow(e, null);
        }
    }, 0);
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
                th.classList.add(`col-${i}`);
                const savedText = localStorage.getItem(key) || `新しい列 ${i + 1}`;
                th.innerHTML = `${savedText} <span class="edit-icon">✏️</span>`;
                theadRow.appendChild(th);
            }
        } else if (currentHeaderCount > newColumnCount) {
            for (let i = currentHeaderCount; i > newColumnCount; i--) {
                theadRow.lastChild.remove();
            }
        }
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
                    td.className = `border col-${i}`;
                    td.id = i;
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

// === ▼ endEvidence関数を修正 ▼ ===
function endEvidence(e) {
    if (e.target.className !== "quot" || e.key !== "Enter") return;
    
    // --- Logic 1: Ctrl/Cmd + Enter ---
    if (e.metaKey || e.ctrlKey) {
        e.preventDefault();
        const div = document.createElement("div");
        div.className = "text";
        div.contentEditable = true;
        const newNode = e.target.parentNode.appendChild(div);
        newNode.focus();
        setOnFocus();
        return;
    }

    // --- Logic 2: Double Enter press ---
    // textareaの場合、\nで改行が入るので、それで判定
    setTimeout(() => {
        const textarea = e.target;
        if (textarea.value.endsWith('\n\n')) {
            textarea.value = textarea.value.trimEnd(); // 余分な改行を削除
            
            const div = document.createElement("div");
            div.className = "text";
            div.contentEditable = true;
            const newNode = textarea.parentNode.appendChild(div);
            newNode.focus();
            setOnFocus();
        }
    }, 0);
}
// === ▲ endEvidence関数 修正ここまで ▲ ===

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
    });

    updateTableColumns(numberOfColumns);
    
    document.getElementById("applyColumnCount").addEventListener("click", () => {
        const newCount = parseInt(document.getElementById("columnCount").value, 10);
        localStorage.setItem('columnCount', newCount);
        updateTableColumns(newCount);
    });

    document.addEventListener("keydown",toNextRow);
    document.addEventListener("keydown",endEvidence); // keydownのままでOK
    document.addEventListener("keydown",deleteEvidence);
    document.getElementById("flow").addEventListener("change",onChangeSheet);
    document.getElementById("Neg").style.display = "none";
});
