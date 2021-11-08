import ApiClient from "../global/apiClient.js";

(function pronadjiDugme() {
    var dugme = document.getElementsByClassName("loginButton")[0];
    dugme.addEventListener("click", () => onLoginClick());
    let pas = document.getElementById("inputPassword");
    // Kad se klikne enter da se uloguje korisnik
    pas.addEventListener("keyup", function(event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            dugme.click();
        }
    })
})();



async function onLoginClick()
{
    const _user = document.getElementById("inputUsername").value;
    const _pass = document.getElementById("inputPassword").value;

    if(_user.length < 1)
    {
        alert("Niste uneli korisničko ime!");
        return;
    }

    if(_pass.length < 1)
    {
        alert("Niste uneli lozinku!");
        return;
    }

    try
    {
        const api = new ApiClient();
        api.setHeader('Content-Type', 'application/json');
        const data = await api.main.login(_user, _pass);
    
        if(data)
        {
            //console.log(data);
            const userData = btoa(_user + ':' + _pass);
            sessionStorage.setItem('authUser', userData);
            if(data.uloga === 4){
                window.location.href = "grafici.html";
                return;
            }

            window.location.href = "index.html";
            return;
        }
    }
    catch(ex) {
        alert(`Došlo je do greške! (${ex.message})`);
    }
}
    
