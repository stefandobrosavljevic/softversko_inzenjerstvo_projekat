import ApiClient from "../global/apiClient.js";
import {checkLogin} from "../global/checkUser.js";

let ulogovaniKorisnik = await checkLogin().then(value => value);


const api = new ApiClient();

(function ucitaj(){
  ucitajStranicu();
})();

async function ucitajStranicu() {
    const porudzbine = await api.apoteka.vratiPorudzbine(ulogovaniKorisnik.apoteka.id);


    let dataSet = [];

    porudzbine.forEach(element => {
        dataSet.push({
            ID: element.id, 
            Datum: prebaciVreme(element.datum.replace("T", " ")),  
            Kreirao: element.kreirao, 
            Potvrdio: element.potvrdio,
            PoruceniLekovi: JSON.stringify(element.poruceniLekovi),
        });
    });


    $(document).ready(function() {
        const table = $('#porudzbineTable').DataTable({
          "iDisplayLength": 10,
          data: dataSet,
            columns: [
                { data: "ID", class: 'idPorudzbine'},
                { data: "Kreirao" },
                { data: "Potvrdio" },
                { data: "Datum" },
                { 
                  data: null, class: 'PrikazPorudzbine', 
                  defaultContent: '<button id="buttonPrikazPorudzbine" data-toggle="modal" data-target="#ModalPorudzbina">Prikaz</button>',
                  orderable: false,
                },
            ],
            "order": [[ 2, "asc" ], [0, "desc"]],
            "language": {
              "search": "Pretraži:",
              "info": "Prikazujem od _START_. do _END_. porudžbina (Ukupno: _TOTAL_ porudžbina)",
              "key": "emptyTable",
              "value": "Nema porudžbina za prikaz",
              "zeroRecords": "Nema rezultata za datu pretragu",
              "lengthMenu": "Prikaži _MENU_ porudžbina",
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
              "infoEmpty": "Prikazujem 0 od 0 (Ukupno: 0 porudžbina)",
              "infoFiltered": "(Filtrirano od ukupno _MAX_ porudžbina)",
            },
        });

        // Prikaz odabrane porudzbine
        table.on("click", "#buttonPrikazPorudzbine", function(){
          const aData = table.row( $(this).parents('tr') ).data();
          sessionStorage.setItem("odabranaPorudzbina", JSON.stringify(aData));
          let data = aData.PoruceniLekovi;
          ucitajModul(data);
        });

        
    });
};



// DODAVANJE PORUDZBINE
let dugmeDodajPorudzbinu = document.querySelector(".dugmeDodajPorudzbinu");
dugmeDodajPorudzbinu.addEventListener("click", async function(){
  const novaPorudzbina = {
    kreirao: ulogovaniKorisnik.ime + " " + ulogovaniKorisnik.prezime,
  };
  try{
      api.setHeader('Content-Type', 'application/json');
      await api.apoteka.kreirajPorudzbinu(ulogovaniKorisnik.apoteka.id, novaPorudzbina);
      alert(`Uspešno ste dodali novu porudzbinu`);
      window.location.reload();
  }
  catch(e){
      alert(`Došlo je do greške prilikom dodavanja porudžbine, pokušajte ponovo.\n ${e.message}`);
  }
});

let eventListenerKreiran = 0;

