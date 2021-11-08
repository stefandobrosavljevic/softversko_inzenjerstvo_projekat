export function authHeader() {
    let user = sessionStorage.getItem('authUser');

    if (user) {
        return { 'Authorization': 'Basic ' + user };
    } else {
        return {};
    }
}

