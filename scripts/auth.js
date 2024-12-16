
function isLoggedIn() {
    return localStorage.getItem("isLoggedIn") === "true";
}

document.getElementById("shop-link").addEventListener("click", function(event) {
    event.preventDefault(); 

    if (isLoggedIn()) {
        window.location.href = "shop.html";
    } else {
        window.location.href = "login.html";
    }
});



