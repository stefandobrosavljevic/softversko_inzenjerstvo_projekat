import ApiClient from "../global/apiClient.js";
const api = new ApiClient();


Chart.defaults.global.defaultFontFamily = '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#292b2c';


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
  let idMeseca = selectMeseci.value;
  try{
    let prihodiObj = await api.lanacApoteka.vratiBrojProdajaPoMesecimaZaSveApoteke(brojMeseci);

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
    label: "Lanac apoteka",
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
    // Ovo postavlja linije da budu prave
    //lineTension: 0,
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
        display: false
      }
    }
  });
}







  


// let nizMaxGranica = [];
  // for(let i = 0; i < apoteke.length; i++){
  //   let randomColor = vratiRandomBoju();
  //   let obj = {
  //     label: apoteke[i].adresa,
  //     lineTension: 0.3,
  //     backgroundColor: randomColor + " 0.5)",
  //     pointRadius: 5,
  //     pointBackgroundColor:  randomColor + " 1)",
  //     pointBorderColor: "rgba(255,255,255,0.8)",
  //     pointHoverRadius: 6,
  //     pointHoverBackgroundColor: randomColor + " 1)",
  //     pointHitRadius: 50,
  //     pointBorderWidth: 2,
  //     //ovde ce da dodju podaci za svaku apoteku zasebno koja se poziva
  //     //data: lekoviPodaci[i],
  //     data: setPodataka[i],
  //   }
  //   objekti.push(obj);
  //   nizMaxGranica.push(granicaMaxVrednosti(setPodataka[i].max()));
  // }
  // maxGranica = nizMaxGranica.max();
  // }



  
function vratiRandomBoju(){
  function hex_to_rgb(hex) {
    const normal = hex.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
    if (normal) return normal.slice(1).map(e => parseInt(e, 16));
    const shorthand = hex.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i);
    if (shorthand) return shorthand.slice(1).map(e => 0x11 * parseInt(e, 16));
    return null;
  }
  
  function rgb(values) {
    return 'rgba(' + values.join(', ') + ',';
  }

  let randomBoja;
  do{
    randomBoja = '#' + Math.floor(Math.random()*16777215).toString(16);
  }while(randomBoja.length == 6);


  do{
    randomBoja = hex_to_rgb(randomBoja);
  }while(randomBoja == null);

  randomBoja = rgb(randomBoja);
  return randomBoja;
}
