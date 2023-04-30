function onStartEvidence(textarea,clientHeight) {

    return e => {

        textarea.style.height = clientHeight + 'px';
        const scrollHeight = textarea.scrollHeight;
        textarea.style.height = scrollHeight + 'px';
    
            if(e.target.textContent.endsWith('!')||e.target.textContent.endsWith("！")){
    
                e.target.textContent = e.target.textContent.replace(/!|！/,"");
                const child = appendEvidence(e.target.parentNode);                    
                child.focus();
                child.setSelectionRange(0,2);
        
            }
    }

}
    
function appendEvidence(parent){

    const newElement = document.createElement("textarea");
    newElement.value = '資料';
    newElement.className = "quot";
    return parent.appendChild(newElement);

}

function endEvidence(e){

    if(!e.metaKey) return;
    if(e.srcElement.className !== "quot") return;
    if(e.code !== "Enter") return
    const div = document.createElement("div");
    div.className = "text";
    div.contentEditable = true;
    const newNode = e.target.parentNode.appendChild(div);

    newNode.focus();                    
}

