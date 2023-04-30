function toNextRow(e){

    if(!e.metaKey && !e.ctrlKey) return;
    if(e.srcElement.className.indexOf("text") === -1) return;
    if(e.code !== "Enter") return;
    
    const currentSheet = document.getElementById("flow").value;

    const table = document.getElementById(currentSheet);
    const rowLength = table.rows.length;
    const rowIndex = e.srcElement.parentNode.parentNode.rowIndex;


    if(rowIndex === rowLength -1 ){
        appendRow(e);
        return;
    }

    for(const cell of table.rows[rowIndex+1].cells){

        if(cell.id !== e.srcElement.parentNode.id) continue;
        cell.getElementsByClassName("text")[0].focus();

    }


}

function appendRow(e){

    const currentSheet = document.getElementById("flow").value;

    const table = document.getElementById(currentSheet);

    const colors = {
        "Aff" : ["red","blue","blue","red","blue","red"],
        "Neg" : ["blue","red","red","blue","red"]
    };

    const tr = document.createElement("tr");
    
    for(let i=0;i<6;i++){

        const td = document.createElement("td");
        td.className = "border " + colors[currentSheet][i];
        td.id = i;
        const div = document.createElement("div");
        div.className = "text";
        div.contentEditable = true;
        td.appendChild(div);
        tr.appendChild(td);

    }

    const newRow = table.appendChild(tr);

    setOnStartEvidence();
    
    for(const cell of newRow.cells){

        if(cell.id !== e.srcElement.parentNode.id) continue;
        cell.getElementsByClassName("text")[0].focus();

    }
    setOnFocus();
    setOnClick();

}


