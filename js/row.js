function toNextRow(e){

    if(!e.metaKey && !e.ctrlKey) return;
    if(e.srcElement.className.indexOf("text") === -1) return;
    if(e.code !== "Enter") return;
    
    const currentSheet = document.getElementById("flow").value;

    const table = document.getElementById(currentSheet);
    const rowIndex = e.srcElement.parentNode.parentNode.rowIndex;

    appendRow(e);

    rePosition();

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

    const newRow = table.insertRow(e.srcElement.parentNode.parentNode.rowIndex + 1);
    
    for(let i=0;i<6;i++){

        const td = document.createElement("td");
        td.className = "border " + colors[currentSheet][i];
        td.id = i;
        const div = document.createElement("div");
        div.className = "text";
        div.contentEditable = true;
        td.appendChild(div);
        newRow.appendChild(td);

    }

    setOnStartEvidence();
    
    for(const cell of newRow.cells){

        if(cell.id !== e.srcElement.parentNode.id) continue;
        cell.getElementsByClassName("text")[0].focus();

    }
    setOnFocus();
    setOnClick();
    setComparisonArea();


}


function setComparisonArea(){

    const table = document.getElementById("Neg");
    const rowNum = Math.ceil((table.rows.length - 1)/2); //headerを除く

    table.rows[1].cells[5].rowSpan = rowNum;
    table.rows[1+rowNum].cells[5].rowSpan = rowNum;

}


