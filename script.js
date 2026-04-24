const undoStack = [];
const redoStack = [];
let focusedElementState = null;
let _lastFocusedQuot = null;
let numberOfColumns = 6;
const colorClasses = ['', 'red', 'blue'];

class ArrowManager {
    constructor() {
        this.arrows = [];
        this.rafId = null;
        this.svg = this._createSVG();
        const schedule = () => this._scheduleUpdate();
        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('resize', schedule, { passive: true });
    }

    _createSVG() {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:visible;';
        svg.innerHTML = `<defs>
            <marker id="arr-red" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                <path d="M0,0 L8,3 L0,6 Z" fill="rgba(255,0,0,0.6)"/>
            </marker>
            <marker id="arr-blue" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                <path d="M0,0 L8,3 L0,6 Z" fill="rgba(30,130,250,0.6)"/>
            </marker>
        </defs>`;
        document.body.appendChild(svg);
        return svg;
    }

    add(fromEl, toEl, color, sheet) {
        const isRed = color.includes('255');
        const markerId = isRed ? 'arr-red' : 'arr-blue';
        const strokeColor = isRed ? 'rgba(255,0,0,0.5)' : 'rgba(30,130,250,0.5)';
        const bgLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        bgLine.setAttribute('stroke', 'rgba(255,255,255,0.7)');
        bgLine.setAttribute('stroke-width', '3');
        this.svg.appendChild(bgLine);
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('stroke', strokeColor);
        line.setAttribute('stroke-width', '1.5');
        line.setAttribute('marker-end', `url(#${markerId})`);
        this.svg.appendChild(line);
        const arrow = { fromEl, toEl, sheet, lineEl: line, bgEl: bgLine };
        this.arrows.push(arrow);
        this._scheduleUpdate();
        return arrow;
    }

    setSheet(sheet) { this._scheduleUpdate(); }
    _scheduleUpdate() {
        if (this.rafId) return;
        this.rafId = requestAnimationFrame(() => { this._update(); this.rafId = null; });
    }

    _getBoundingRect(el) {
        const rect = el.getBoundingClientRect();
        return rect.height < 2 ? (el.closest('td')?.getBoundingClientRect() || rect) : rect;
    }

    _update() {
        const currentSheet = document.getElementById('flow')?.value;
        this.arrows.forEach(({ fromEl, toEl, sheet, lineEl, bgEl }) => {
            const visible = sheet === currentSheet;
            lineEl.style.display = bgEl.style.display = visible ? '' : 'none';
            if (!visible) return;
            const fr = this._getBoundingRect(fromEl);
            const tr = this._getBoundingRect(toEl);
            const x1 = fr.right, y1 = fr.top + fr.height / 2;
            const x2 = tr.left, y2 = tr.top + tr.height / 2;
            const angle = Math.atan2(y2 - y1, x2 - x1);
            const offset = 7;
            const ex = x2 - Math.cos(angle) * offset, ey = y2 - Math.sin(angle) * offset;
            [lineEl, bgEl].forEach(el => {
                el.setAttribute('x1', x1); el.setAttribute('y1', y1);
                el.setAttribute('x2', ex); el.setAttribute('y2', ey);
            });
        });
    }

    remove(arrow) {
        arrow.lineEl.remove(); arrow.bgEl.remove();
        const idx = this.arrows.indexOf(arrow);
        if (idx > -1) this.arrows.splice(idx, 1);
    }
}

const arrowManager = new ArrowManager();

