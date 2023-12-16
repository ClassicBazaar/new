var express = require("express");
var router = express.Router();
var producthelper = require("../helpers/product-helpers");

/* GET users listing. */
// verifing admin login
const verifyadminlogin = (req, res, next) => {
    if (req.session.adminloggedin) {
        next();
    } else {
        res.redirect("/admin/admin-login");
    }
};
//improtrant admin login

router.get("/admin-login", (req, res) => {
    if (req.session.adminloggedin) {
        res.redirect("/admin");
    } else {
        res.render("admin/login", { adminloginerr: req.session.adminloginerr });
        req.session.adminloginerr = false;
    }
});
router.post("/admin-login", (req, res) => {
    producthelper.adminlogin(req.body).then((response) => {
        if (response.status) {
            req.session.adminloggedin = true;
            req.session.admin = response.admin;
            res.redirect("/admin");
        } else {
            let error = "Invalid  username or Email or password";
            req.session.adminloginerr = error;
            res.redirect("/admin/admin-login");
        }
    });
});
router.get("/logout", verifyadminlogin, (req, res) => {
    req.session.admin = null;
    req.session.adminloggedin = false;
    res.redirect("/admin/admin-login");
});
//other rourtes
router.get("/", verifyadminlogin, (req, res, next) => {
    producthelper.getallproducts().then((products) => {
        res.render("admin/view-products", {
            admin: true,
            products,
            admin: req.session.admin,
        });
    });
});

router.get("/add-product", verifyadminlogin, (req, res) => {
    res.render("admin/add-product", { admin: true });
});
router.post("/add-product", verifyadminlogin, (req, res) => {
    //  console.log(req.files.image);
    req.body.price = parseInt(req.body.price);
    producthelper.addproduct(req.body, (id) => {
        var image = req.files.image;
        image.mv("./public/product-images/" + id + ".jpg", (err, done) => {
            if (!err) {
                producthelper.getallproducts().then((products) => {
                    res.redirect("/admin");
                });
            } else {
                console.log(err);
            }
        });
    });
});
router.get("/delete-product/:id", verifyadminlogin, (req, res) => {
    let productid = req.params.id;
    console.log(productid);
    producthelper.deleteproduct(productid).then((response) => {
        console.log(response);
        res.redirect("/admin/");
    });
});
router.get("/edit-product/:id", verifyadminlogin, async (req, res) => {
    console.log("haiu");
    let product = await producthelper.getproduct(req.params.id);
    console.log(product);
    res.render("admin/edit-product", { product });
});
router.post("/edit-product/:id", verifyadminlogin, (req, res) => {
    req.body.price = parseInt(req.body.price);
    let id = req.params.id;
    let image = req.files.image;
    producthelper.updateproduct(req.params.id, req.body).then(() => {
        res.redirect("/admin");
        if (req.files.image) {
            console.log("hai");
            image.mv("./public/product-images/" + id + ".jpg");
        } else {
            console.log("error");
        }
    });
});
router.get("/allorders", verifyadminlogin, async (req, res) => {
    console.log("hai");
    let orders = await producthelper.getallorder();
    res.render("admin/allorders", { admin: true, orders });
});
router.get("/view-products/:orderid/:userid",verifyadminlogin, async (req, res) => {
    console.log('hello');
    console.log(req.params.orderid, req.params.userid);
    let products = await producthelper.getsingleorder(
        req.params.orderid,
        req.params.userid
    );
    let about = products[0];
    res.render("admin/view-order-products",  {
        admin: true,
        products,
        about,
    });
});
router.post("/change-status", verifyadminlogin, (req, res) => {
    producthelper.changestatus(req.body.type, req.body.orderid).then(() => {
        res.json({ status: req.body.type });
    });
});
router.get("/delete-order/:id", verifyadminlogin, (req, res) => {
    producthelper.deleteorder(req.params.id).then((response) => {
        if (response.status) {
            res.redirect("/admin/allorders");
        }
    });
});
module.exports = router;
