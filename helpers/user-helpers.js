var db = require("../config/connection");
var collections = require("../config/collections");
const bcrypt = require("bcryptjs");
const ObjectId = require("mongodb").ObjectId;
module.exports = {
    dosignup: (data) => {
        return new Promise(async (resolve, reject) => {
            var user = await db
                .get()
                .collection(collections.USER_COLLECTION)
                .findOne({ email: data.email });
            if (user) {
                resolve({ already: true });
            } else {
                data.password = await bcrypt.hash(data.password, 10);
                db.get()
                    .collection(collections.USER_COLLECTION)
                    .insertOne(data)
                    .then((result) => {
                        resolve(result.insertedId);
                    })
                    .catch((err) => {
                        reject(err);
                    });
            }
        });
    },
    dologin: (userdata) => {
        return new Promise(async (resolve, reject) => {
            var loginstatus = false;
            let response = {};
            var user = await db
                .get()
                .collection(collections.USER_COLLECTION)
                .findOne({ email: userdata.email });
            if (user) {
                bcrypt
                    .compare(userdata.password, user.password)
                    .then((result) => {
                        if (result) {
                            response.user = user;
                            response.status = true;
                            resolve(response);
                        } else {
                            resolve({ Status: false });
                        }
                    });
            } else {
                console.log("login failed");
                resolve({ Status: false });
            }
        });
    },
    getuser: (id) => {
        return new Promise(async (resolve, reject) => {
            let userdata = await db
                .get()
                .collection(collections.USER_COLLECTION)
                .findOne({ _id: new ObjectId(id) });
            resolve(userdata);
        });
    },
    addtocart: async (productid, userid) => {
        return new Promise(async (resolve, reject) => {
            // getting the cart item size
            let size = await db
                .get()
                .collection(collections.PRODUCT_COLLECTION)
                .findOne({ _id: new ObjectId(productid) });

            // default structure  object of cart products array
            let productobject = {
                item: new ObjectId(productid),
                quantity: 1,
                size: size.size[0],
            };
            // using promise
            // taking user cart from mongodb
            let usercart = await db
                .get()
                .collection(collections.CART_COLLECTION)
                .findOne({ user: new ObjectId(userid) });
            // checking if there is usercart in cart collection
            if (usercart) {
                // finding the index value of the given product
                let proexist = usercart.products.findIndex(
                    (product) => product.item == productid
                );
                // checking if there is a product which is selected is already in the cart
                if (proexist != -1) {
                    // incrementing the value of quantity
                    db.get()
                        .collection(collections.CART_COLLECTION)
                        .updateOne(
                            {
                                user: new ObjectId(userid),
                                "products.item": new ObjectId(productid),
                            },
                            {
                                $inc: { "products.$.quantity": 1 },
                            }
                        )
                        .then(() => {
                            resolve();
                        });
                } else {
                    // pushing the objects to cart if there is no same item in the cart
                    db.get()
                        .collection(collections.CART_COLLECTION)
                        .updateOne(
                            { user: new ObjectId(userid) },
                            {
                                $push: {
                                    products: productobject,
                                },
                            }
                        )
                        .then((response) => {
                            resolve();
                        });
                }
            } else {
                // creating a new cart for a user if there is no cart for him
                let cartobject = {
                    user: new ObjectId(userid),
                    products: [productobject],
                };
                db.get()
                    .collection(collections.CART_COLLECTION)
                    .insertOne(cartobject)
                    .then((response) => {
                        resolve();
                    });
            }
        });
    },
    getcartitems: (userid) => {
        return new Promise(async (resolve, reject) => {
            let cartitems = await db
                .get()
                .collection(collections.CART_COLLECTION)
                .aggregate([
                    {
                        $match: { user: new ObjectId(userid) },
                    },
                    {
                        $unwind: "$products",
                    },
                    {
                        $project: {
                            item: "$products.item",
                            quantity: "$products.quantity",
                            size: "$products.size",
                        },
                    },
                    {
                        $lookup: {
                            from: collections.PRODUCT_COLLECTION,
                            localField: "item",
                            foreignField: "_id",
                            as: "product",
                        },
                    },
                    {
                        $project: {
                            item: 1,
                            quantity: 1,
                            size: 1,
                            product: { $arrayElemAt: ["$product", 0] },
                        },
                    },
                ])
                .toArray();
            if (cartitems[0] == undefined) {
                resolve();
            } else {
                resolve(cartitems);
            }
        });
    },
    getcartcount: (userid) => {
        return new Promise(async (resolve, reject) => {
            let count = 0;
            let cart = await db
                .get()
                .collection(collections.CART_COLLECTION)
                .findOne({ user: new ObjectId(userid) });
            if (cart) {
                count = cart.products.length;
                resolve(count);
            }
            resolve(count);
        });
    },
    changeproductquantity: (cartid, productid, count, quantity) => {
        count = parseInt(count);
        return new Promise((resolve, reject) => {
            if (quantity == 1 && count == -1) {
                db.get()
                    .collection(collections.CART_COLLECTION)
                    .updateOne(
                        { _id: new ObjectId(cartid) },
                        {
                            $pull: {
                                products: { item: new ObjectId(productid) },
                            },
                        }
                    )
                    .then(() => {
                        resolve({ removedproduct: true });
                    });
            } else {
                db.get()
                    .collection(collections.CART_COLLECTION)
                    .updateOne(
                        {
                            _id: new ObjectId(cartid),
                            "products.item": new ObjectId(productid),
                        },
                        {
                            $inc: { "products.$.quantity": count },
                        }
                    )
                    .then((response) => {
                        resolve({ removedproduct: false });
                    });
            }
        });
    },
    deletecartproduct: (cartid, productid) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collections.CART_COLLECTION)
                .updateOne(
                    { _id: new ObjectId(cartid) },
                    {
                        $pull: {
                            products: { item: new ObjectId(productid) },
                        },
                    }
                );
            resolve({ removedproduct: true });
        });
    },
    gettotalprice: (userid) => {
        return new Promise(async (resolve, reject) => {
            let total = await db
                .get()
                .collection(collections.CART_COLLECTION)
                .aggregate([
                    {
                        $match: { user: new ObjectId(userid) },
                    },
                    {
                        $unwind: "$products",
                    },
                    {
                        $project: {
                            item: "$products.item",
                            quantity: "$products.quantity",
                        },
                    },
                    {
                        $lookup: {
                            from: collections.PRODUCT_COLLECTION,
                            localField: "item",
                            foreignField: "_id",
                            as: "product",
                        },
                    },
                    {
                        $project: {
                            item: 1,
                            quantity: 1,
                            product: { $arrayElemAt: ["$product", 0] },
                        },
                    },
                    {
                        $group: {
                            _id: null,
                            total: {
                                $sum: {
                                    $multiply: ["$quantity", "$product.price"],
                                },
                            },
                        },
                    },
                ])
                .toArray();
            if (total[0] == undefined) {
                resolve();
            } else {
                resolve(total[0].total);
            }
        });
    },
    //
    getcartitemsfororder: (userid) => {
        return new Promise(async (resolve, reject) => {
            let product = await db
                .get()
                .collection(collections.CART_COLLECTION)
                .findOne({ user: new ObjectId(userid) });
            if (product) {
                resolve(product.products);
            } else {
                resolve();
            }
        });
    },
    //
    placeorder: (argument, products, totalprice, userid) => {
        console.log(products);
        return new Promise(async (resolve, reject) => {
            let orderobj = {
                address: {
                    fname: argument.fname,
                    lname: argument.lname,
                    email: argument.email,
                    countryphonenumber: argument.countryphonenumber,
                    number: argument.number,
                    address: argument.address,
                    state: argument.state,
                    city: argument.city,
                    roadareacolony: argument.roadareacolony,
                    pincode: argument.pincode,
                    housenumber: argument.housenumber,
                },
                user: new ObjectId(argument.user),
                product: products,
                status: "pending",
                date: new Date().getDate(),
                month: new Date().getMonth(),
                year: new Date().getFullYear(),
                price: totalprice,
            };
            db.get()
                .collection(collections.ORDER_COLLECTION)
                .insertOne(orderobj)
                .then((response) => {
                    db.get()
                        .collection(collections.CART_COLLECTION)
                        .deleteOne({ user: new ObjectId(userid) })
                        .then((response) => {
                            console.log(response);
                            resolve({ orderstatus: true });
                        });
                });
        });
    },
    getorderitems: (userid) => {
        return new Promise(async (resolve, reject) => {
            let items = await db
                .get()
                .collection(collections.ORDER_COLLECTION)
                .aggregate([
                    {
                        $match: { user: new ObjectId(userid) },
                    },
                    // {
                    //     $unwind: "$product",
                    // },
                    {
                        $project: {
                            address: "$address",
                            status: "$status",
                            date: "$date",
                            price: "$price",
                            user: "$user",
                            item: "$product.item",
                            quantity: "$product.quantity",
                            date: "$date",
                            month: "$month",
                            year: "$year",
                        },
                    },
                    // {
                    //     $lookup: {
                    //         from: collections.PRODUCT_COLLECTION,
                    //         localField: "item",
                    //         foreignField: "_id",
                    //         as: "product",
                    //     },
                    // },
                    // {
                    //     $project: {
                    //         date: 1,
                    //         month: 1,
                    //         year: 1,
                    //         user: 1,
                    //         item: 1,
                    //         quantity: 1,
                    //         status: 1,
                    //         address: 1,
                    //         product: { $arrayElemAt: ["$product", 0] },
                    //         price: 1,
                    //     },
                    // },
                ])
                .toArray();
            if (items) {
                resolve(items);
            } else {
                resolve();
            }
        });
    },
    getsingleorder: (orderid, userid) => {
        return new Promise(async (resolve, reject) => {
            let items = await db
                .get()
                .collection(collections.ORDER_COLLECTION)
                .aggregate([
                    {
                        $match: { user: new ObjectId(userid) },
                    },
                    {
                        $match: { _id: new ObjectId(orderid) },
                    },
                    {
                        $unwind: "$product",
                    },
                    {
                        $project: {
                            address: "$address",
                            status: "$status",
                            date: "$date",
                            price: "$price",
                            user: "$user",
                            item: "$product.item",
                            quantity: "$product.quantity",
                            size:'$product.size',
                            date: "$date",
                            month: "$month",
                            year: "$year",
                        },
                    },
                    {
                        $lookup: {
                            from: collections.PRODUCT_COLLECTION,
                            localField: "item",
                            foreignField: "_id",
                            as: "product",
                        },
                    },
                    {
                        $project: {
                            date: 1,
                            month: 1,
                            year: 1,
                            user: 1,
                            item: 1,
                            quantity: 1,
                            size:1,
                            status: 1,
                            address: 1,
                            product: { $arrayElemAt: ["$product", 0] },
                            price: 1,
                        },
                    },
                ])
                .toArray();
            if (items) {
                resolve(items);
            } else {
                resolve();
            }
        });
    },
    changesize: (selectedsize, cartid, productid) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collections.CART_COLLECTION)
                .updateOne(
                    {
                        _id: new ObjectId(cartid),
                        "products.item": new ObjectId(productid),
                    },
                    {
                        $set: { "products.$.size": selectedsize },
                    }
                )
                .then((response) => {
                    resolve(selectedsize);
                });
        });
    },
};
