import ApiClient from "../global/apiClient.js";
import {checkLogin} from "../global/checkUser.js";

let ulogovaniKorisnik = await checkLogin().then(value => value);


const zaposleni = JSON.parse(sessionStorage.getItem("zaposleniData"));

const api = new ApiClient();

(function ucitajStranicu(){
    ucitajPodatke();
})();

function ucitajPodatke(){

    let ime = document.querySelector(".imeZaposleni");
    ime.innerHTML = zaposleni.ime;

    let prezime = document.querySelector(".prezimeZaposleni");
    prezime.innerHTML = zaposleni.prezime;

    let userName = document.querySelector(".userNameZaposleni");
    userName.innerHTML = "Korisničko ime: " + zaposleni.username;

    let email = document.querySelector(".emailZaposleni");
    email.innerHTML = zaposleni.email;

    let telefon = document.querySelector(".telefonZaposleni");
    telefon.innerHTML = "Telefon:  " + zaposleni.telefon;

    let uloga = document.querySelector(".ulogaZaposleni");
    uloga.innerHTML = vratiUlogu(zaposleni.uloga);
};


function vratiUlogu(ulogaID)
{
  switch(ulogaID){
    case 1:
      return "Farmaceutski tehničar";
    case 2:
      return "Diplomirani farmaceut";
    case 3:
      return "Upravnik apoteke";
    case 4:
      return "Vlasnik";
    default: throw new Error(`ID uloge nije validan! (${ulogaID})`);
  };
}


// IZMENA ZAPOSLENOG
let dugmeIzmeniZaposlenog = document.querySelector(".dugmeIzmeniZaposlenog");
dugmeIzmeniZaposlenog.addEventListener('click', function(){

    let ime = document.querySelector("#izmeniZaposlenogIme");
    ime.value = zaposleni.ime;

    let prezime = document.querySelector("#izmeniZaposlenogPrezime");
    prezime.value = zaposleni.prezime;

    let email = document.querySelector("#izmeniZaposlenogEmail");
    email.value = zaposleni.email;

    let telefon = document.querySelector("#izmeniZaposlenogTelefon");
    telefon.value = zaposleni.telefon;
});


let dugmeSacuvaj = document.getElementById("dugmeSacuvajZaposlenog");
dugmeSacuvaj.addEventListener('click', async function(){

    const ime = document.querySelector("#izmeniZaposlenogIme");
    const prezime = document.querySelector("#izmeniZaposlenogPrezime");
    const email = document.querySelector("#izmeniZaposlenogEmail");
    const telefon = document.querySelector("#izmeniZaposlenogTelefon");

    if(ime.value.length == 0){
      alert("Niste uneli ime zaposlenog!");
      ime.focus();
      return;
    }

    if(ime.value.length > 20){
      alert("Maksimalan broj karaktera ime zaposlenog je 20!");
      ime.focus();
      return;
    }

    if(prezime.value.length == 0){
        alert("Niste napisali prezime zaposlenog!");
        prezime.focus();
        return;
    }

    if(prezime.value.length > 20){
      alert("Maksimalan broj karaktera za prezime zaposlenog je 20!");
      prezime.focus();
      return;
    }

    if(email.value.length == 0 || !validateEmail(email.value)){
        alert("Niste napisali email zaposlenog!");
        email.focus();
        return;
    }

    if(email.value.length > 30){
      alert("Maksimalan broj karaktera za email zaposlenog je 30!");
      email.focus();
      return;
    }

    if(telefon.value.length == 0){
        alert("Niste napisali telefon zaposlenog!");
        telefon.focus();
        return;
    }

    if(telefon.value.length > 20){
      alert("Maksimalan broj karaktera telefon zaposlenog je 20!");
      telefon.focus();
      return;
    }


    const objZaposleni = {
        ime: ime.value,
        prezime: prezime.value,
        email: email.value,
        telefon: telefon.value,
    };

    try
    {
        api.setHeader('Content-Type', 'application/json');

        await api.apoteka.azurirajZaposlenog(zaposleni.apoteka.id, zaposleni.username, objZaposleni);

        zaposleni.ime = ime.value;
        zaposleni.prezime = prezime.value;
        zaposleni.email = email.value;
        zaposleni.telefon = telefon.value;
        sessionStorage.setItem("zaposleniData", JSON.stringify(zaposleni));
        ucitajPodatke();
        
        alert(`Uspešno ste izmenili podatke naloga sa korisničkim imenom ${zaposleni.username}!`);
    }
    catch(e)
    {
        alert(`Došlo je do greške prilikom izmene zaposlenog, pokušajte ponovo.\n${e.message}`);
    }
});

   

if(zaposleni.username == ulogovaniKorisnik.username){
  let dugmeObrisiZaposlenog = document.querySelector(".dugmeObrisiZaposlenog");
  dugmeObrisiZaposlenog.parentNode.removeChild(dugmeObrisiZaposlenog);
}
else{
  obrisiZaposlenogEventListener();
}

// BRISANJE ZAPOSLENOG

  function obrisiZaposlenogEventListener(){
  let dugmeObrisiZaposlenog = document.getElementById("dugmePotvrdiBrisanje");
  dugmeObrisiZaposlenog.addEventListener('click', async function(){

      try
      {
          api.setHeader('Content-Type', 'application/json');
          await api.apoteka.obrisiZaposlenog(zaposleni.apoteka.id, zaposleni.username);

          //sessionStorage.setItem("zaposleniData", "");
          sessionStorage.removeItem("zaposleniData");
          
          alert(`Uspešno ste obrisali nalog sa korisničkim imenom ${zaposleni.username}!`);
          

          window.location.href = "zaposleni.html";
      }
      catch(e)
      {
          alert(`Došlo je do greške prilikom brisanja zaposlenog, pokušajte ponovo.\n${e.message}`);
      }
  });
}




let modalObrisiZaposlenog = document.querySelector(".modal-text-obrisiZaposlenog");
modalObrisiZaposlenog.innerHTML = 'Da li zaista želite da obrišete zaposlenog ' + zaposleni.ime + ' ' + zaposleni.prezime + '?';


function validateEmail(email){
  var re = /\S+@\S+\.\S+/;
  return re.test(email);
}



function inputSamoBrojevi(){
  let izmeniZaposlenogTelefon = document.getElementById("izmeniZaposlenogTelefon");


  izmeniZaposlenogTelefon.addEventListener("input", function(){
    this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
  })

}

inputSamoBrojevi();

