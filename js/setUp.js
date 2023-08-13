

function setOnStartEvidence(){

    const textareas= document.getElementsByClassName('border');
    for (let i=textareas.length;i--;){
        
        const clientHeight = textareas[i].clientHeight;
    
        textareas[i].addEventListener('input',onStartEvidence(textareas[i],clientHeight));
    
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

setOnStartEvidence();
setOnFocus();
setOnClick();



document.addEventListener("keydown",toNextRow);
document.addEventListener("keydown",endEvidence);

document.getElementById("flow").addEventListener("change",onChangeSheet);

document.getElementById("Neg").style.display = "none";

document.getElementById("startTimer").addEventListener("click",timerStart);
document.getElementById("stopTimer").addEventListener("click",timerStop);
