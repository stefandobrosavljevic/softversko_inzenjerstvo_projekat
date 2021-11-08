import ApiClient from "../global/apiClient.js";
import {checkLogin} from "../global/checkUser.js";

let ulogovaniKorisnik = await checkLogin().then(value => value);


const api = new ApiClient();


const lek = JSON.parse(sessionStorage.getItem("lekData"));

(function ucitajStranicu(){
    ucitajPodatke();
})();

function ucitajPodatke(){

    let ime = document.querySelector(".imeLeka");
    ime.innerHTML = lek.podaciLeka.ime;

    let sifra = document.querySelector(".sifraLeka");
    sifra.innerHTML = "Šifra: " + lek.podaciLeka.sifra;

    let cena = document.querySelector(".product-price");
    cena.innerHTML = lek.podaciLeka.cena + " RSD";

    let opis = document.querySelector(".opisLeka");
    opis.innerHTML = lek.podaciLeka.opis;

    let kolicina = document.querySelector(".kolicinaLeka");
    kolicina.innerHTML = "Količina u apoteci:  " + lek.kolicina + " kutija";


    let kriticnaKolicina = document.querySelector(".kriticnakolicinaLeka");
    kriticnaKolicina.innerHTML = "Kritična količina:  " + lek.kriticnaKolicina + " kutija";
    

    let deljiv = document.querySelector(".deljivostLeka");
    deljiv.innerHTML = (lek.deljiv === true) ? "Deljiv" : "Nije deljiv";
    if(lek.deljiv === true){
        deljiv.innerHTML += ".\tBroj tabli u kutiji: " + lek.podaciLeka.brojTabli;
    }


    
};




  
const uloga = ulogovaniKorisnik.uloga;
if(uloga > 1){
    dodavanjeButtons();
}

