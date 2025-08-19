const APPEALS = [];
let numberOfColumns = 6; 

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



/**
 * "Cmd/Ctrl + Enter"が押されたときに新しい行を追加するイベントを処理します。
 * カーソル以降のテキストは新しい行に移動します。
 * @param {KeyboardEvent} e - キーボードイベント
 */
function toNextRow(e) {
    // ショートカットキーが押されているか、対象の要素か、Enterキーかを確認
    if (!e.metaKey && !e.ctrlKey) return;
    const cellDiv = e.target.closest(".text");
    if (!cellDiv) return;
    if (e.code !== "Enter") return;

    // contentEditable要素内でのEnterキーのデフォルト動作（改行など）を防止
    e.preventDefault();

    // --- カーソル以降のテキストを抽出する処理 ---
    const selection = window.getSelection();
    let fragmentToMove = null;

    if (selection && selection.rangeCount > 0) {
        // 現在のカーソル位置からセルの末尾までを範囲とします
        const range = selection.getRangeAt(0);
        const rangeToEnd = range.cloneRange();
        rangeToEnd.setEnd(cellDiv, cellDiv.childNodes.length);

        // 範囲内のコンテンツをDocumentFragmentとして抽出します (元の場所からは削除されます)
        fragmentToMove = rangeToEnd.extractContents();
    }
    
    // 行を追加する処理を呼び出し、抽出したコンテンツを渡します
    appendRow(e, fragmentToMove);
}

/**
 * 列数を指定してテーブルの構造を更新する関数
 * @param {number} newColumnCount - 新しい列数
 */
function updateTableColumns(newColumnCount) {
    if (newColumnCount < 1) return;
    numberOfColumns = newColumnCount;

    const tables = [document.getElementById("Aff"), document.getElementById("Neg")];
    
    tables.forEach(table => {
        if (!table) return;

        const theadRow = table.querySelector('.part tr');
        const tbody = table.querySelector('tbody');

        // ヘッダーの列数を調整
        const headers = Array.from(theadRow.children);
        const currentHeaderCount = headers.length;

        if (currentHeaderCount < newColumnCount) {
            // 列を追加
            for (let i = currentHeaderCount; i < newColumnCount; i++) {
                const th = document.createElement('th');
                th.setAttribute('data-key', `${table.id.toLowerCase()}-col${i + 1}`);
                th.innerHTML = `新しい列 ${i + 1} <span class="edit-icon">✏️</span>`;
                theadRow.appendChild(th);
            }
        } else if (currentHeaderCount > newColumnCount) {
            // 列を削除
            for (let i = currentHeaderCount; i > newColumnCount; i--) {
                theadRow.lastChild.remove();
            }
        }

        // ボディの各行の列数を調整
        const rows = tbody.querySelectorAll('tr');
        rows.forEach(row => {
            const cells = Array.from(row.children);
            const currentCellCount = cells.length;

            if (currentCellCount < newColumnCount) {
                // セルを追加
                for (let i = currentCellCount; i < newColumnCount; i++) {
                    const td = document.createElement('td');
                    td.className = "border";
                    td.id = i;
                    const div = document.createElement('div');
                    div.className = "text";
                    div.contentEditable = true;
                    td.appendChild(div);
                    row.appendChild(td);
                }
            } else if (currentCellCount > newColumnCount) {
                // セルを削除
                for (let i = currentCellCount; i > newColumnCount; i--) {
                    row.lastChild.remove();
                }
            }
        });
    });

    // イベントリスナーを再設定
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
        let classList = Array.from(th.classList);
        let validClass = classList.find(cls => cls === 'red' || cls === 'blue');
        colors.push(validClass || '');
    });

    const newRow = table.insertRow(currentRow.rowIndex + 1);

    // ★★★ numberOfColumns を使用してセルを生成 ★★★
    for (let i = 0; i < numberOfColumns; i++) {
        const td = document.createElement("td");
        td.className = `border ${colors[i] || ''}`;
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
        // 高さを一度 'auto' に戻すことで、コンテンツが減った場合にセルが縮むようになります。
        element.style.height = 'auto';
        // コンテンツに合わせた新しい高さを取得します。
        const scrollHeight = element.scrollHeight;
        // 新しい高さを設定します。
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

/**
 * 全てのセルに高さ自動調整のイベントリスナーを設定します。
 */
function setOnStartEvidence(){
    const textareas = document.getElementsByClassName('border');
    for (let i = textareas.length; i--;){
        // clientHeightは不要になったため、引数をシンプルにします。
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

function initializeTables() {
    const tables = [document.getElementById("Aff"), document.getElementById("Neg")];

    tables.forEach(table => {
        if (!table) return;

        const headers = table.querySelectorAll('.part th');
        const colors = Array.from(headers).map(th => {
             let classList = Array.from(th.classList);
             return classList.find(cls => cls === 'red' || cls === 'blue') || '';
        });

        // 既存の最初の行を取得し、列数を調整
        const firstRow = table.querySelector('tbody tr');
        if (!firstRow) return;

        // 一旦中身をクリア
        firstRow.innerHTML = '';

        // 正しい列数でセルを再生成
        for (let i = 0; i < numberOfColumns; i++) {
            const td = document.createElement("td");
            td.className = `border ${colors[i] || ''}`;
            td.id = i;
            const div = document.createElement("div");
            div.className = "text";
            div.contentEditable = true;
            td.appendChild(div);
            firstRow.appendChild(td);
        }
    });
}



document.addEventListener("DOMContentLoaded", () => {
    // ページ読み込み時に初期列数でテーブルをセットアップ
    const initialColumnCount = document.getElementById("columnCount").value;
    numberOfColumns = parseInt(initialColumnCount, 10);
    updateTableColumns(numberOfColumns);

    // 「適用」ボタンにイベントリスナーを設定
    document.getElementById("applyColumnCount").addEventListener("click", () => {
        const newCount = parseInt(document.getElementById("columnCount").value, 10);
        updateTableColumns(newCount);
    });

    setOnStartEvidence();
    setOnFocus();
    setOnClick();
    document.addEventListener("keydown",toNextRow);
    document.addEventListener("keydown",endEvidence);
    document.addEventListener("keydown",deleteEvidence);
    document.getElementById("flow").addEventListener("change",onChangeSheet);
    document.getElementById("Neg").style.display = "none";
});
