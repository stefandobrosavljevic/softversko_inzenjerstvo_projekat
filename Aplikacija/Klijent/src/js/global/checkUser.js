import ApiClient from "../global/apiClient.js";


export async function checkLogin(){
    if(window.location.pathname.includes('login.html')) return;
    const data = sessionStorage.getItem("authUser");
    if(data == null){
        window.location.href = "login.html";
        return;
    }
    let data_array = atob(data);
    data_array = data_array.split(":");

    try{
        const api = new ApiClient();
        api.setHeader('Content-Type', 'application/json');
        const korisnik = await api.main.login(data_array[0], data_array[1]);
        //console.log(korisnik);
        if(!korisnik){
            window.location.href = "login.html";
            return null;
        }
        return korisnik;
    }
    catch(ex) {
        alert(`Došlo je do greške: ${ex.message}`);
        window.location.href = "login.html";
    }
};

