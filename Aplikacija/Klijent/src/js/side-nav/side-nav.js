import {checkLogin} from "../global/checkUser.js";

let ulogovaniKorisnik = await checkLogin().then(value => value);

let nav = document.getElementById("side-nav");

const uloga = ulogovaniKorisnik.uloga;

let vlasnik = document.getElementById("side-nav-Vlasnik");
let porudzbine = document.getElementById("side-nav-Porudzbine");
let zaposleni = document.getElementById("side-nav-Zaposleni");
let spisakLekova = document.getElementById("side-nav-SpisakLekova");
let izdavanje = document.getElementById("side-nav-Izdavanje");
let grafici = document.getElementById("side-nav-Grafici");
let apoteke = document.getElementById("side-nav-Apoteke");



if(uloga < 4){
    nav.removeChild(vlasnik);
    vlasnik.remove();
    nav.removeChild(grafici);
    grafici.remove();
    nav.removeChild(apoteke);
    apoteke.remove();
}

if(uloga < 3){
    nav.removeChild(zaposleni);
    zaposleni.remove();
}


if(uloga < 2){
    nav.removeChild(porudzbine);
    porudzbine.remove();
}

const checked = sessionStorage.getItem("vlasnikInterfejs");
if(!checked && uloga == 4){
    nav.removeChild(zaposleni);
    zaposleni.remove();
    nav.removeChild(porudzbine);
    porudzbine.remove();
    nav.removeChild(spisakLekova);
    spisakLekova.remove();
    nav.removeChild(izdavanje);
    izdavanje.remove();
    nav.removeChild(vlasnik);
    vlasnik.remove();
}
else if (uloga == 4){
    nav.removeChild(grafici);
    grafici.remove();
    nav.removeChild(apoteke);
    apoteke.remove();
}