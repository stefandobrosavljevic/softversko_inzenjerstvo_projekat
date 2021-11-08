import ApiClient from "../global/apiClient.js";
import {checkLogin} from "../global/checkUser.js";

let ulogovaniKorisnik = await checkLogin().then(value => value);

const api = new ApiClient();

(async function ucitajStranicu() {
    const zaposleni = await api.apoteka.vratiZaposlene(ulogovaniKorisnik.apoteka.id);

    let dataSet = [];

    zaposleni.forEach(element => {
        dataSet.push({
            UserName: element.username, 
            Ime: element.ime,  
            Prezime: element.prezime, 
            Email: element.email,
            Telefon: element.telefon,
            Uloga: brojUUlogu(element.uloga),
            PodaciZaposlenog: JSON.stringify(element),
        });
    });


    $(document).ready(function() {
        const table = $('#zaposleniTable').DataTable({
          "iDisplayLength": 25,
          data: dataSet,
            columns: [
                { data: "Ime" },
                { data: "Prezime" },
                { data: "Email" },
                { data: "Telefon" },
                { data: "Uloga" },
                { 
                  data: null, class: 'PrikazZaposlenog', 
                  defaultContent: '<button id="buttonPrikazZaposlenog">Prikaz</button>',
                  orderable: false,
                },
            ],
    
            "language": {
              "search": "Pretraži:",
              "info": "Prikazujem od _START_. do _END_. zaposlena (Ukupno: _TOTAL_ zaposlena)",
              "key": "emptyTable",
              "value": "Nema zaposlenih za prikaz",
              "zeroRecords": "Nema rezultata za datu pretragu",
              "lengthMenu": "Prikaži _MENU_ zaposlena",
              "loadingRecords": "Učitavam...",
              "paginate": {
                "first": "Prva",
                "last": "Zadnja",
                "next": "Sledeća",
                "previous": "Prethodna",
              },
              "aria": {
                "sortAscending":
                ": activate to sort column ascending",
                "sortDescending": ": activate to sort column descending"
              },
              "infoEmpty": "Prikazujem 0 od 0 (Ukupno: 0 zaposlena)",
              "infoFiltered": "(Filtrirano od ukupno _MAX_ zaposlena)",
            },
        });


        table.on("click", "#buttonPrikazZaposlenog", function(){
          const aData = table.row($(this).parents('tr')).data()
          const data = aData.PodaciZaposlenog;
          sessionStorage.setItem("zaposleniData", data);
          window.location.href = 'zaposleniProfil.html';
        })

    });


    // Ako je ulogovan vlasnik, kad on dodaje zaposlenog, on mora da odabere u kojoj apoteci on dodaje tog zaposlenog
    if(ulogovaniKorisnik.uloga === 4){
      let select = document.getElementById('dodajZaposlenogUloga');
      let opt = document.createElement('option');
      opt.appendChild( document.createTextNode('Upravnik') );
      opt.value = '3'; 
      select.appendChild(opt);

      opt = document.createElement('option');
      opt.appendChild( document.createTextNode('Vlasnik') );
      opt.value = '4'; 
      select.appendChild(opt);

      let modalBodyForm = document.getElementById("modal-body-forma");

      let div = document.createElement("div");
      div.className = "form-group";
      let label = document.createElement("label");
      label.className = "col-form-label";
      label.innerHTML = "Apoteka";
      div.appendChild(label);

      select = document.createElement("select");
      select.id = "dodajZaposlenogApotekaId";
      select.className = "form-control";
      

      const apoteke = await api.lanacApoteka.vratiApoteke();
      apoteke.forEach(element => {
        opt = document.createElement('option');
        opt.appendChild( document.createTextNode(element.adresa) );
        opt.value = element.id; 
        select.appendChild(opt);
      });

      div.appendChild(select);
      modalBodyForm.appendChild(div);
    } 

})();



const togglePasword = document.querySelector("#togglePassword");
const password = document.querySelector('#dodajZaposlenogLozinka');

togglePasword.addEventListener("click", function(){
    const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
    password.setAttribute('type', type);
    // toggle the eye slash icon
    this.classList.toggle('fa-eye-slash');
});