function ucitajModul(data){

  if ( $.fn.dataTable.isDataTable( '#porudzbinaLekovi' ) ) {
    $('#porudzbinaLekovi').empty();
    $('#porudzbinaLekovi').DataTable().destroy();
    $('#porudzbinaLekovi').html("");
  }

  let listaLekova = JSON.parse(data);
  sessionStorage.setItem("ListaPorucenihLekova", JSON.stringify(listaLekova));
  let tabelaLekovi = $("#porudzbinaLekovi").DataTable({
    data:listaLekova,
    columns: [
      {data: "sifraLeka", class: "sifraLekaPorudzbina"},
      {data: "podaci.ime"},
      {
        data: null,
        class: "kolicinaLeka",
        defaultContent: `<input class="kolicinaLekaInput" value=""/>`,
        "orderable": false,
      },
      {
        data: null,
        defaultContent: "<button class='buttonIzbaciLekPorudzbina'>Izbaci</button>",
        orderable: false,
      }
    ],
    destroy: true,
    "language": {
      "search": "Pretraži:",
      "info": "Prikazujem od _START_. do _END_. lekova (Ukupno: _TOTAL_ lekova)",
      "key": "emptyTable",
      "value": "Nema lekova za prikaz",
      "zeroRecords": "Nema lekova za prikaz",
      "lengthMenu": "Prikaži _MENU_ lekova",
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
      "infoEmpty": "Prikazujem 0 od 0 (Ukupno: 0 lekova)",
      "infoFiltered": "(Filtrirano od ukupno _MAX_ lekova)",
    },
    "paging": false,
    "info": false,
  })

  // DA SE NE PRIKAZUJE KOD VEC POTVRDJENIH PORUDZBINA DA SE MOGU IZBACIVATI LEKOVI
  if (JSON.parse(sessionStorage.getItem("odabranaPorudzbina")).Potvrdio.length > 0) {
    $('#porudzbinaLekovi').empty();
    $('#porudzbinaLekovi').DataTable().destroy();
    tabelaLekovi = $("#porudzbinaLekovi").DataTable({
      data:listaLekova,
        columns: [
          {data: "sifraLeka", class: "sifraLekaPorudzbina"},
          {data: "podaci.ime"},
          {
            data: null,
            class: "kolicinaLeka",
            defaultContent: `<input class="kolicinaLekaInput" value=""/>`,
            "orderable": false,
          },
          {
            data:null,
            "visible": false
          }
        ],
        "paging": false,
        "info": false,
        "language": {
          "search": "Pretraži:",
        },
      });
  };

  
  
  const uloga = ulogovaniKorisnik.uloga;

  let modalLekoviFooter = document.getElementById('ModalPorudzbinaLekoviFooter');
  if (JSON.parse(sessionStorage.getItem("odabranaPorudzbina")).Potvrdio.length < 1) {
    if(uloga > 2){
      let button = document.createElement("button");
      button.type = "button";
      button.innerHTML = "Prihvati porudžbinu";
      button.className = "btn btn-success";
      button.id = "PotvrdiPorudzbinu";
      modalLekoviFooter.appendChild(button);

      button = document.createElement("button");
      button.type = "button";
      button.innerHTML = "Obriši porudžbinu";
      button.className = "btn btn-danger";
      button.id = "OdbijPorudzbinu";
      button.setAttribute("data-toggle", "modal");
      button.setAttribute("data-target", "#ModalObrisiPorudzbinu");
      modalLekoviFooter.appendChild(button);
    }
    let button = document.createElement("button");
    button.type = "button";
    button.innerHTML = "Dodaj lekove";
    button.className = "btn btn-warning";
    button.id = "DodajLekovePorudzbina";
    button.setAttribute("data-toggle", "modal");
    button.setAttribute("data-target", "#ModalPorudzbinaDodajLek");
    modalLekoviFooter.appendChild(button);
  }


  // Ubacivanje kolicine porucenih kutija u input da bi on mogao da se menja
    tabelaLekovi.rows().every(function(){
      let pom = this.data();
      var inputi = document.querySelectorAll(".kolicinaLekaInput");
      inputi.forEach(function(input) {
        if(input.parentNode.parentNode.firstChild.innerHTML == pom.sifraLeka){
          input.value = pom.kolicina;
        }
        // DA NE MOZE DA SE MENJA INPUT KOD VEC POTVRDJENIH LEKOVA
        if(JSON.parse(sessionStorage.getItem("odabranaPorudzbina")).Potvrdio.length > 0){
          input.readOnly = true;
        }
        
        input.addEventListener("input", function(){
          this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
        });

      });
    })

    tabelaLekovi.on("click", ".buttonIzbaciLekPorudzbina", async function(){
      try{
        if(tabelaLekovi.row( $(this).parents('tr') ).data()){
          api.setHeader('Content-Type', 'application/json');
          let idPorudzbine = JSON.parse(sessionStorage.getItem("odabranaPorudzbina")).ID;
          await api.apoteka.obrisiLekIzPorudzbine(ulogovaniKorisnik.apoteka.id, idPorudzbine, tabelaLekovi.row( $(this).parents('tr') ).data().sifraLeka);
          alert(`Uspešno ste izbacili lek ${tabelaLekovi.row( $(this).parents('tr') ).data().podaci.ime} iz porudžbine!`);
    
          window.location.reload();
        }
      }
      catch(e){
        alert(`Došlo je do greške prilikom izbacivanja leka iz porudžbine, pokušajte ponovo.\n${e.message}`);
      }
    });


    tabelaLekovi.on("focusout", ".kolicinaLekaInput", async function(){
      let aData = tabelaLekovi.row( $(this).parents() ).data();
      if(aData && this.value > 0 && aData.kolicina != this.value){
        try
        {
          api.setHeader('Content-Type', 'application/json');
          let id = JSON.parse(sessionStorage.getItem("odabranaPorudzbina")).ID;
          await api.apoteka.izmeniKolicinuLeka(ulogovaniKorisnik.apoteka.id, id, aData.sifraLeka, Number(this.value)); 

          let odbrPorudzbina = JSON.parse(sessionStorage.getItem("odabranaPorudzbina"));
          let prcLekovi = JSON.parse(odbrPorudzbina.PoruceniLekovi);
          for(let i = 0; i < prcLekovi.length; i++){
            if(prcLekovi[i].podaci.sifra == aData.sifraLeka){
              prcLekovi[i].kolicina = Number(this.value);
            }
          }

          odbrPorudzbina.PoruceniLekovi = JSON.stringify(prcLekovi);
          sessionStorage.setItem("odabranaPorudzbina", JSON.stringify(odbrPorudzbina));

          alert(`Uspešno ste izmenili količinu leka ${aData.podaci.ime} za poručivanje!`);
          window.location.reload();
        }
        catch(e)
        {
          alert(`Došlo je do greške prilikom izmene količine leka, pokušajte ponovo.\n${e.message}`);
        }
      }
    });

    const DodajLekovePorudzbina = document.querySelectorAll("#DodajLekovePorudzbina");
    DodajLekovePorudzbina.forEach(function(el) {
      el.addEventListener("click", function(){
        UcitajModulDodavanjeLekova(listaLekova);
      })
    })



    const PotvrdiPorudzbinu = document.getElementById("PotvrdiPorudzbinu");
    if(PotvrdiPorudzbinu != null){
      PotvrdiPorudzbinu.addEventListener("click", async function(){
        let idPorudzbine = JSON.parse(sessionStorage.getItem("odabranaPorudzbina")).ID;
        const potvrdjenaPorudzbina = {
          potvrdio: ulogovaniKorisnik.ime + " " + ulogovaniKorisnik.prezime,
        };
        try{
          api.setHeader('Content-Type', 'application/json');
          await api.apoteka.potvrdiPorudzbinu(ulogovaniKorisnik.apoteka.id, idPorudzbine, potvrdjenaPorudzbina); 
        
          alert(`Uspešno ste potvrdili porudžbinu sa ID ${idPorudzbine}!`);
          window.location.reload();
        }
        catch(e){
          alert(`Došlo je do greške prilikom potvrđivanja porudžbine, pokušajte ponovo.\n${e.message}`);
        }
      });
    }


};










