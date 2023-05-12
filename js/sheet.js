function onChangeSheet() {

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

};

document.getElementById("flow").addEventListener("change", onChangeSheet) ;

console.log("hoge");