// --- 列数調整機能の復元 ---
function updateTableColumns(newColumnCount) {
    if (newColumnCount < 1 || newColumnCount > 12) return;
    numberOfColumns = newColumnCount;
    const tables = [document.getElementById("Aff"), document.getElementById("Neg")];
    
    tables.forEach(table => {
        if (!table) return;
        const theadRow = table.querySelector('.part tr');
        const tbody = table.querySelector('tbody');
        
        // ヘッダーの調整
        while (theadRow.children.length < newColumnCount) {
            const th = document.createElement('th');
            const key = `${table.id.toLowerCase()}-col${theadRow.children.length + 1}`;
            th.setAttribute('data-key', key);
            const savedText = localStorage.getItem(key) || (table.id === "Aff" ? "肯定側" : "否定側");
            th.innerHTML = `${savedText} <span class="edit-icon">✏️</span>`;
            theadRow.appendChild(th);
        }
        while (theadRow.children.length > newColumnCount) {
            theadRow.lastElementChild.remove();
        }

        // 各行のセル調整
        tbody.querySelectorAll('tr').forEach(row => {
            while (row.children.length < newColumnCount) {
                const td = document.createElement('td');
                td.className = "border";
                td.id = row.children.length;
                const div = document.createElement('div');
                div.className = "text";
                div.contentEditable = true;
                td.appendChild(div);
                row.appendChild(td);
            }
            while (row.children.length > newColumnCount) {
                row.lastElementChild.remove();
            }
        });

        // 保存された色の適用
        theadRow.querySelectorAll('th').forEach((th, idx) => {
            const colorKey = th.getAttribute('data-key') + '-color';
            const savedColor = localStorage.getItem(colorKey) || '';
            applyColumnColor(th, savedColor);
        });
    });
    
    setupHeaderEditing();
    setOnStartEvidence();
    setOnFocus();
    setOnClick();
    rePosition();
}

function cycleHeaderColor(th) {
    const key = th.getAttribute('data-key') + '-color';
    const currentClass = colorClasses.find(c => c && th.classList.contains(c)) || '';
    const nextIndex = (colorClasses.indexOf(currentClass) + 1) % colorClasses.length;
    const newColorClass = colorClasses[nextIndex];
    localStorage.setItem(key, newColorClass);
    applyColumnColor(th, newColorClass);
}

function applyColumnColor(th, colorClass) {
    const table = th.closest('table');
    const thIndex = th.cellIndex;
    th.classList.remove('red', 'blue');
    if (colorClass) th.classList.add(colorClass);
    
    table.querySelectorAll('tbody tr').forEach(row => {
        const cell = row.cells[thIndex];
        if (cell) {
            cell.classList.remove('red', 'blue');
            if (colorClass) cell.classList.add(colorClass);
        }
    });
}

function setupHeaderEditing() {
    document.querySelectorAll('th').forEach(th => {
        const newTh = th.cloneNode(true);
        th.parentNode.replaceChild(newTh, th);
        newTh.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-icon')) {
                startEdit(newTh);
            } else {
                cycleHeaderColor(newTh);
            }
        });
    });
}

function startEdit(th) {
    let key = th.getAttribute('data-key');
    let oldText = th.childNodes[0].nodeValue.trim();
    let input = document.createElement('input');
    input.type = 'text';
    input.value = oldText;
    th.innerHTML = '';
    th.appendChild(input);
    input.focus();
    input.addEventListener('blur', () => saveEdit(th, key, input));
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') saveEdit(th, key, input); });
}

function saveEdit(th, key, input) {
    const newText = input.value.trim();
    localStorage.setItem(key, newText);
    th.innerHTML = `${newText} <span class="edit-icon">✏️</span>`;
    setupHeaderEditing();
}

// --- 他の基本機能 ---
function pushHistory(action) { undoStack.push(action); redoStack.length = 0; }

function setOnFocus() {
    const borders = document.getElementsByClassName("border");
    for (let i = borders.length; i--;) {
        borders[i].addEventListener("focus", e => {
            const div = e.target.getElementsByClassName("text")[0];
            if (div) { e.target.contentEditable = false; div.focus(); }
        });
    }
    const cells = document.querySelectorAll(".text,.quot");
    for (let i = cells.length; i--;) {
        const el = cells[i];
        if (el.className === "quot") el.addEventListener("focus", () => { _lastFocusedQuot = el; });
        if (el.className === "text") el.addEventListener("focus", (e) => {
            const quot = _lastFocusedQuot;
            _lastFocusedQuot = null;
            if (!quot || !quot.isConnected || Number(quot.parentNode.id) <= Number(e.target.parentNode.id)) return;
            const parentClass = quot.parentNode.className.match(/red|blue/)?.[0];
            const color = parentClass === "red" ? "rgb(255,0,0,0.5)" : "rgba(30,130,250,0.5)";
            const sheet = document.getElementById("flow").value;
            arrowManager.add(e.target, quot, color, sheet);
            quot.style.backgroundColor = color;
            quot.focus();
            quot.value = "";
        });
    }
}

