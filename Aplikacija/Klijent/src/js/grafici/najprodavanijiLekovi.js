import ApiClient from "../global/apiClient.js";

const api = new ApiClient();



let najprodavanijiLekovi = await api.lanacApoteka.vratiNajprodavanijeLekove(10);


const imenaLekova = Object.keys(najprodavanijiLekovi);
const kolicinaLekova = Object.values(najprodavanijiLekovi);


for(let i = 0; i < imenaLekova.length; i++){
    imenaLekova[i] = imenaLekova[i].replace("(", " - ");
    imenaLekova[i] = imenaLekova[i].replace(")", "");
};

var tbodyRef = document.getElementById('tabelaNajprodavanijiLekovi').getElementsByTagName('tbody')[0];

for(let i = 0; i < imenaLekova.length; i++){
    var newRow = tbodyRef.insertRow();
    
    var cellIme = newRow.insertCell();
    
    var ime = document.createTextNode(imenaLekova[i]);
    cellIme.appendChild(ime);
    
    var cellKolicina = newRow.insertCell();
    var kolicina = document.createTextNode(kolicinaLekova[i]);
    cellKolicina.appendChild(kolicina);
}