async function odbijPorudzbinuEventListener(){
    let idPorudzbine = JSON.parse(sessionStorage.getItem("odabranaPorudzbina")).ID;
    try{
      api.setHeader('Content-Type', 'application/json');
      await api.apoteka.obrisiPorudzbinu(ulogovaniKorisnik.apoteka.id, idPorudzbine); 
    
      alert(`Uspešno ste obrisali porudžbinu sa ID ${idPorudzbine}!`);
      window.location.reload();
    }
    catch(e){
      alert(`Došlo je do greške prilikom brisanja porudžbine, pokušajte ponovo!\n${e.message}`);
    }
}


$('#ModalObrisiPorudzbinu').on('shown.bs.modal', function () {
  const dugmeOdbijPorudzbinu = document.getElementById("dugmePotvrdiBrisanje");
  if(dugmeOdbijPorudzbinu != null){
    dugmeOdbijPorudzbinu.addEventListener("click", odbijPorudzbinuEventListener);
  }
});


$('#ModalObrisiPorudzbinu').on('hidden.bs.modal', function () {
  const dugmeOdbijPorudzbinu = document.getElementById("dugmePotvrdiBrisanje");
  dugmeOdbijPorudzbinu.removeEventListener("click", odbijPorudzbinuEventListener);
});







// KAD ZATVORI PORUDZBINU ZA PRIKAZ LEKOVA, DATATABLE MORA DA SE 
// UNISTI ZA SLUCAJ DA SE OTVORI TA ISTA PORUDZBINA PONOVO
$('#ModalPorudzbina').on('hidden.bs.modal', function () {
  $('#porudzbinaLekovi').empty();
  $("#porudzbinaLekovi").DataTable().destroy();


  let modalLekoviFooter = document.getElementById("ModalPorudzbinaLekoviFooter");
  while (modalLekoviFooter.firstChild) {
    //modalLekoviFooter.firstChild.remove();
    modalLekoviFooter.removeChild(modalLekoviFooter.firstChild);
  }
});










