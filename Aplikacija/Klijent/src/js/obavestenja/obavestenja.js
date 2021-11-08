import ApiClient from "../global/apiClient.js";
import {checkLogin} from "../global/checkUser.js";

const api = new ApiClient();


let ulogovaniKorisnik = await checkLogin();

if(ulogovaniKorisnik){
    let countObavestenja = 0;
    let dropdown = document.getElementById('dropdownObavestenja');

    const obavestenja = ulogovaniKorisnik.obavestenja;


    let novaObavestenja = obavestenja.filter(element => element.status == 1 || element.status == 2);

    if(novaObavestenja.length == 0){
        dodajLabeluNemaObavestenja();
    }

    obavestenja.forEach((element, index) => {
        if(element.status != 3){
            dodajObavestenje(element, index);
        }

        if(element.status == 1){
            let bellIkonica = document.getElementById("bellIkonica");
            bellIkonica.style.color = "red";
        }

    });


    let brojObavestenja = document.getElementById("brojObavestenja");
    if(countObavestenja === 0){
        brojObavestenja.parentNode.removeChild(brojObavestenja);
    }
    else{
        brojObavestenja.innerHTML = countObavestenja;
    }


    function dodajObavestenje(obavestenje, index){

        let div = document.createElement("div");
        div.setAttribute("idObavestenja", obavestenje.poruka.id);
        div.setAttribute("obavestenjeStatus", obavestenje.status);
        div.className = "dropdown-item";
        if(obavestenje.status == 1){
            countObavestenja += 1;
            div.className += " neprocitanaPoruka";
        }

        let div1 = document.createElement("div");
        div1.id = "tekstPoruke";
        let poruka = document.createElement("p");
        poruka.innerHTML = obavestenje.poruka.tekst;
        div1.appendChild(poruka);

        let button = document.createElement("button");
        button.className = "close";
        button.id = "obrisiObavestenje";
        button.setAttribute("type", "button");
        button.setAttribute("data-target", "dropdown");
        button.setAttribute("aria-label", "dropdown");
        button.setAttribute("style", "padding-left: 10px");
        button.setAttribute("idObavestenja", obavestenje.poruka.id);

        let span = document.createElement("span");
        span.setAttribute("aria-hidder", "true");
        span.innerHTML = "&times;";
        button.appendChild(span);
        div1.appendChild(button);

        div.appendChild(div1);

        let p = document.createElement("p");
        p.className = "small";
        p.innerHTML = prebaciVreme(obavestenje.poruka.datum);
        div.appendChild(p);


        dropdown.appendChild(div);
    }


    function dodajLabeluNemaObavestenja(){
        let div = document.createElement("div");
        div.className = "dropdown-item";
        let p = document.createElement("p");
        p.innerHTML = "Trenutno nema obaveštenja";
        p.style.display = "flex";
        p.style.justifyContent = "center";
        div.appendChild(p)
        dropdown.appendChild(div);
    }



    let buttonObrisiObavestenje = document.querySelectorAll("#obrisiObavestenje");
    buttonObrisiObavestenje.forEach(async (element) => {
        element.addEventListener("click", async function(){
            dropdown.removeChild(element.parentNode.parentNode);
            let idObavestenja = Number(element.attributes.idObavestenja.nodeValue);
            try{
                api.setHeader('Content-Type', 'application/json');
                await api.korisnik.obrisiObavestenje(idObavestenja);
            }
            catch(e){
                alert(`Došlo je do greške: ${e.message}`);
            }
        })
    });



    function prebaciVreme(vreme){
    //2021-06-02T16:44:08
    let vremeLista = vreme.toString().split("T");
    vremeLista[0] = vremeLista[0].split("-").reverse().join(".");
    return vremeLista[0] + " " + vremeLista[1].slice(0, 8);
    }



    $('#dropdownObavestenje').on('focusout', async function () {
        // samo hvata obavestenja koja imaju klass .neprocitanaPoruka
        // to su obavestenja koja imaju status 1 i kojima treba da se promeni status na 2
        let bellIkonica = document.getElementById("bellIkonica");
        bellIkonica.style.color = "white";
        let brojObavestenja = document.getElementById("brojObavestenja");
        if(brojObavestenja != null){
            brojObavestenja.parentNode.removeChild(brojObavestenja);
        }
        let obavestenjaNova = document.querySelectorAll(".neprocitanaPoruka");
        obavestenjaNova.forEach(async (element) => {
            let idObavestenja = Number(element.attributes.idObavestenja.nodeValue);
            element.classList.remove("neprocitanaPoruka");
            try{
                api.setHeader('Content-Type', 'application/json');
                await api.korisnik.pogledajObavestenje(idObavestenja);
            }
            catch(e){
                alert(`Došlo je do greške: ${e.message}`);
            }
        });
    });
}