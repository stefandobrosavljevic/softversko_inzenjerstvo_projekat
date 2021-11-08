import ApiClient from "../global/apiClient.js";

// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#292b2c';


let meseci_naziv = ["Januar", "Februar", "Mart", "April", "Maj", "Jun", "Jul", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar"];

let prihod = [];
let rashod = [];

let meseci;

const api = new ApiClient();

async function pribaviPodatke(brojMeseci){
  let prihodiObj = {};

  try{
    prihodiObj = await api.lanacApoteka.vratiPrihodePoMesecimaZaSveApoteke(brojMeseci);
    
    meseci = Object.keys(prihodiObj).reverse();
  
    prihod = Object.values(prihodiObj).reverse();
    rashod = odrediRashod(prihod);
  
    brojUNazivMeseca(meseci);
  }
  catch(e){
    alert(`Došlo je do greške: ${e.message}`);
  }

  let granica = odrediMaksGranicu(prihod, rashod);


  if(myLineChart){
    myLineChart.destroy();
  }
  postaviGraf(granica);
}





// function postaviApoteke(){
//   let selectMesece = document.getElementById("selectMesecePrihod");
//   var opt = document.createElement('option');
//   opt.appendChild( document.createTextNode("Sve apoteke") );
//   opt.value = 0; 
//   selectMesece.appendChild(opt);
//   apoteke.forEach(element => {
//     var opt = document.createElement('option');
//     opt.appendChild( document.createTextNode(element.adresa) );
//     opt.value = element.id; 
//     selectMesece.appendChild(opt); 
//   });
// }





let selectMesece = document.getElementById("selectMesecePrihod");
selectMesece.addEventListener("change", function(){
  pribaviPodatke(Number(selectMesece.value));
})



// inicijalizacija
pribaviPodatke(Number(selectMesece.value));



function brojUNazivMeseca(meseci){
  meseci.forEach((element, index) => {
    element = element.split("-").reverse();
    element[0] = meseci_naziv[Number(element[0]) - 1];
    element = element.join(" ");
    meseci[index] = element;
  });
}


// Odredjivanje granice koja ce da se prikaze u grafiku, da ne bude fiksna granica,
// da grafik bude sto krupniji
function odrediMaksGranicu(prihod, rashod){
  function granicaMaxVrednosti(number) {
    let n = Math.max(Math.floor(Math.log10(Math.abs(number))), 0) + 1;
    let prvaCifra = Math.floor((number / Math.pow(10, n - 1)) % 10);
    return (prvaCifra+1) * Math.pow(10, n-1);
  }
  
  Array.prototype.max = function() {
    return Math.max.apply(null, this);
  };
  
  let maxGranica = [granicaMaxVrednosti(prihod.max()), granicaMaxVrednosti(rashod.max())].max();
  return maxGranica;
}


function odrediRashod(prihod){

  function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
  }


  let rashod = [];
  prihod.forEach(element => {
    rashod.push(Math.floor(element * getRandomIntInclusive(55, 70) / 100));
  });
  return rashod;
}






var myLineChart;
function postaviGraf(maxGranica){
  var ctx = document.getElementById("myBarChart");
  myLineChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: meseci,
      datasets: [{
        label: "Prihod",
        backgroundColor: "rgba(2,117,216,0.8)",
        borderColor: "rgba(0, 0, 0, 1)",
        data: prihod,
      },
      {
        label: "Rashod",
        backgroundColor: "rgba(255, 47, 57, 0.8)",
        borderColor: "rgba(0, 0, 0, 1)",
        data: rashod,
      }
    ],
    },
    options: {
      scales: {
        xAxes: [{
          time: {
            unit: 'month'
          },
          gridLines: {
            display: false
          },
          ticks: {
            //Ovo treba da se promeni ako hocemo da prikazemo podatke starije od 2 godine za apoteke
            maxTicksLimit: 24
          }
        }],
        yAxes: [{
          ticks: {
            min: 0,
            max: maxGranica,
            maxTicksLimit: 5
          },
          gridLines: {
            display: true
          }
        }],
      },
      legend: {
        display: true
      }
    }
  });
}