const dodajZaposlenogSacuvajDugme = document.getElementById("dodajZaposlenogSacuvajDugme");
dodajZaposlenogSacuvajDugme.addEventListener('click', async function(){
  // TO-DO Ovde ide provera da li si uneo VALIDNE podatke

  const korisnickoImeZaposlenog = document.getElementById("dodajZaposlenogKorisnickoIme");
  const lozinkaZaposlenog = document.getElementById("dodajZaposlenogLozinka");
  const imeZaposlenog = document.getElementById("dodajZaposlenogIme");
  const prezimeZaposlenog = document.getElementById("dodajZaposlenogPrezime");
  const emailZaposlenog = document.getElementById("dodajZaposlenogEmail");
  const telefonZaposlenog = document.getElementById("dodajZaposlenogTelefon");

  if(korisnickoImeZaposlenog.value.length == 0){
    alert("Niste uneli korisničko ime zaposlenog!");
    korisnickoImeZaposlenog.focus();
    return;
  }

  if(korisnickoImeZaposlenog.value.length > 30){
    alert("Maksimalan broj karaktera korisničko ime zaposlenog je 30!");
    korisnickoImeZaposlenog.focus();
    return;
  }

  if(lozinkaZaposlenog.value.length == 0){
      alert("Niste uneli lozinku zaposlenog!");
      lozinkaZaposlenog.focus();
      return;
  }

  if(lozinkaZaposlenog.value.length > 20){
    alert("Maksimalan broj karaktera za lozinku zaposlenog je 20!");
    lozinkaZaposlenog.focus();
    return;
  }

  if(imeZaposlenog.value.length == 0){
      alert("Niste uneli ime zaposlenog!");
      imeZaposlenog.focus();
      return;
  }

  if(imeZaposlenog.value.length > 20){
    alert("Maksimalan broj karaktera za ime zaposlenog je 20!");
    imeZaposlenog.focus();
    return;
  }

  if(prezimeZaposlenog.value.length == 0){
      alert("Niste uneli prezime zaposlenog!");
      prezimeZaposlenog.focus();
      return;
  }

  if(prezimeZaposlenog.value.length > 20){
    alert("Maksimalan broj karaktera za prezime zaposlenog je 20!");
    prezimeZaposlenog.focus();
    return;
  }

  if(emailZaposlenog.value.length == 0 || !validateEmail(emailZaposlenog.value)){
    alert("Niste napisali email zaposlenog!");
    emailZaposlenog.focus();
    return;
  }

  if(emailZaposlenog.value.length > 30){
    alert("Maksimalan broj karaktera za email zaposlenog je 30!");
    emailZaposlenog.focus();
    return;
  }



  if(telefonZaposlenog.value.length == 0){
      alert("Niste uneli telefon zaposlenog!");
      telefonZaposlenog.focus();
      return;
  }

  if(telefonZaposlenog.value.length > 20){
    alert("Maksimalan broj karaktera za telefon zaposlenog je 20!");
    telefonZaposlenog.focus();
    return;
  } 



  const ulogaZaposlenog = Number(document.getElementById("dodajZaposlenogUloga").value);


  let apotekaId;
  if(ulogovaniKorisnik.uloga === 4){
    apotekaId = Number(document.getElementById("dodajZaposlenogApotekaId").value);
  }
  else{
    apotekaId = ulogovaniKorisnik.apoteka.id;
  }

  const noviZaposleni = {
    username: korisnickoImeZaposlenog.value,
    ime: imeZaposlenog.value,
    prezime: prezimeZaposlenog.value,
    email: emailZaposlenog.value,
    telefon: telefonZaposlenog.value,
    uloga: ulogaZaposlenog,
  };

  try
  {
    //ali kad vlasnik kreira zaposlenog, mora da odabere u kojoj apoteci kreira zaposlenog
    api.setHeader('Content-Type', 'application/json');
    await api.apoteka.kreirajZaposlenog(apotekaId, noviZaposleni, lozinkaZaposlenog.value); 
  
    alert('Uspešno ste dodali novog zaposlenog!');
    window.location.reload();
  }
  catch(e)
  {
    alert(`Došlo je do greške prilikom dodavanja zaposlenog.\n${e.message}`);
  }
});




function brojUUlogu(uloga){
  switch(uloga){
    case 1: 
      return "Farmaceutski tehničar";
    case 2:
      return "Diplomirani farmaceut";
    case 3:
      return "Upravnik";
    case 4:
      return "Vlasnik";
    default:
      return "";
  }
}




function validateEmail(email){
  var re = /\S+@\S+\.\S+/;
  return re.test(email);
}



function inputSamoBrojevi(){

  let telefonZaposlenog = document.getElementById("dodajZaposlenogTelefon");


  telefonZaposlenog.addEventListener("input", function(){
    this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
  })

}

inputSamoBrojevi();