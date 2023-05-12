function setEditedData(str){

    const obj = JSON.parse(str);

    for(const [key,html] of Object.entries(obj)){

        if(key === "head") {

            document.getElementsByClassName("head")[0].outerHTML = html;

            continue;

        }

        
        document.getElementById(key).outerHTML = html;

    }

}

window.onload = function(){

    const oldFlowData = localStorage.getItem(window.location.href);

    setEditedData(oldFlowData);

}

document.addEventListener("keydown",e => {

    if(!e.altKey) return;
    if(!e.ctrlKey) return;
    if(e.key !== "s") return;


    const Aff = document.getElementById("Aff").outerHTML;
    const Neg = document.getElementById("Neg").outerHTML;
    const head = document.getElementsByClassName("head")[0].outerHTML;

    const flowData = {
        Aff,Neg,head
    };

    localStorage.setItem(window.location.href,JSON.stringify(flowData));

});

document.addEventListener("keydown",e => {

    if(!e.altKey) return;
    if(!e.ctrlKey) return;
    if(e.key !== "d") return;

    localStorage.removeItem(window.location.href);

})