async function UcitajModulDodavanjeLekova(vecPoruceniLekovi){
  let lekovi = await api.apoteka.vratiALekove(ulogovaniKorisnik.apoteka.id);
  lekovi = iseciListuLekova(lekovi, vecPoruceniLekovi);
  let dataSet = [];
  lekovi.forEach(element => {
      dataSet.push({
        Sifra: element.podaciLeka.sifra, 
        Ime: element.podaciLeka.ime,  
        Cena: element.podaciLeka.cena, 
        Kolicina: element.kolicina,
        'Broj tabli': element.podaciLeka.brojTabli,
        Deljiv: ((element.deljiv === true) ? "Da, "+element.podaciLeka.brojTabli+" table" : "Ne"),
        Podaci: JSON.stringify(element),
      });
  })

  let dodatiLekovi = new Array();
  let tablePorudzbinaLekovi;

  if ( $.fn.dataTable.isDataTable( '#porudzbinaSpisakLekova' ) ) {
    $('#porudzbinaSpisakLekova').empty();
    $('#porudzbinaSpisakLekova').DataTable().destroy();
    $('#porudzbinaSpisakLekova').html("");
  }
  
  $(document).ready(function() {
    tablePorudzbinaLekovi = $('#porudzbinaSpisakLekova').DataTable({
      "iDisplayLength": 10,
      data: dataSet,
        columns: [
            { data: "Sifra", class: 'sifraasd'},
            { data: "Ime" },
            {
              data: null,
              class: "kolicinaLekaPorudzbina",
              defaultContent: `<input class="kolicinaLekaZaPorudzbinu" value="0"/>`,
            },
        ],
        destroy: true,
        "info": false,
        "lengthChange": false,
        "language": {
          "search": "Pretraži:",
          "info": "Prikazujem od _START_. do _END_. leka (Ukupno: _TOTAL_ lekova)",
          "zeroRecords": "Trenutno nema lekova za prikaz",
          "loadingRecords": "Učitavam...",
          "paginate": {
            "first": "Prva",
            "last": "Zadnja",
            "next": "Sledeća",
            "previous": "Prethodna",
          },
        },
    });

    tablePorudzbinaLekovi.on("focusout", ".kolicinaLekaZaPorudzbinu", function(){
      let aData = tablePorudzbinaLekovi.row( $(this).parents() ).data();
      if(this.value > 0 && aData){
          aData.kolicinaZaPorudzbinu = Number(this.value);
          dodatiLekovi = arrayRemove(dodatiLekovi, aData);
          dodatiLekovi.push(aData);
      }
    });
    tablePorudzbinaLekovi.on("input", ".kolicinaLekaZaPorudzbinu", function(){
      this.addEventListener("input", function(){
        this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
      })
    });

  });
  

  let dugmeDodajLekove = document.getElementById("DodajLekoveUPorudzbinu");
  dugmeDodajLekove.addEventListener("click", async function(){
    dodatiLekovi.forEach(async el => {
      try{
          api.setHeader('Content-Type', 'application/json');
          let idPorudzbine = JSON.parse(sessionStorage.getItem("odabranaPorudzbina")).ID;
          await api.apoteka.dodajLekUPorudzbinu(ulogovaniKorisnik.apoteka.id, Number(idPorudzbine), el.Sifra, el.kolicinaZaPorudzbinu);
      }
      catch(e){
          alert(`Došlo je do greške prilikom dodavanja leka u porudžbinu, pokušajte ponovo.\n${e.message}`);
      }
    });
    alert(`Uspešno ste dodali izabrane lekove u porudžbinu!`);
    window.location.reload();
  });
};


// $('#ModalPorudzbinaDodajLek').on('hidden.bs.modal', function () {
//   $("#porudzbinaSpisakLekova").DataTable().destroy();
//   //window.location.reload();
// });




function arrayRemove(arr, value){  
  let pomNiz = [];
  for(let i = 0; i < arr.length; i++){
    if (arr[i].Sifra !== value.Sifra){
      pomNiz.push(arr[i]);
    }
  }
  return pomNiz;
};




function prebaciVreme(vreme){
  //2021-06-02 16:44:08
  let vremeLista = vreme.toString().split(" ");
  vremeLista[0] = vremeLista[0].split("-").reverse().join(".");
  return vremeLista[0] + " " + vremeLista[1].slice(0, 8);
}

function iseciListuLekova(lekovi, poruceniLekovi){
  let pomocniNiz = [];
  for(let i = 0; i < lekovi.length; i++){
    let nadjen = false;
    for(let j = 0; j < poruceniLekovi.length; j++){
      if(lekovi[i].podaciLeka.sifra == poruceniLekovi[j].sifraLeka){
        nadjen = true;
        break
      }
    }
    if(nadjen == false){
      pomocniNiz.push(lekovi[i]);
    }
  }
  return pomocniNiz;
}

