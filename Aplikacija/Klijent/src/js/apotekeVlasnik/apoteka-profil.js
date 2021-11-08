import ApiClient from "../global/apiClient.js";

const api = new ApiClient();


let podaciApoteke = JSON.parse(sessionStorage.getItem('apotekaProfil'));

(async function ucitajStranicu() {
    postaviPodatkeApoteke();

    const zaposleni = await api.apoteka.vratiZaposlene(podaciApoteke.id);

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
          "lengthMenu": [[5, 10], [5, 10]],
          "iDisplayLength": 5,
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
              "info": "Prikazujem od _START_. do _END_. zaposlenog (Ukupno: _TOTAL_ zaposlena)",
              "key": "emptyTable",
              "value": "Nema podataka za prikaz",
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


        postaviAdresuApotekeUIzmeniModal();


    });

})();


function postaviPodatkeApoteke(){
  let idApoteke = document.getElementById("idApoteke");
  let adresaApoteke = document.getElementById("adresaApoteke");
  let gradApoteke = document.getElementById("gradApoteke");
  let telefonApoteke = document.getElementById("telefonApoteke");

  idApoteke.innerHTML = "ID apoteke: " + podaciApoteke.id.toString().bold();
  adresaApoteke.innerHTML = "Adresa apoteke:  " + podaciApoteke.adresa.bold();
  gradApoteke.innerHTML = "Grad: " + podaciApoteke.grad.bold();
  telefonApoteke.innerHTML = "Telefon: " + podaciApoteke.telefon.bold();


}


function postaviAdresuApotekeUIzmeniModal(){
    let adresaApoteke = document.getElementById("izmeniApotekuAdresa");
    adresaApoteke.value = podaciApoteke.adresa;

    let gradApoteke = document.getElementById("izmeniApotekuGrad");
    gradApoteke.value = podaciApoteke.grad;

    let telefonApoteke = document.getElementById("izmeniApotekuTelefon");
    telefonApoteke.value = podaciApoteke.telefon;


    let textObrisiApoteku = document.getElementById("modal-text-obrisiApoteku");
    textObrisiApoteku.innerHTML = "Da li ste sigurni da želite da obrišete apoteku čija je adresa " + podaciApoteke.adresa.bold() + "?";
}


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



const izmeniApotekuDugme = document.getElementById("izmeniApotekuDugme");
izmeniApotekuDugme.addEventListener("click", async function(){
    const adresaApoteke = document.getElementById("izmeniApotekuAdresa");
    const gradApoteke = document.getElementById("izmeniApotekuGrad");
    const telefonApoteke = document.getElementById("izmeniApotekuTelefon");


    if(adresaApoteke.value.length == 0){
        alert("Niste uneli adresu apoteke!");
        adresaApoteke.focus();
        return;
    }

    if(adresaApoteke.value.length > 30){
      alert("Maksimalan broj karaktera za adresu apoteke je 30!");
      adresaApoteke.focus();
      return;
    }

    //Grad
    if(gradApoteke.value.length == 0){
      alert("Niste napisali grad apoteke!");
      gradApoteke.focus();
      return;
    }

    if(gradApoteke.value.length > 30){
      alert("Maksimalan broj karaktera za grad apoteke je 30!");
      gradApoteke.focus();
      return;
    }

    //Telefon
    if(telefonApoteke.value.length == 0){
      alert("Niste upisali broj telefona!");
      telefonApoteke.focus();
      return;
    }   

    if(telefonApoteke.value.length > 20){
      alert("Maksimalan broj cifara za broj telefona je 20!");
      telefonApoteke.focus();
      return;
    }  





    let apoteka = {
        id: podaciApoteke.id,
        adresa: adresaApoteke.value,
        grad: gradApoteke.value,
        telefon: telefonApoteke.value
    };

    try{
      api.setHeader('Content-Type', 'application/json');
      await api.lanacApoteka.azurirajApoteku(podaciApoteke.id, apoteka); 
    
      podaciApoteke.adresa = adresaApoteke.value;
      podaciApoteke.grad = gradApoteke.value;
      podaciApoteke.telefon = telefonApoteke.value;

      sessionStorage.setItem('apotekaProfil', JSON.stringify(podaciApoteke));
      postaviPodatkeApoteke();
      alert('Uspešno ste izmenili podatke apoteke!');
    }
    catch(e){
      alert(`Došlo je do greške prilikom izmene podataka apoteke, pokušajte ponovo.\n${e.message}`);
    }

});




