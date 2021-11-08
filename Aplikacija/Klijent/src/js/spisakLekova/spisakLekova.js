import ApiClient from "../global/apiClient.js";
import {checkLogin} from "../global/checkUser.js";

let ulogovaniKorisnik = await checkLogin().then(value => value);

const api = new ApiClient();


function vratiKolicinuLeka(kolicina, brojTabli, deljiv){
  let preostaloKutija = Math.floor(kolicina);
  let preostaloTable = Math.round((kolicina - Math.floor(kolicina)) * brojTabli);

  if(preostaloTable > 0 && deljiv){
    if(preostaloTable == 1){
      return preostaloKutija + ", " + preostaloTable + " tabla";
    }
    else{
      return preostaloKutija + ", " + preostaloTable + " table";
    }
  }
  else{
    return preostaloKutija;
  }
}


(async function ucitajStranicu() {
  
  dodajButtons();

  const lekovi = await api.apoteka.vratiALekove(ulogovaniKorisnik.apoteka.id);

  let dataSet = [];

  lekovi.forEach(element => {
      dataSet.push({
        Sifra: element.podaciLeka.sifra, 
        Ime: element.podaciLeka.ime,  
        Cena: element.podaciLeka.cena, 
        Kolicina: vratiKolicinuLeka(element.kolicina, element.podaciLeka.brojTabli, element.deljiv),
        'Broj tabli': element.podaciLeka.brojTabli,
        Deljiv: ((element.deljiv === true) ? "Da, "+element.podaciLeka.brojTabli+" table" : "Ne"),
        Podaci: JSON.stringify(element),
      });

  });

  $(document).ready(function() {
    const table = $('#spisakLekovaTable').DataTable({
      "iDisplayLength": 10,
      data: dataSet,
        columns: [
            { data: "Sifra", class: 'sifra'},
            { data: "Ime", class: 'ime'},
            { data: "Cena" },
            { data: "Kolicina", orderable: false, class: "kolicinaTabela"},
            { data: "Deljiv", orderable: false },
            { 
              data: null, class: 'Prikaz', 
              defaultContent: '<button id="buttonPrikaz">Prikaz</button> <input type="checkbox" class="checkbox" />',
              orderable: false,
            },
        ],

        "language": {
          "search": "Pretraži:",
          "info": "Prikazujem od _START_. do _END_. leka (Ukupno: _TOTAL_ lekova)",
          "key": "emptyTable",
          "value": "Nema podataka za prikaz",
          "zeroRecords": "Nema rezultata za datu pretragu",
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
    });

    let prikaz = document.querySelectorAll(".Prikaz");
    for(let i = 0; i < 2; i++){
      prikaz[i].classList.remove("Prikaz");
    }


    table.on("change", ".checkbox", async function() {
          
      if(this.checked){
       
        let inp = document.createElement("input");
        inp.id = "prikazInput"+table.row(this.parentNode).data().Sifra;
        inp.className = 'prikazInput';
        inp.value = 0;

        inp.addEventListener("input", function(){
          this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
        })

        this.parentNode.appendChild(inp);

        if(JSON.parse(table.row( $(this).parents() ).data().Podaci).deljiv){
          let select = document.createElement("select");
          select.className = "form-control selectKutijeTable";
          select.id = "kutije-table-input" + table.row(this.parentNode).data().Sifra;
        
          let option_kutije = document.createElement("option");
          option_kutije.value = 0
          option_kutije.text = "Kutije";
          select.appendChild(option_kutije);
          let option_table = document.createElement("option");
          option_table.value = 1
          option_table.text = "Table";
          select.appendChild(option_table);

          this.parentNode.appendChild(select);
        }
      } 
      else {
        let node = document.getElementById("prikazInput"+table.row(this.parentNode).data().Sifra);
        lekoviKasa = arrayRemove(lekoviKasa, JSON.parse(table.row( $(this).parents() ).data().Podaci));
        this.parentNode.removeChild(node);
        if(JSON.parse(table.row( $(this).parents() ).data().Podaci).deljiv){
          let select = document.querySelector("#kutije-table-input"+table.row(this.parentNode).data().Sifra);
          this.parentNode.removeChild(select);
        }
      }
    });



    // Ostavljeno je da kad se klikne na red leka da se prikazu paralele
    table.on("click", "td.sifra, td.ime", async function() {
      const aData = table.row( this ).data();
      const data = aData.Podaci;
      const lek = JSON.parse(data);

      dodajParalele(lek.podaciLeka.sifra);
    });

    // Dugme za prikaz samog leka, radi kao i funkcija iznad
    table.on("click", "button", function(){ storeData(table.row( $(this).parents('tr') ).data())});

    function storeData(aData)
    {
      const data = aData.Podaci;
      sessionStorage.setItem('lekData', data);
      window.location.href = 'lek.html';
    }

    // Kad se ubaci kolicina leka koju zelimo da izdamo tek tad se taj lek dodaje u sessionStorage
    table.on("focusout click", ".prikazInput, .selectKutijeTable", function(){
    const aData = table.row( $(this).parents() ).data();
    let data = aData.Podaci;
    data = JSON.parse(data);
    if(JSON.parse(table.row( $(this).parents() ).data().Podaci).deljiv){
      data.izdavanjeNaTable = document.getElementById("kutije-table-input" + table.row(this.parentNode).data().Sifra).value;
    }
    if(data.kolicina < this.value){
      alert(`Ne postoji dovoljna kolicina leka ${data.podaciLeka.ime} u apoteci`);
      this.value = data.kolicina;
      data.unetaKolicina = this.value;
      lekoviKasa = arrayRemove(lekoviKasa, data);
      if(data.unetaKolicina != '0'){
        lekoviKasa.push(data);
      }
      return;
    }
    data.unetaKolicina = this.value;
    lekoviKasa = arrayRemove(lekoviKasa, data);
    if(data.unetaKolicina != '0'){
      lekoviKasa.push(data);
    }
  });


  table.on("draw", function(){
    onTableDraw();
  });

  function onTableDraw(){
    // OVO SLUZI DA KAD SE VRATIMO IZ KASE U SPISAK LEKOVA DA SE CEKIRAJU SVI CHECKBOX
    // I DA SE UPISU VREDNOSTI U INPUT PORED CHECKBOXA
    let pod = sessionStorage.getItem('kasaData');
    if(pod != null && pod.length > 0){
      JSON.parse(pod).forEach(function(el){
        var checkboxes = document.querySelectorAll(".checkbox");
        checkboxes.forEach(function(checkbox) {
          if(checkbox.checked){
            return;
          }
          if(checkbox.parentNode.parentNode.firstChild.innerHTML == el.podaciLeka.sifra){
            checkbox.checked = true;
            let inp = document.createElement("input");
            inp.id = "prikazInput"+table.row(checkbox.parentNode).data().Sifra;
            inp.className = 'prikazInput';
            inp.value = el.unetaKolicina; 
            inp.addEventListener("input", function(){
              this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
            })
  
            checkbox.parentNode.appendChild(inp);

            if(JSON.parse(table.row( $(checkbox).parents() ).data().Podaci).deljiv){
              let select = document.createElement("select");
              select.className = "form-control selectKutijeTable";
              select.id = "kutije-table-input" + table.row(checkbox.parentNode).data().Sifra;
            
              let option_kutije = document.createElement("option");
              option_kutije.value = 0
              option_kutije.text = "Kutije";
              select.appendChild(option_kutije);
              let option_table = document.createElement("option");
              option_table.value = 1
              option_table.text = "Table";
              select.appendChild(option_table);
  
              select.value = Number(el.izdavanjeNaTable)
  
              checkbox.parentNode.appendChild(select);
            }
            return;
          }
        });
    });
    }
  };
  onTableDraw();

    
  });
})();





async function dodajParalele(sifra){

  function obrisiTabelu(){
    let h4 = document.getElementById("h4Paralele");
    if(h4){
      h4.parentNode.removeChild(h4);
    }
    let table = document.getElementById("tabelaParalele");
    if(table){
      table.parentNode.removeChild(table);
    }
  }
  obrisiTabelu();

  let paralele;
  try{
    paralele = await api.apoteka.vratiParalelneLekove(sifra);
    paralele = paralele.filter(element => element.kolicina > 0);
  }
  catch(e){
    alert(`Došlo je do greške prilikom pribavljanja paralela.\n${e.message}`);
  }
  if(paralele.length < 1){
    return;
  }

  let buttons = document.querySelector(".buttons");

  let h4 = document.createElement("h4");
  h4.id = "h4Paralele";
  h4.innerHTML = "Paralele leka";
  buttons.appendChild(h4);


  let table = document.createElement("table");
  table.id = "tabelaParalele";

  let thead = document.createElement("thead");
  let tr = document.createElement("tr");

  let th1 = document.createElement("th");
  th1.className = "paraleleIme";
  th1.innerHTML = "Ime";
  tr.appendChild(th1);

  let th2 = document.createElement("th");
  th2.className = "paraleleApoteka";
  th2.innerHTML = "Apoteka";
  tr.appendChild(th2);

  let th3 = document.createElement("th");
  th3.className = "paraleleKolicina";
  th3.innerHTML = "Količina";
  tr.appendChild(th3);

  thead.appendChild(tr);
  table.appendChild(thead);

  let tbody = document.createElement("tbody");

  paralele.forEach(element => {

    let tr = document.createElement("tr");
    let td1 = document.createElement("td");
    td1.innerHTML = element.podaciLeka.ime;
    tr.appendChild(td1);

    let td2= document.createElement("td");
    td2.innerHTML = element.apoteka.adresa;
    tr.appendChild(td2);

    let td3 = document.createElement("td");
    td3.innerHTML = element.kolicina;
    tr.appendChild(td3);

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  buttons.appendChild(table);
}



function dodajButtons(){
  const uloga = ulogovaniKorisnik.uloga;
  let buttons = document.querySelector(".buttons");
  
  let button = document.createElement("button");
  button.type = "button";
  button.innerHTML = "Dodaj izabrane lekove za izdavanje";
  button.className = "dugmeKasa dugmeDesno";
  buttons.appendChild(button);
  
  if(uloga !== 1){
    let button = document.createElement("button");
    button.type = "button";
    button.innerHTML = "Dodaj novi lek";
    button.className = "dugmeDodajLek dugmeDesno";
    button.setAttribute("data-toggle", "modal");
    button.setAttribute("data-target", "#ModalDodajLek");
    buttons.appendChild(button);
  }
  
}


let lekoviKasa = [];
let pod = sessionStorage.getItem('kasaData');
if(pod != null && pod.length > 0){
  lekoviKasa = JSON.parse(pod);
}

function arrayRemove(arr, value){  
  let pomNiz = [];
  for(let i = 0; i < arr.length; i++){
    if (arr[i].podaciLeka.sifra !== value.podaciLeka.sifra){
      pomNiz.push(arr[i]);
    }
  }
  return pomNiz;
};


let dugmeKasa = document.querySelector(".dugmeKasa");
dugmeKasa.addEventListener('click', function(){
  if(lekoviKasa.length == 0){
    alert("Niste izabrali nijedan lek za izdavanje!");
    sessionStorage.setItem('kasaData', JSON.stringify(lekoviKasa));
    return;
  }
  sessionStorage.setItem('kasaData', JSON.stringify(lekoviKasa));
  window.location.href = 'index.html';
})


const dodajLekSacuvajDugme = document.getElementById("dodajLekSacuvajDugme");
dodajLekSacuvajDugme.addEventListener('click', async function(){

  const ime = document.getElementById("dodajLekIme");
  const sifra = document.getElementById("dodajLekSifra");
  const cena = document.getElementById("dodajLekCena");
  const opis = document.getElementById("dodajLekOpis");
  const kolicina = document.getElementById("dodajLekKolicina");
  const kriticnaKolicina = document.getElementById("dodajLekKritKolicina");
  const deljiv = document.getElementById("dodajLekDeljiv").value.toLowerCase();
  const brojTabli = document.getElementById("dodajLekBrTabli");

  

  // TO-DO ovde ide getanje vrednosti za novi lek

  if(ime.value.length == 0){
    alert("Niste uneli ime leka!");
    ime.focus();
    return;
  }
  if(ime.value.length > 50){
    alert("Maksimalan broj karaktera za ime leka je 50!");
    ime.focus();
    return;
  }

  if(sifra.value.length == 0 || isNaN(Number(sifra.value))){
    alert("Niste uneli šifru leka!");
    sifra.focus();
    return;
  }
  if(sifra.value.length > 9){
    alert("Maksimalan broj cifara za šifru je 9!");
    sifra.focus();
    return;
  }

  if(cena.value.length == 0 || isNaN(Number(cena.value))){
    alert("Niste uneli cenu leka!");
    cena.focus();
    return;
  }
  if(cena.value.length > 15){
    alert("Maksimalan broj karaktera šifre leka je 15!");
    cena.focus();
    return;
  }

  if(cena.value > 30000){
    alert("Cena leka može biti maksimalno 30000 RSD!");
    cena.focus();
    return;
  }


  if(opis.value.length == 0){
    alert("Niste uneli opis leka");
    opis.focus();
    return;
  }

  if(opis.value.length > 100){
      alert("Maksimalan broj karaktera za opis leka je 100!");
      opis.focus();
      return;
  }

  if(kolicina.value.length == 0 || isNaN(Number(kolicina.value))){
    alert("Niste uneli količinu leka");
    kolicina.focus();
    return;
  }
  
  if(kolicina.value > 5000){
    alert("Maksimalna količina leka je 5000!");
    kolicina.focus();
    return;
  }

  if(kriticnaKolicina.value.length == 0 || isNaN(Number(kriticnaKolicina.value))){
    alert("Niste uneli kritičnu količinu leka!");
    kriticnaKolicina.focus();
    return;
  }

  if(kriticnaKolicina.value > 500){
    alert("Maksimalna kritična količina leka je 500!");
    kriticnaKolicina.focus();
    return;
  }

  if(brojTabli.value.length == 0 || isNaN(Number(brojTabli.value))){
    alert("Niste uneli cenu leka!");
    brojTabli.focus();
    return;
  }

  if(brojTabli.value > 20){
      alert("Maksimalan broj tabli u leku može biti 20!");
      brojTabli.focus();
      return;
    }



  const noviLek = {
    kolicina: Number(kolicina.value),
    kriticnaKolicina: Number(kriticnaKolicina.value),
    deljiv: (deljiv === 'da') ? true : false,
    podaciLeka: {
      sifra: Number(sifra.value),
      ime: ime.value,
      opis: opis.value,
      slika: "default.png",
      cena: Number(cena.value),
      brojTabli: Number(brojTabli.value),
    }
  };

  try
  {
    api.setHeader('Content-Type', 'application/json');
    await api.apoteka.kreirajLek(noviLek); 
  
    alert('Uspešno ste dodali novi lek!');
    window.location.reload();
  }
  catch(e)
  {
    alert(`Došlo je do greške prilikom kreiranja novog leka, pokušajte ponovo.\n${e.message}`);
  }

  // Ako je sve okej, docicemo do ovog dela koda, ovde moze da se uradi refresh stranice -> spisaklekova
});



function inputSamoBrojevi(){
  let dodajLekSifra = document.getElementById("dodajLekSifra");
  let dodajLekCena = document.getElementById("dodajLekCena");
  let dodajLekKolicina = document.getElementById("dodajLekKolicina");
  let dodajLekKritKolicina = document.getElementById("dodajLekKritKolicina");
  let dodajLekBrTabli = document.getElementById("dodajLekBrTabli");


  dodajLekSifra.addEventListener("input", function(){
    this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
  })

  dodajLekCena.addEventListener("input", function(){
    this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
  })
  dodajLekKolicina.addEventListener("input", function(){
    this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
  })
  dodajLekKritKolicina.addEventListener("input", function(){
    this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
  })
  dodajLekBrTabli.addEventListener("input", function(){
    this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
  })
}

inputSamoBrojevi();



let footer = document.getElementById("footer-copyright");
let div = document.createElement("div");
div.className = "text-muted";
div.innerHTML = "*Kliknite na šifru ili ime leka u tabeli da biste videli dostupne paralele u drugim apotekama u gradu.";
footer.appendChild(div);