function dodavanjeButtons(){
    let buttons = document.querySelector(".dugmiciZaLek");

    let button = document.createElement("button");
    button.type = "button";
    button.innerHTML = "Izmeni";
    button.className = "dugmeIzmeniLek";
    button.setAttribute("data-toggle", "modal");
    button.setAttribute("data-target", "#ModalIzmeniLek");
    buttons.appendChild(button);

    button = document.createElement("button");
    button.type = "button";
    button.innerHTML = "Obriši lek";
    button.className = "dugmeObrisiLek";
    button.setAttribute("data-toggle", "modal");
    button.setAttribute("data-target", "#ModalObrisiLek");
    buttons.appendChild(button);


    // IZMENA LEKA
    let dugmeIzmeniLek = document.querySelector(".dugmeIzmeniLek");
    dugmeIzmeniLek.addEventListener('click', function(){

        let ime = document.querySelector("#izmeniLekIme");
        ime.value = lek.podaciLeka.ime;

        let cena = document.querySelector("#izmeniLekCena");
        cena.value = lek.podaciLeka.cena;

        let opis = document.querySelector("#izmeniLekOpis");
        opis.value = lek.podaciLeka.opis;

        let kolicina = document.querySelector("#izmeniLekKolicina");
        kolicina.value = lek.kolicina;

        let kriticnaKolicina = document.querySelector("#izmeniLekKriticnaKolicina");
        kriticnaKolicina.value = lek.kriticnaKolicina;

        let deljiv = document.querySelector("#izmeniLekDeljiv");
        deljiv.value = (lek.deljiv === true) ? "Da" : "Ne";

    });

    let dugmeSacuvajLek = document.getElementById("dugmeSacuvajLek");
    dugmeSacuvajLek.addEventListener('click', async function(){

        const ime = document.getElementById("izmeniLekIme");
        const cena = document.getElementById("izmeniLekCena");
        const opis = document.getElementById("izmeniLekOpis");
        const kolicina = document.getElementById("izmeniLekKolicina");
        const kriticnaKolicina = document.getElementById("izmeniLekKriticnaKolicina");
        const deljiv = (document.getElementById("izmeniLekDeljiv").value === "Da") ? true : false;
 

        if(ime.value.length == 0){
            alert("Niste uneli ime leka!");
            ime.focus();
            return;
        }
        console.log(ime.value.length);
        if(ime.value.length > 50){
            alert("Maksimalan broj karaktera za ime leka je 50!");
            ime.focus();
            return;
        }


        if(cena.value.length == 0){
            alert("Niste uneli cenu leka!");
            cena.focus();
            return;
        }
        if(cena.value > 30000){
            alert("Maksimalna cena leka je 30000!");
            cena.focus();
            return;
        }

        if(opis.value.length == 0){
            alert("Niste uneli opis leka!");
            opis.focus();
            return;
        }
        if(opis.value.length > 100){
            alert("Maksimalan broj karaktera za opis leka je 100!");
            opis.focus();
            return;
        }

        if(kolicina.value.length == 0){
            alert("Niste uneli količinu u apoteci leka!");
            kolicina.focus();
            return;
        }
        if(kolicina.value > 5000){
            alert("Maksimalna količina leka je 5000!");
            kolicina.focus();
            return;
          }

        if(kriticnaKolicina.value.length == 0){
            alert("Niste uneli kritičnu količinu leka!");
            kriticnaKolicina.focus();
            return;
        }
        if(kriticnaKolicina.value > 1000){
            alert("Maksimalna kritična količina leka je 1000!");
            kriticnaKolicina.focus();
            return;
          }



        lek.podaciLeka.ime = ime.value;
        lek.podaciLeka.cena = cena.value;
        lek.podaciLeka.opis = opis.value;
        lek.kolicina = kolicina.value;
        lek.kriticnaKolicina = kriticnaKolicina.value;
        lek.deljiv = deljiv;


        const objLek = {
            kolicina: lek.kolicina,
            kriticnaKolicina: lek.kriticnaKolicina,
            deljiv: lek.deljiv,
            podaciLeka: {
                ime: lek.podaciLeka.ime,
                opis: lek.podaciLeka.opis,
                slika: "default.png",
                cena: lek.podaciLeka.cena,
                brojTabli: lek.podaciLeka.brojTabli
            }
        };

        try{
            api.setHeader('Content-Type', 'application/json');
            await api.apoteka.azurirajLek(ulogovaniKorisnik.apoteka.id, lek.podaciLeka.sifra, objLek); 
            ucitajPodatke();
            sessionStorage.setItem("lekData", JSON.stringify(lek));
            alert(`Uspešno ste izmenili podatke za lek ${lek.podaciLeka.ime}!`);
        }
        catch(e)
        {
            alert(`Došlo je do greške prilikom izmene leka ${lek.podaciLeka.ime}, pokušajte ponovo.\n ${e.message}`);
        }
    
        // Ako je sve okej, docicemo do ovog dela koda, ovde moze da se uradi refresh stranice -> spisaklekova
    });



    let modalObrisiLek = document.querySelector(".modal-text-obrisiLek");
    modalObrisiLek.innerHTML = 'Da li zaista želite da obrišete lek ' + lek.podaciLeka.ime.bold() + ' iz baze lekova?';



    // BRISANJE LEKA
    let dugmePotvrdiBrisanje = document.getElementById("dugmePotvrdiBrisanje");
    dugmePotvrdiBrisanje.addEventListener("click", async function(){
        try
        {
            api.setHeader('Content-Type', 'application/json');
            await api.lanacApoteka.obrisiLekIzBaze(lek.podaciLeka.sifra);

            sessionStorage.removeItem("lekData");
            
            alert(`Uspešno ste obrisali lek ${lek.podaciLeka.ime}!`);

            window.location.href = "spisakLekova.html";
        }
        catch(e)
        {
            alert(`Došlo je do greške prilikom brisanja leka ${lek.podaciLeka.ime}, pokušajte ponovo.\n${e.message}`);
        }
    });
}




function inputSamoBrojevi(){

    let cena = document.getElementById("izmeniLekCena");
    cena.addEventListener("input", function(){
      this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    })
  
    let kolicina = document.getElementById("izmeniLekKolicina");
    kolicina.addEventListener("input", function(){
      this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    })

    let kriticnaKolicina = document.getElementById("izmeniLekKriticnaKolicina");
    kriticnaKolicina.addEventListener("input", function(){
      this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    })
  
  }
  
  inputSamoBrojevi();