const dugmeObrisiApoteku = document.getElementById("dugmePotvrdiBrisanje");
dugmeObrisiApoteku.addEventListener("click", async function(){
    try{
        api.setHeader('Content-Type', 'application/json');
        await api.lanacApoteka.obrisiApoteku(podaciApoteke.id); 
      
        alert('Uspešno ste obrisali apoteku!');
        window.location.href = "apoteke.html";
      }
      catch(e){
        alert(`Došlo je do greške prilikom brisanja apoteke, pokušajte ponovo!\n${e.message}`);
      }
})

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

    const korisnickoImeZaposlenog = document.getElementById("dodajZaposlenogKorisnickoIme");
    const lozinkaZaposlenog = document.getElementById("dodajZaposlenogLozinka");
    const imeZaposlenog = document.getElementById("dodajZaposlenogIme");
    const prezimeZaposlenog = document.getElementById("dodajZaposlenogPrezime");
    const emailZaposlenog = document.getElementById("dodajZaposlenogEmail");
    const telefonZaposlenog = document.getElementById("dodajZaposlenogTelefon");
  
    if(korisnickoImeZaposlenog.value.length == 0){
        alert("Niste uneli korisničko ime!");
        korisnickoImeZaposlenog.focus();
        return;
    }

    if(korisnickoImeZaposlenog.value.length > 30){
      alert("Maksimalan broj karaktera korisničkog imena je 30!");
      korisnickoImeZaposlenog.focus();
      return;
    }

    if(lozinkaZaposlenog.value.length == 0){
        alert("Niste uneli lozinku!");
        lozinkaZaposlenog.focus();
        return;
    }

    if(lozinkaZaposlenog.value.length > 20){
      alert("Maksimalan broj karaktera za lozinku je 20!");
      lozinkaZaposlenog.focus();
      return;
    }

    if(imeZaposlenog.value.length == 0){
        alert("Niste uneli ime!");
        imeZaposlenog.focus();
        return;
    }

    if(imeZaposlenog.value.length > 20){
      alert("Maksimalan broj karaktera za ime je 20!");
      imeZaposlenog.focus();
      return;
    }

    if(prezimeZaposlenog.value.length == 0){
        alert("Niste uneli prezime!");
        prezimeZaposlenog.focus();
        return;
    }

    if(prezimeZaposlenog.value.length > 20){
      alert("Maksimalan broj karaktera za prezime je 20!");
      prezimeZaposlenog.focus();
      return;
    }

    if(emailZaposlenog.value.length == 0){
        alert("Niste uneli email!");
        emailZaposlenog.focus();
        return;
    }

    if(emailZaposlenog.value.length > 30){
      alert("Maksimalan broj karaktera za email je 30!");
      emailZaposlenog.focus();
      return;
    }

    if(telefonZaposlenog.value.length == 0){
        alert("Niste uneli broj telefona!");
        telefonZaposlenog.focus();
        return;
    }

    if(telefonZaposlenog.value.length > 20){
      alert("Maksimalan broj karaktera za broj telefona je 20!");
      telefonZaposlenog.focus();
      return;
    }


    const ulogaZaposlenog = Number(document.getElementById("dodajZaposlenogUloga").value);
    
    let apotekaId = podaciApoteke.id;
  
    const noviZaposleni = {
      username: korisnickoImeZaposlenog.value,
      ime: imeZaposlenog.value,
      prezime: prezimeZaposlenog.value,
      email: emailZaposlenog.value,
      telefon: telefonZaposlenog.value,
      uloga: ulogaZaposlenog,
    };
  
    try{
      api.setHeader('Content-Type', 'application/json');
      await api.apoteka.kreirajZaposlenog(apotekaId, noviZaposleni, lozinkaZaposlenog.value); 
    
      alert('Uspešno ste dodali novog zaposlenog!');
      window.location.reload();
    }
    catch(e){
      alert(`Došlo je do greške prilikom kreiranja zaposlenog.\n${e.message}`);
    }
});
  






function inputSamoBrojevi(){

  let izmeniApotekuTelefon = document.getElementById("izmeniApotekuTelefon");

  izmeniApotekuTelefon.addEventListener("input", function(){
    this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
  })

  let dodajZaposlenogTelefon = document.getElementById("dodajZaposlenogTelefon");

  dodajZaposlenogTelefon.addEventListener("input", function(){
    this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
  })

}

inputSamoBrojevi();