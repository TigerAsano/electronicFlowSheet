const APPEALS = [];
let numberOfColumns = 6;
const colorClasses = ['', 'color-red', 'color-blue'];

// ... (関数の大部分は変更なし) ...
function attachEventListenersToHeaders(){document.querySelectorAll("th").forEach(e=>{constt=e.cloneNode(!0);e.parentNode.replaceChild(t,e),t.addEventListener("click",n=>{"edit-icon"===n.target.classList[0]?enterEditMode(t):cycleHeaderColor(t)})})}
function enterEditMode(e){let t=e.getAttribute("data-key"),n=e.childNodes[0].nodeValue.trim(),o=document.createElement("input");o.type="text",o.value=n,e.innerHTML="",e.appendChild(o),o.focus();const l=()=>saveEdit(e,t,o);o.addEventListener("blur",l),o.addEventListener("keydown",e=>{"Enter"===e.key&&(o.removeEventListener("blur",l),l())})}
function cycleHeaderColor(e){const t=e.getAttribute("data-key")+"-color",n=(colorClasses.indexOf(e.dataset.colorClass||"")+1)%colorClasses.length,o=colorClasses[n];localStorage.setItem(t,o),applyColumnColor(e,o)}
function applyColumnColor(e,t){const n=e.closest("table"),o=e.cellIndex,l=colorClasses.filter(e=>e);e.classList.remove(...l),e.dataset.colorClass=t,t&&e.classList.add(t),n.querySelectorAll("tbody tr").forEach(e=>{const n=e.cells[o];n&&(n.classList.remove(...l),t&&n.classList.add(t))})}
function saveEdit(e,t,n){let o=n.value.trim();localStorage.setItem(t,o),e.innerHTML=o+'<spanclass="edit-icon">✏️</span>'}
function setOnFocus(){const border=document.getElementsByClassName("border");for(let e=border.length;e--;){border[e].addEventListener("focus",e=>{const t=e.target.getElementsByClassName("text");e.target.contentEditable=!1,t[0].focus()}),border[e].getElementsByClassName("text")[0].addEventListener("blur",e=>e.target.contentEditable=!0)}const e=document.querySelectorAll(".text,.quot");for(let t=e.length;t--;)e[t].addEventListener("focus",e=>{if(!e.relatedTarget)return;if(e.relatedTarget===e.target)return;if("quot"!==e.relatedTarget.className)return;if(e.relatedTarget.parentNode.id<=e.target.parentNode.id)return;const t=e.relatedTarget.parentNode.className.match(/red|blue/g)?.[0],n="red"===t?"rgb(255, 0, 0,0.5)":"rgba(30, 130, 250, 0.5)",o=new LeaderLine(e.target,e.relatedTarget,{color:n,size:1,path:"straight"});APPEALS.push({line:o,sheet:document.getElementById("flow").value}),e.relatedTarget.style.backgroundColor=n,e.relatedTarget.focus(),e.relatedTarget.value=""})}
function hideLine(){if(!APPEALS.length)return;const{value:e}=document.getElementById("flow");for(let t=APPEALS.length;t--;)APPEALS[t].sheet!==e?APPEALS[t].line.hide("none"):APPEALS[t].line.show("none")}
function rePosition(){if(!APPEALS.length)return;for(let e=APPEALS.length;e--;)APPEALS[e].line.position()}
function toNextRow(e){const t=e.target.closest(".text");if(t&&"Enter"===e.key){if(e.metaKey||e.ctrlKey){e.preventDefault();const n=window.getSelection();let o=null;if(n&&n.rangeCount>0){const e=n.getRangeAt(0),t=e.cloneRange();t.setEnd(cellDiv,cellDiv.childNodes.length),o=t.extractContents()}return void appendRow(e,o)}setTimeout(()=>{const n=t.innerHTML.trim(),o=/<br\s*\/?>\s*<br\s*\/?>$/,l=/(<div>\s*(<br\s*\/?>)?\s*<\/div>\s*){2}$/;(o.test(n)||l.test(n))&&(l.test(n)?t.innerHTML=n.replace(l,""):o.test(n)&&(t.innerHTML=n.replace(o,"")),appendRow(e,null))},0)}}
function updateTableColumns(e){if(!(e<1)){numberOfColumns=e;const t=[document.getElementById("Aff"),document.getElementById("Neg")];t.forEach(t=>{if(t){const n=t.querySelector(".part tr"),o=t.querySelector("tbody"),l=Array.from(n.children),c=l.length;if(c<e)for(leti=c;i<e;i++){const e=document.createElement("th"),o=`${t.id.toLowerCase()}-col${i+1}`;e.setAttribute("data-key",o),e.classList.add(`col-${i}`);const l=localStorage.getItem(o)||`新しい列 ${i+1}`;e.innerHTML=`${l} <spanclass="edit-icon">✏️</span>`,n.appendChild(e)}else if(c>e)for(let t=c;t>e;t--)n.lastChild.remove();n.querySelectorAll("th").forEach(e=>{const t=e.getAttribute("data-key")+"-color",n=localStorage.getItem(t)||"";applyColumnColor(e,n)});const a=o.querySelectorAll("tr");a.forEach(t=>{const o=Array.from(t.children),l=o.length;if(l<e)for(leti=l;i<e;i++){const e=document.createElement("td");e.className=`border col-${i}`,e.id=i;const o=n.children[i];o&&o.dataset.colorClass&&e.classList.add(o.dataset.colorClass);const l=document.createElement("div");l.className="text",l.contentEditable=!0,e.appendChild(l),t.appendChild(e)}else if(l>e)for(let n=l;n>e;n--)t.lastChild.remove()})}}),attachEventListenersToHeaders(),setOnStartEvidence(),setOnFocus(),setOnClick(),rePosition()}}
function appendRow(e,t){const n=document.getElementById("flow").value,o=document.getElementById(n),l=e.target.closest("tr"),c=e.target.closest("td");if(l&&c){const a=c.cellIndex,s=[];o.querySelectorAll(".part th").forEach(e=>{s.push(e.dataset.colorClass||"")});const r=o.insertRow(l.rowIndex+1);for(leti=0;i<numberOfColumns;i++){const e=document.createElement("td");e.className=`border col-${i} ${s[i]||""}`,e.id=i;const t=document.createElement("div");t.className="text",t.contentEditable=!0,e.appendChild(t),r.appendChild(e)}setOnStartEvidence();const d=r.cells[a];if(d){const e=d.querySelector(".text");if(e){t&&t.hasChildNodes()&&e.appendChild(t),e.focus();const n=window.getSelection();if(n){const t=document.createRange();t.selectNodeContents(e),t.collapse(!1),n.removeAllRanges(),n.addRange(t)}}}setOnFocus(),setOnClick()}}
function onStartEvidence(e){return t=>{e.style.height="auto";const n=e.scrollHeight;e.style.height=n+"px",(t.target.textContent.endsWith("!")||t.target.textContent.endsWith("！"))&&(t.target.innerHTML=t.target.innerHTML.replace(/!|！/,""),appendEvidence(t.target.parentNode).focus())}}
function appendEvidence(e){const t=document.createElement("textarea");return t.value="T",t.className="quot",t.addEventListener("input",setTextareaHeight),e.appendChild(t)}
function endEvidence(e){if("quot"===e.target.className&&"Enter"===e.key){if(e.metaKey||e.ctrlKey){e.preventDefault();const t=document.createElement("div");t.className="text",t.contentEditable=!0,e.target.parentNode.appendChild(t).focus(),setOnFocus()}else setTimeout(()=>{const t=e.target;t.value.endsWith("\n\n")&&(t.value=t.value.trimEnd(),(e=>{const t=document.createElement("div");t.className="text",t.contentEditable=!0,e.target.parentNode.appendChild(t).focus(),setOnFocus()})(e))},0)}}
function deleteEvidence(e){if(e.metaKey||e.ctrlKey){if("quot"!==e.srcElement.className)return;if("Backspace"!==e.code)return;e.srcElement.closest("td")?.querySelectorAll(".text").focus(),e.srcElement.remove()}}
function setTextareaHeight(){this.style.height="auto",this.style.height=`${this.scrollHeight}px`}
function onChangeSheet(e){const{value:t}=document.getElementById("flow");"Neg"===t?(document.getElementById("Aff").style.display="none",document.getElementById("Neg").style.display="block",document.getElementById("Neg").style.display=""):("none"===(document.getElementById("Neg").style.display="none"),document.getElementById("Aff").style.display="blcok",document.getElementById("Aff").style.display=""),hideLine()}
function setOnStartEvidence(){const e=document.getElementsByClassName("border");for(let t=e.length;t--;)e[t].addEventListener("input",onStartEvidence(e[t]));setOnFocus()}
function setOnClick(){const e=document.getElementsByClassName("border");for(let t=e.length;t--;)e[t].addEventListener("click",t=>{"text"!==t.target.className&&t.target.children[0].focus()})}

