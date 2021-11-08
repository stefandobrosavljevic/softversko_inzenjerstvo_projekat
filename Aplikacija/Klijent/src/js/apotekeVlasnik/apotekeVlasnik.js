import ApiClient from "../global/apiClient.js";

const api = new ApiClient();


(async function ucitajStranicu() {
  
    dodajButtons();
  
    const apoteke = await api.lanacApoteka.vratiApoteke();
  
    let dataSet = [];

    apoteke.forEach(element => {
        dataSet.push({
          Adresa: element.adresa,
          ID: element.id,
          Grad: element.grad,
          Telefon: element.telefon,
          Podaci: JSON.stringify(element),
        });
    })


    $(document).ready(function() {
        const table = $('#apotekeTable').DataTable({
          "iDisplayLength": 10,
          data: dataSet,
            columns: [
                { data: "ID"},
                { data: "Adresa" },
                { data: "Grad"},
                { data: "Telefon"},
                { 
                  data: null, class: 'Prikaz', 
                  defaultContent: '<button id="buttonPrikaz">Prikaz</button>',
                  orderable: false,
                },
            ],
            "order": [[ 0, "asc" ]],
            "language": {
              "search": "Pretraži:",
              "info": "Prikazujem od _START_. do _END_. apoteka (Ukupno: _TOTAL_ apoteka)",
              "key": "emptyTable",
              "value": "Nema podataka za prikaz",
              "zeroRecords": "Nema rezultata za datu pretragu",
              "lengthMenu": "Prikaži _MENU_ apoteka",
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
              "infoEmpty": "Prikazujem 0 od 0 (Ukupno: 0 apoteka)",
              "infoFiltered": "(Filtrirano od ukupno _MAX_ apoteka)",
            },

            // "paging": false,
            "info": false,
        });

        let prikaz = document.querySelectorAll(".Prikaz");
        prikaz[0].classList.remove("Prikaz");
    


        table.on("click", "button", function(){ 
            const aData = table.row( $(this).parents('tr') ).data();
            const data = aData.Podaci;
            sessionStorage.setItem('apotekaProfil', data);
            window.location.href = 'apotekaProfil.html';
        })
    });

})();
  

const sacuvajApotekuDugme = document.getElementById("sacuvajApotekuDugme");
sacuvajApotekuDugme.addEventListener("click", async function(){
    const adresaApoteke = document.getElementById("dodajApotekuAdresa");
    const gradApoteke = document.getElementById("dodajApotekuGrad");
    const telefonApoteke = document.getElementById("dodajApotekuTelefon");

    if(adresaApoteke.value.length == 0){
      alert("Niste uneli adresu apoteke!");
      adresaApoteke.focus();
      return;
    }

    if(gradApoteke.value.length == 0){
      alert("Niste uneli grad apoteke!");
      gradApoteke.focus();
      return;
    }

    if(telefonApoteke.value.length == 0){
      alert("Niste uneli telefon apoteke!");
      telefonApoteke.focus();
      return;
    }


    let apoteka = {
        adresa: adresaApoteke.value,
        grad: gradApoteke.value,
        telefon: telefonApoteke.value,
    };

    try{
      api.setHeader('Content-Type', 'application/json');
      await api.lanacApoteka.kreirajApoteku(apoteka); 
    
      alert('Uspešno ste dodali novu apoteku!');
      window.location.reload();
    }
    catch(e){
      alert(`Došlo je do greške prilikom kreiranja nove apoteke, pokušajte ponovo.\n${e.message}`);
    }

});





function dodajButtons(){
    let buttons = document.querySelector(".buttons");
    let button = document.createElement("button");
    button.type = "button";
    button.innerHTML = "Dodaj novu apoteku";
    button.className = "dugmeDodajApoteku dugmeDesno";
    button.setAttribute("data-toggle", "modal");
    button.setAttribute("data-target", "#ModalDodajApoteku");
    buttons.appendChild(button);
}



function inputSamoBrojevi(){

  let dodajApotekuTelefon = document.getElementById("dodajApotekuTelefon");

  dodajApotekuTelefon.addEventListener("input", function(){
    this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
  })

}

inputSamoBrojevi();