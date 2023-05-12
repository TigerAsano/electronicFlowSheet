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
            if(e.relatedTarget.parentNode.id === e.target.parentNode.id) return
        
            e.relatedTarget.value = e.target.textContent;
            
            const color = e.target.parentNode.className.match(/red|blue/g);
            e.relatedTarget.style.color = color;
        
            e.relatedTarget.focus();

        });
    }

}

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

document.getElementById("today").textContent =  new Intl.DateTimeFormat('ja-JP').format(new Date()).replaceAll("/","-");
document.getElementById("Neg").style.display = "none";


