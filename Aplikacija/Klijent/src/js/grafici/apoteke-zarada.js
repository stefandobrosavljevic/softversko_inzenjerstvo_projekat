import ApiClient from "../global/apiClient.js";

const api = new ApiClient();

Chart.defaults.global.defaultFontFamily = '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#292b2c';

const meseci = ["Januar", "Februar", "Mart", "April", "Maj", "Jun", "Jul", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar"];


let apoteke_adrese = [];
let podaci = [];
api.setHeader('Content-Type', 'application/json');



// let selectMeseciZarada = document.getElementById("selectMeseciZarada");
// var opt = document.createElement('option');
// opt.appendChild( document.createTextNode("Cela godina") );
// opt.value = 0; 
// selectMeseciZarada.appendChild(opt);

// meseci.forEach((element, index) => {
//   var opt = document.createElement('option');
//   opt.appendChild( document.createTextNode(element) );
//   opt.value = index+1; 
//   selectMeseciZarada.appendChild(opt);
// });

selectMeseciZarada.addEventListener("change", function(){
  postavljanjePodataka(Number(selectMeseciZarada.value));
});

// Inicijalizacija
postavljanjePodataka(Number(selectMeseciZarada.value));


async function postavljanjePodataka(brojMeseci){
  let idMeseca = selectMeseciZarada.value;
  try{
    let prihodiObj = await api.lanacApoteka.vratiPrihodePoApotekama(brojMeseci);
    apoteke_adrese = Object.keys(prihodiObj);
    podaci = Object.values(prihodiObj);

  }
  catch(e){
   alert(`Došlo je do greške ${e.message}`);
  }

  if(myPieChart){
    myPieChart.destroy();
  }

  let niz_boja = odrediBoje();
  postaviGraf(podaci, niz_boja);
}


function odrediBoje(){
  let niz_boja = [];
  for(let i = 0; i < apoteke_adrese.length; i++){
    niz_boja.push('#' + Math.floor(Math.random()*16777215).toString(16));
  }
  return niz_boja;
}



var myPieChart;
function postaviGraf(podaci, niz_boja){
  var ctx = document.getElementById("myPieChart");
  myPieChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: apoteke_adrese,
      datasets: [{
        data: podaci,
        backgroundColor: niz_boja,
      }],
    },
    options: {
      legend: {
        display: true,
        position: 'right',
      }
    }
  });
}


