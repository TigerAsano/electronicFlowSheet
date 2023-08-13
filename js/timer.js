let interval;

function timerStart(){

    const elements = {

        m : document.getElementById("minutes"),
        s : document.getElementById("seconds")

    }

    const total = elements.m.textContent * 60 + elements.s.textContent*1;

    let count = total|0;


    interval = setInterval(() => {

        count--;

        elements.m.textContent = Math.floor(count / 60);
        elements.s.textContent = count % 60;


        if(!count) clearInterval(interval);

    },1000)


}

function timerStop(){

    clearInterval(interval);

}
