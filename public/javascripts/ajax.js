function addtocart(id) {
    $.ajax({
        url: "/addtocart/" + id,
        method: "get",
        success: (response) => {
            if (response.status) {
                let count = $("#cartcount").html();
                count = parseInt(count) + 1;
                $("#cartcount").html(count);

                let bnavcount = $("#bnavcount").html();
                bnavcount = parseInt(bnavcount) + 1;
                $("#bnavcount").html(bnavcount);
                alert("Item added to cart");
            } else {
                alert("You have to login first to add this product to cart");
            }
        },
    });
}
function changeQuantity(cartid, productid, count, price) {
    let quantity = $("#" + productid).html();
    quantity = parseInt(quantity);
    price = parseInt(price);
    //
    $.ajax({
        url: "/change-product-quantity",
        data: {
            cart: cartid,
            product: productid,
            count: count,
            quantity: quantity,
        },
        method: "post",
        success: (response) => {
            if (response.removedproduct) {
                location.reload();
            } else {
                let htmlquantity = $("#" + productid).html();
                htmlquantity = parseInt(htmlquantity) + count;
                $("#" + productid).html(htmlquantity);
                let totalprice = $(".price").html();
                totalprice = parseInt(totalprice) + price;
                totalprice = $(".price").html(totalprice);
            }
        },
    });
}
function deleteproduct(cartid, productid) {
    console.log(cartid, productid);
    $.ajax({
        url: "/delete-cart-product",
        method: "post",
        data: {
            cart: cartid,
            product: productid,
        },
        success: (response) => {
            if (response.removedproduct) {
                location.reload();
            }
        },
    });
}
$("#order-form").submit((e) => {
    console.log(e);
    e.preventDefault();
    $.ajax({
        url: "/order-product",
        method: "post",
        data: $("#order-form").serialize(),
        success: (response) => {
            alert(response);
            location.href = "/order-placed-successfully";
        },
    });
});
function Status(type, orderid) {
    $.ajax({
        url: "/admin/change-status",
        data: {
            type: type,
            orderid: orderid,
        },
        method: "post",
        success: (response) => {
            if (response.status) {
                $("#status-pre").html(type);
            }
        },
    });
}
function changesize(size, cartid, productid) {
    $.ajax({
        url: "/changesize",
        data: {
            size: size,
            cartid: cartid,
            productid: productid,
        },
        method: "post",
        success: (response) => {
            if (response) {
                alert(" size " + response + " is selected");
            }
        },
    });
}