// === ▼ Excel出力機能を追加 ▼ ===

/**
 * テーブルのデータをExcelファイルとしてエクスポートします。
 */
function exportToExcel() {
    const wb = XLSX.utils.book_new(); // 新しいワークブックを作成

    // 処理するテーブルのIDとシート名のペア
    const tablesToExport = [
        { id: 'Aff', sheetName: '肯定側フロー' },
        { id: 'Neg', sheetName: '否定側フロー' }
    ];

    tablesToExport.forEach(tableInfo => {
        const table = document.getElementById(tableInfo.id);
        if (!table) return;

        const data = [];
        // ヘッダー行を抽出
        const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.childNodes[0].nodeValue.trim());
        data.push(headers);

        // ボディ行を抽出
        table.querySelectorAll('tbody tr').forEach(row => {
            const rowData = Array.from(row.querySelectorAll('td')).map(td => {
                // セル内のdivとtextareaの両方のテキストを結合
                const texts = Array.from(td.childNodes).map(node => {
                    if (node.nodeName === 'DIV' || node.nodeName === 'TEXTAREA') {
                        return node.textContent || node.value;
                    }
                    return '';
                }).filter(text => text.trim() !== '');
                return texts.join('\n\n'); // 複数の要素がある場合は改行で区切る
            });
            data.push(rowData);
        });
        
        // ワークシートを作成してワークブックに追加
        const ws = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, tableInfo.sheetName);
    });

    // ファイルをダウンロード
    XLSX.writeFile(wb, 'flowsheet.xlsx');
}

document.addEventListener("DOMContentLoaded", () => {
    // ... (既存のDOMContentLoaded内の処理は変更なし) ...
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
    document.addEventListener("keydown",endEvidence);
    document.addEventListener("keydown",deleteEvidence);
    document.getElementById("flow").addEventListener("change",onChangeSheet);
    document.getElementById("Neg").style.display = "none";

    // ▼▼▼ Excel出力のショートカットキーを追加 ▼▼▼
    document.addEventListener("keydown", e => {
        if (e.ctrlKey && e.altKey && e.key === 'e') {
            e.preventDefault(); // ブラウザのデフォルト動作を防ぐ
            exportToExcel();
        }
    });
});
