const logoutDugme = document.getElementById('logoutDugme');

logoutDugme.addEventListener("click", () => onLogoutClick());

function onLogoutClick()
{
    sessionStorage.removeItem('authUser');
    sessionStorage.clear();
}