var express = require("express");
var router = express.Router();
var producthelper = require("../helpers/product-helpers");
var userhelpers = require("../helpers/user-helpers");

const verifylogin = (req, res, next) => {
    if (req.session.loggedin) {
        next();
    } else {
        res.redirect("/login");
    }
};
/* GET home page. */

router.get("/", async (req, res, next) => {
    let user = req.session.user;
    let cartcount = null;
    if (user) {
        cartcount = await userhelpers.getcartcount(req.session.user._id);
    }
    producthelper.getallproducts("featured products").then((products) => {
        res.render("index", {
            name: "Classic bazaar",
            products,
            user,
            cartcount,
        });
    });
});
router.get("/products", async function (req, res) {
    let user = req.session.user;
    let cartcount = null;
    if (user) {
        cartcount = await userhelpers.getcartcount(user._id);
    }
    producthelper.getallproducts("Mens").then((Mens) => {
        producthelper.getallproducts("Kids").then((Kids) => {
            producthelper.getallproducts("Bags").then((Bags) => {
                producthelper.getallproducts("Footwears").then((Footwears) => {
                    producthelper.getallproducts("Gadgets").then((Gadgets) => {
                        producthelper
                            .getallproducts("Fashion accessories")
                            .then((Fashion) => {
                                producthelper
                                    .getallproducts("Gadget accessories")
                                    .then((gadgetaccessories) => {
                                        producthelper
                                            .getallproducts("Electronics")
                                            .then((Electronics) => {
                                                producthelper
                                                    .getallproducts(
                                                        "daily using products"
                                                    )
                                                    .then((Daily) => {
                                                        res.render(
                                                            "user/products",
                                                            {
                                                                name: "Classic bazaar",
                                                                product: true,
                                                                Mens,
                                                                Kids,
                                                                Bags,
                                                                Footwears,
                                                                Gadgets,
                                                                Fashion,
                                                                gadgetaccessories,
                                                                Electronics,
                                                                Daily,
                                                                user,
                                                                cartcount,
                                                            }
                                                        );
                                                    });
                                            });
                                    });
                            });
                    });
                });
            });
        });
    });
});
router.get("/login", (req, res) => {
    if (req.session.loggedin) {
        res.redirect("/");
    } else {
        res.render("user/login", { loginerr: req.session.loginerr });
        req.session.loginerr = false;
    }
});
router.get("/signup", (req, res) => {
    if (req.session.signuperr) {
        res.render("user/signup", { signuperr: req.session.signuperr });
        req.session.signuperr = false;
    } else {
        res.render("user/signup");
    }
});
router.post("/signup", (req, res) => {
    userhelpers.dosignup(req.body).then((response) => {
        if (response.already) {
            console.log("hai");
            let error = "Email is already in use";
            req.session.signuperr = error;
            res.redirect("/signup");
        } else {
            console.log(response);
            userhelpers.getuser(response).then((response) => {
                req.session.loggedin = true;
                req.session.user = response;
                res.redirect("/login");
            });
        }
    });
});
router.post("/login", (req, res) => {
    userhelpers.dologin(req.body).then((response) => {
        if (response.status) {
            req.session.loggedin = true;
            req.session.user = response.user;
            res.redirect("/");
        } else {
            let error = "Invalid username or password";
            req.session.loginerr = error;
            res.redirect("/login");
        }
    });
});
router.get("/logout", (req, res) => {
    req.session.user = null;
    req.session.loggedin = false;
    res.redirect("/");
});
router.get("/cart", verifylogin, async (req, res) => {
    let user = req.session.user;
    let cartcount = await userhelpers.getcartcount(req.session.user._id);
    let items = await userhelpers.getcartitems(req.session.user._id);
    let price = await userhelpers.gettotalprice(req.session.user._id);
    let charge = 40;
    let total = price + charge;
    if (price > 700) {
        charge = 0;
        total = price + charge;
    }
    if (items) {
        res.render("user/cart", {
            items,
            cartcount,
            user,
            price,
            total,
            charge,
        });
    } else {
        res.render("user/cart", { cartcount, user });
    }
});
router.get("/addtocart/:id", verifylogin, (req, res) => {
    if (req.session.user) {
        userhelpers.addtocart(req.params.id, req.session.user._id).then(() => {
            res.json({ status: true });
        });
    } else {
        res.json({ notlogin: true });
    }
});
router.post("/change-product-quantity", verifylogin, (req, res) => {
    userhelpers
        .changeproductquantity(
            req.body.cart,
            req.body.product,
            req.body.count,
            req.body.quantity
        )
        .then((response) => {
            res.json(response);
        });
});
router.post("/delete-cart-product", verifylogin, (req, res) => {
    userhelpers
        .deletecartproduct(req.body.cart, req.body.product)
        .then((response) => {
            res.json(response);
        });
});
router.get("/place-order", verifylogin, async (req, res) => {
    res.render("user/order", { user: req.session.user });
});
router.post("/order-product", verifylogin, async (req, res) => {
    let products = await userhelpers.getcartitemsfororder(req.session.user._id);
    let totalprice = await userhelpers.gettotalprice(req.session.user._id);
    if (products) {
        userhelpers
            .placeorder(req.body, products, totalprice, req.session.user._id)
            .then((response) => {
                if (response.orderstatus) {
                    res.json("order placed succesfully");
                }
            });
    } else {
        res.json("cart is empty");
    }
});
router.get("/order-placed-successfully", verifylogin, (req, res) => {
    res.render("user/ordersuccess", { user: req.session.user });
});
router.get("/orders", verifylogin, async (req, res) => {
    let orderlist = await userhelpers.getorderitems(req.session.user._id);
    res.render("user/orderlist", { user: req.session.user, orderlist });
});
router.get(
    "/order-product-details/:orderid/:userid",
    verifylogin,
    async (req, res) => {
        let product = await userhelpers.getsingleorder(
            req.params.orderid,
            req.session.user._id
        );
        let order = await userhelpers.getorderitems(req.session.user._id);
        let about = order[0];
        if (product) {
            res.render("user/view-product-details", { product, order, about });
        }
    }
);

module.exports = router;