
const logoutDugme = document.getElementsByClassName("logoutDugme")[0];

console.log("stigo");
console.log(localStorage.getItem('authUser'));

logoutDugme.addEventListener("click", () => onClick());


function onClick(){
    localStorage.removeItem('authUser');
    console.log(localStorage.getItem('authUser'));
}