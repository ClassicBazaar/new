var loading = document.getElementById("loading");
window.addEventListener("load", function () {
    loading.style.display = "none";
});

let imagefile = document.getElementById("productimage");
let hideinput = document.getElementById("hideinput");

imagefile.addEventListener("change", (e) => {
    const file = imagefile.files[0];
    const reader = new FileReader();
    reader.addEventListener("load", () => {
        hideinput.value = reader.result;
    });
    reader.readAsDataURL(file);
});

function viewimage(event) {
    document.getElementById("img-pre").src = URL.createObjectURL(
        event.target.files[0]
    );
}