function toNextRow(e) {
    if (!(e.metaKey || e.ctrlKey) || e.target.className.indexOf("text") === -1 || e.code !== "Enter") return;
    const currentSheet = document.getElementById("flow").value;
    const table = document.getElementById(currentSheet);
    const currentRow = e.target.closest('tr');
    const newRow = table.insertRow(currentRow.rowIndex + 1);
    const ths = table.querySelectorAll('.part th');
    for (let i = 0; i < ths.length; i++) {
        const td = document.createElement("td");
        td.className = "border " + (ths[i].classList.contains('red') ? 'red' : ths[i].classList.contains('blue') ? 'blue' : '');
        td.id = i;
        const div = document.createElement("div");
        div.className = "text";
        div.contentEditable = true;
        td.appendChild(div);
        newRow.appendChild(td);
    }
    setOnStartEvidence();
    newRow.cells[e.target.closest('td').cellIndex].querySelector('.text').focus();
}

function onStartEvidence(element) {
    return e => {
        element.style.height = 'auto';
        element.style.height = element.scrollHeight + 'px';
        if (e.target.textContent.endsWith('!') || e.target.textContent.endsWith("！")) {
            e.target.innerHTML = e.target.innerHTML.replace(/!|！/, "");
            const child = document.createElement("textarea");
            child.className = "quot";
            child.addEventListener("input", setTextareaHeight);
            e.target.parentNode.appendChild(child);
            child.focus();
        }
    };
}

function setTextareaHeight() { this.style.height = "auto"; this.style.height = this.scrollHeight + "px"; }
function onChangeSheet() { hideLine(); }
function hideLine() { arrowManager.setSheet(document.getElementById('flow').value); }
function rePosition() { arrowManager._scheduleUpdate(); }
function setOnStartEvidence() {
    const borders = document.getElementsByClassName('border');
    for (let i = borders.length; i--;) borders[i].addEventListener('input', onStartEvidence(borders[i]));
}
function setOnClick() {
    const borders = document.getElementsByClassName("border");
    for (let i = borders.length; i--;) borders[i].addEventListener("click", e => {
        if (e.target.className !== "text") e.target.querySelector('.text')?.focus();
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const applyBtn = document.getElementById("applyColumnCount");
    if (applyBtn) {
        applyBtn.addEventListener("click", () => {
            const newCount = parseInt(document.getElementById("columnCount").value, 10);
            updateTableColumns(newCount);
        });
    }
    updateTableColumns(numberOfColumns);
    document.addEventListener("keydown", toNextRow);
    document.getElementById("flow").addEventListener("change", onChangeSheet);
});

function openMemo() {
    document.getElementById('memoOverlay').classList.add('open');
    const memoText = document.getElementById('memoText');
    memoText.value = localStorage.getItem('flowsheet-memo') || '';
    memoText.focus();
}
function closeMemo() {
    localStorage.setItem('flowsheet-memo', document.getElementById('memoText').value);
    document.getElementById('memoOverlay').classList.remove('open');
}
function handleOverlayClick(e) { if (e.target === document.getElementById('memoOverlay')) closeMemo(); }

// フロー（Aff/Neg）の表示切り替え関数
function onChangeSheet() {
    const currentSheet = document.getElementById("flow").value;
    const affTable = document.getElementById("Aff");
    const negTable = document.getElementById("Neg");

    if (currentSheet === "Aff") {
        affTable.style.display = "";
        negTable.style.display = "none";
    } else if (currentSheet === "Neg") {
        affTable.style.display = "none";
        negTable.style.display = "";
    }
    
    // 矢印の位置などを再計算
    arrowManager.setSheet(currentSheet);
}

// 初期化処理の修正
document.addEventListener("DOMContentLoaded", () => {
    const flowSelect = document.getElementById("flow");
    
    // 切り替えイベントの登録
    flowSelect.addEventListener("change", onChangeSheet);
    
    // 初期状態の設定（Affを表示、Negを非表示）
    onChangeSheet();
    
    // --- その他の初期化 ---
    const applyBtn = document.getElementById("applyColumnCount");
    if (applyBtn) {
        applyBtn.addEventListener("click", () => {
            const newCount = parseInt(document.getElementById("columnCount").value, 10);
            updateTableColumns(newCount);
        });
    }
    updateTableColumns(numberOfColumns);
    document.addEventListener("keydown", toNextRow);
});
