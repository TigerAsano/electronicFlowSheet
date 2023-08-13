const APPEALS = [];

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
            if(e.relatedTarget.parentNode.id === e.target.parentNode.id) return;

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

        console.log(APPEALS[i].sheet,value);


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

