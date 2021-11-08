import ApiClient from "../global/apiClient.js";

const api = new ApiClient();




 let dataSet = [];


function vratiKolicinuLeka(unetaKolicina, izdavanjeNaTable){
  if(izdavanjeNaTable == 1){
    if(unetaKolicina == 1){
      return unetaKolicina + " tabla";
    }
    else{
      return unetaKolicina + " table";
    }
  }
  else{
    return unetaKolicina;
  }
}

function izracunajCenu(cenaJednog, unetaKolicina, brojTabli, izdavanjeNaTable){
  if(izdavanjeNaTable == 1){
    return Math.ceil(cenaJednog * unetaKolicina / brojTabli);
  }
  else{
    return cenaJednog * unetaKolicina;
  }
}

(async function ucitajKasu() {

   
    let pom = sessionStorage.getItem("kasaData");
    let imaLekova = false;
    if(pom != null && pom.length > 0){
      imaLekova = true;
    }  

    if(imaLekova){
      pom = JSON.parse(pom);
      pom.forEach(element => {
          dataSet.push({
            Sifra: element.podaciLeka.sifra, 
            Ime: element.podaciLeka.ime,  
            Cena: izracunajCenu(element.podaciLeka.cena, element.unetaKolicina, element.podaciLeka.brojTabli, element.izdavanjeNaTable), 
            Kolicina: element.kolicina,
            'Broj tabli': element.podaciLeka.brojTabli,
            Deljiv: ((element.deljiv === true) ? "Deljiv" : "Nije deljiv"),
            'unetaKolicina': vratiKolicinuLeka(element.unetaKolicina, element.izdavanjeNaTable),
            izdavanjeNaTable: element.izdavanjeNaTable,
            Podaci: JSON.stringify(element),
          });
      });
    }

    dataSet.forEach(element => {
      if(!element.izdavanjeNaTable || element.izdavanjeNaTable == '0'){
        element.izdavanjeNaTable = false;
      }
      else{
        element.izdavanjeNaTable =  true;
      }
    });



    $(document).ready(function() {
        const table = $('#kasaTable').DataTable({
          "iDisplayLength": 10,
          data: dataSet,
            columns: [
                { data: "Sifra", class: 'sifra'},
                { data: "Ime" },
                { data: "unetaKolicina" },
                { data: "Cena", orderable: false },
                { 
                  data: null, class: 'IzbaciLek', 
                  defaultContent: '<button id="buttonIzbaci">Izbaci lek</button>',
                  orderable: false,
                },
            ],
            "language": {
              "search": "Pretraži:",
              "info": "Prikazujem od _START_. do _END_. leka (Ukupno: _TOTAL_ lekova)",
              "key": "emptyTable",
              "value": "Nema podataka za prikaz",
              "zeroRecords": "Nema ubačenih lekova za izdavanje.",
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
        });

        $('#kasaTable tbody').on("click", "#buttonIzbaci", function(){
            
            const aData = table.row( $(this).parents() ).data();
            let data = aData.Podaci;
            data = JSON.parse(data);
            pom = arrayRemove(pom, data);
            sessionStorage.setItem('kasaData', JSON.stringify(pom));
            
            table.row( $(this).parents('tr') ).remove().draw();
            ukupnaCenaFunction();

        });
    });
    
    function ukupnaCenaFunction(){
        let ukupnacena = document.querySelector(".prikazCene");
        ukupnacena.innerHTML = '0';
        if(imaLekova){
          pom.forEach(element => {
              ukupnacena.innerHTML = parseInt(ukupnacena.innerHTML) + parseInt(izracunajCenu(element.podaciLeka.cena, element.unetaKolicina, element.podaciLeka.brojTabli, element.izdavanjeNaTable));
          });
        }
        ukupnacena.innerHTML = "Ukupna cena = " + ukupnacena.innerHTML + " RSD";
    };
    
    ukupnaCenaFunction();
})();



let dugmeIzdaj = document.querySelector(".dugmeIzdaj");
dugmeIzdaj.addEventListener("click", async function(){

  let lekoviZaIzdavanje = [];

  dataSet.forEach(lek => {
    lekoviZaIzdavanje.push({
      sifra: lek.Sifra,
      kolicina: Number(lek.unetaKolicina.split(" ")[0]),
      izdavanjePoTabli: lek.izdavanjeNaTable,
    })
  });

  if(lekoviZaIzdavanje.length < 1)
  {
    alert("Niste izabrali lekove za izdavanje!");
    return;
  }

  api.setHeader('Content-Type', 'application/json');
  try{
    await api.korisnik.izdajLekove(lekoviZaIzdavanje);
    sessionStorage.removeItem("kasaData");
    window.location.reload();
    alert(`Uspešno ste izdali izabrane lekove!`);
  }
  catch(e){
    alert(`Došlo je do greške prilikom izdavnja lekova.\n${e.message}`);
  }
  sessionStorage.removeItem("kasaData");
  window.location.reload();
})




let dugmeDodajLekove = document.querySelector(".dugmeDodajLekove");
dugmeDodajLekove.addEventListener("click", function(){
  window.location.href = "spisaklekova.html";
})


function arrayRemove(arr, value){  
  let pomNiz = [];
  for(let i = 0; i < arr.length; i++){
    if (arr[i].podaciLeka.sifra !== value.podaciLeka.sifra){
      pomNiz.push(arr[i]);
    }
  }
  return pomNiz;
};






//   // Za buttons da se skroluju sa stranicom
// var original_top = $(".buttons").offset().top;
// $(window).scroll(function(){
// 	$(".buttons").offset({top: $(this).scrollTop() + original_top})
// })