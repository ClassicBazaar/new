var loading = document.getElementById("loading");
window.addEventListener("load", function () {
    loading.style.display = "none";
});

let imagefile = document.getElementById("productimage");
let imagefile2 = document.getElementById("productimage2");
let imagefile3 = document.getElementById("productimage3");
let hideinput = document.getElementById("hideinput");
let hideinput2 = document.getElementById("hideinput2");
let hideinput3 = document.getElementById("hideinput3");

imagefile.addEventListener("change", (e) => {
    const file = imagefile.files[0];
    const reader = new FileReader();
    reader.addEventListener("load", () => {
        hideinput.value = reader.result;
    });
    reader.readAsDataURL(file);
});
imagefile2.addEventListener("change", (e) => {
    const file = imagefile2.files[0];
    const reader = new FileReader();
    reader.addEventListener("load", () => {
        hideinput2.value = reader.result;
    });
    reader.readAsDataURL(file);
});
imagefile3.addEventListener("change", (e) => {
    const file = imagefile3.files[0];
    const reader = new FileReader();
    reader.addEventListener("load", () => {
        hideinput3.value = reader.result;
    });
    reader.readAsDataURL(file);
});






function viewimage(event,number) {
  if(number===1){
    document.getElementById("img-pre").src = URL.createObjectURL(
        event.target.files[0]
    );
  }else{
    document.getElementById("img-pre"+number).src = URL.createObjectURL(
        event.target.files[0]
    );
  }
}

