import ApiClient from "../global/apiClient.js";
const api = new ApiClient();


Chart.defaults.global.defaultFontFamily = '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#292b2c';


let podaciApoteke = JSON.parse(sessionStorage.getItem('apotekaProfil'));




const meseci_naziv = ["Januar", "Februar", "Mart", "April", "Maj", "Jun", "Jul", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar"];

let meseci = []
let apoteke;
try
{
    api.setHeader('Content-Type', 'application/json');
    apoteke = await api.lanacApoteka.vratiApoteke();
}
catch(e)
{
    alert(`Došlo je do greške: ${e.message}`);
}


let objekti = [];
let brojProdatih = [];

let selectMeseci = document.getElementById("selectMeseciBrojLekova");
selectMeseci.addEventListener("change", function(){
  postavljanjePodataka(Number(selectMeseci.value));
});


postavljanjePodataka(Number(selectMeseci.value));


async function postavljanjePodataka(brojMeseci){
  try{
    let prihodiObj = await api.apoteka.vratiBrojProdatihLekovaApotekePoMesecima(podaciApoteke.id, brojMeseci);

    meseci = Object.keys(prihodiObj).reverse();
    brojProdatih = Object.values(prihodiObj).reverse();

    brojUNazivMeseca(meseci);

    // console.log(meseci);
    // console.log(brojProdatih);
    // console.log("Broj prodatih po mesecima");
    // console.log(prihodiObj);
  }
  catch(e){
    alert(`Došlo je do greške: ${e.message}`);
  }

  //postavljanje apoteke
  objekti = [];
  let maxGranica;
  
  let obj = {
    label: podaciApoteke.adresa,
    lineTension: 0.3,
    backgroundColor: 'rgba(44, 144, 8, 0.5)',
    pointRadius: 5,
    pointBackgroundColor:  'rgba(44, 144, 8, 1)',
    pointBorderColor: 'rgba(255,255,255,0.8)',
    pointHoverRadius: 6,
    pointHoverBackgroundColor: 'rgba(44, 144, 8, 1)',
    pointHitRadius: 50,
    pointBorderWidth: 2,
    data: brojProdatih,
  }
  objekti.push(obj);
  maxGranica = granicaMaxVrednosti(brojProdatih.max());



  if(myLineChart){
    myLineChart.destroy();
  }
  postaviGraf(meseci, objekti, maxGranica);
}



// Odredjivanje granice koja ce da se prikaze u grafiku, da ne bude fiksna granica,
// da grafik bude sto krupniji
function granicaMaxVrednosti(number) {
  let n = Math.max(Math.floor(Math.log10(Math.abs(number))), 0) + 1;
  let prvaCifra = Math.floor((number / Math.pow(10, n - 1)) % 10);
  return (prvaCifra+1) * Math.pow(10, n-1);
}

Array.prototype.max = function() {
  return Math.max.apply(null, this);
};


function brojUNazivMeseca(meseci){
  meseci.forEach((element, index) => {
    element = element.split("-").reverse();
    element[0] = meseci_naziv[Number(element[0]) - 1];
    element = element.join(" ");
    meseci[index] = element;
  });
}






var myLineChart;
function postaviGraf(meseci, objekti, maxGranica){
  var ctx = document.getElementById("myAreaChart");
  myLineChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: meseci,
        datasets: objekti,
    },
    options: {
      scales: {
        xAxes: [{
          time: {
            unit: 'date'
          },
          gridLines: {
            display: false
          },
          ticks: {
            maxTicksLimit: 31
          }
        }],
        yAxes: [{
          ticks: {
            min: 0,
            max: maxGranica,
            maxTicksLimit: 10
          },
          gridLines: {
            color: "rgba(0, 0, 0, .125)",
          }
        }],
      },
      legend: {
        display: false,
      }
    }
  });
}
