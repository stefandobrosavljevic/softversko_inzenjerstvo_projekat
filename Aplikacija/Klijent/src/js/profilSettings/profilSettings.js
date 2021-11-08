import ApiClient from "../global/apiClient.js";
import {checkLogin} from "../global/checkUser.js";

let ulogovaniKorisnik = await checkLogin().then(value => value);

const api = new ApiClient();



(function ucitajStranicu(){
    ucitajPodatke();
})();

function ucitajPodatke(){

    let ime = document.querySelector(".imeZaposleni");
    ime.innerHTML = ulogovaniKorisnik.ime;

    let prezime = document.querySelector(".prezimeZaposleni");
    prezime.innerHTML = ulogovaniKorisnik.prezime;

    let userName = document.querySelector(".userNameZaposleni");
    userName.innerHTML = "Korisničko ime: " + ulogovaniKorisnik.username;

    let email = document.querySelector(".emailZaposleni");
    email.innerHTML = "Email: " + ulogovaniKorisnik.email;

    let telefon = document.querySelector(".telefonZaposleni");
    telefon.innerHTML = "Telefon:  " + ulogovaniKorisnik.telefon;

    let uloga = document.querySelector(".ulogaZaposleni");
    uloga.innerHTML = vratiUlogu(ulogovaniKorisnik.uloga);


    if(ulogovaniKorisnik.uloga != 4){
      let apoteka = document.querySelector(".apotekaZaposleni");
      apoteka.innerHTML = "Apoteka: " + ulogovaniKorisnik.apoteka.adresa;
    }
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



let dugmeIzmeniZaposlenog = document.querySelector(".dugmeIzmeniZaposlenog");
dugmeIzmeniZaposlenog.addEventListener('click', function(){

    let email = document.querySelector("#izmeniZaposlenogEmail");
    email.value = ulogovaniKorisnik.email;

    let telefon = document.querySelector("#izmeniZaposlenogTelefon");
    telefon.value = ulogovaniKorisnik.telefon;
});




let dugmeSacuvaj = document.getElementById("dugmeSacuvajZaposlenog");
dugmeSacuvaj.addEventListener('click', async function(){

    let lozinka = document.querySelector("#izmeniZaposlenogLozinka").value;
    let email = document.querySelector("#izmeniZaposlenogEmail").value;
    let telefon = document.querySelector("#izmeniZaposlenogTelefon").value;

    if(lozinka.length === 0){
      lozinka = "";
    }

    if(lozinka.length > 20){
      alert("Maksimalan broj karaktera za lozinku je 20!");
      ime.focus();
      return;
    }

    if(email === ulogovaniKorisnik.email || !validateEmail(email)){
      email = "";
    }

    if(email.length > 30){
      alert("Maksimalan broj karaktera za email je 30!");
      ime.focus();
      return;
    }

    if(telefon === ulogovaniKorisnik.telefon){
      telefon = "";
    }

    if(telefon.length > 20){
      alert("Maksimalan broj karaktera za telefon je 20!");
      ime.focus();
      return;
    }


    let izmenjeniPodaci = {
      lozinka: lozinka,
      email: email,
      telefon: telefon,
    }

    try
    {
        api.setHeader('Content-Type', 'application/json');

        await api.korisnik.izmeniLicniNalog(izmenjeniPodaci);

        if(email.length != 0){
          ulogovaniKorisnik.email = email;
        }
        if(telefon.length != 0){
          ulogovaniKorisnik.telefon = telefon;
        }

        ucitajPodatke();
        
        alert(`Uspešno ste izmenili podatke naloga sa korisničkim imenom ${ulogovaniKorisnik.username}!`);
    }
    catch(e)
    {
        alert(`Došlo je do greške prilikom izmene zaposlenog, pokušajte ponovo.\n${e.message}`);
    }
});



if(ulogovaniKorisnik.uloga === 4){
  let box = document.querySelector(".podaci-pozicija");

  let div = document.createElement("div");
  let label = document.createElement("label");
  label.id = "labelInterfejs";
  label.innerHTML = "Administratorski režim";


  let lbl = document.createElement("label");
  lbl.className = "switch";
  let checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = "checkboxInterfejs";
  lbl.appendChild(checkbox);
  let span = document.createElement("span");
  span.className = "slider round";
  lbl.appendChild(span);



  div.appendChild(label);
  div.appendChild(lbl);

  box.appendChild(div);

  const checked = sessionStorage.getItem("vlasnikInterfejs");
  if(checked){
    checkbox.checked = true;
    dodajOpadajuciMeniApoteke();
  }

  checkbox.addEventListener('change', function() {
    if(this.checked){
      sessionStorage.setItem("vlasnikInterfejs", this.checked);
    } 
    else {
      sessionStorage.removeItem("vlasnikInterfejs");
    }
    window.location.reload();
  })

}



async function dodajOpadajuciMeniApoteke(){
  let apoteke;
  try{
    apoteke = await api.lanacApoteka.vratiApoteke();
  }
  catch(e){
    alert(`Došlo je do greške prilikom pribavljanja apoteka.\n ${e.message}`);
  }
  let box = document.querySelector(".podaci-pozicija");
  let div = document.createElement("div");
  div.id = "vlasnikIzabranaApoteka";
  let labela = document.createElement("label");
  labela.innerHTML = "Izabrana apoteka: ";
  div.appendChild(labela);
  let select = document.createElement("select");
  select.className = "form-control";
  select.id = "selectApoteke";

  
    

  apoteke.forEach(element => {
    let option = document.createElement("option");
    option.value = element.id;
    option.text = element.adresa + ", " + element.grad;
    select.appendChild(option);
  });

  div.appendChild(select);
  box.appendChild(div);
  

  api.setHeader('Content-Type', 'application/json');

  try{
    if(ulogovaniKorisnik.apoteka.id){
      select.value = ulogovaniKorisnik.apoteka.id;
    }
    await api.korisnik.izmeniIzabranuApoteku(select.value);
  }
  catch(e){
    alert(`Došlo je do greške prilikom postavljanja apoteke.\n${e.message}`);
    sessionStorage.removeItem("vlasnikInterfejs");
    window.location.reload();
  }


  select.addEventListener("change", async function(){
    try{
      await api.korisnik.izmeniIzabranuApoteku(select.value);
    }
    catch(e){
      select.value = ulogovaniKorisnik.apoteka.id;
      alert(`Došlo je do greške prilikom promene apoteke.\n${e.message}`);
      window.location.reload();
    }
  })


}




const togglePasword = document.querySelector("#togglePassword");
const password = document.querySelector('#izmeniZaposlenogLozinka');
togglePasword.addEventListener("click", function(){
    const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
    password.setAttribute('type', type);
    // toggle the eye slash icon
    this.classList.toggle('fa-eye-slash');
});





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