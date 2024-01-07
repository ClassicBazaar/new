var db = require("../config/connection");
var collections = require("../config/collections");
const { response } = require("express");
const ObjectId = require("mongodb").ObjectId;
const bcrypt = require("bcryptjs");
module.exports = {
    addproduct: (product) => {
        return new Promise((resolve, reject) => {
            product.size = product.size.split(",");
            console.log(product);
            db.get()
                .collection("products")
                .insertOne(product)
                .then((data) => {
                    resolve(data);
                });
        });
    },
    getallproducts: (category) => {
        return new Promise(async (resolve, reject) => {
            if (category) {
                let products = await db
                    .get()
                    .collection(collections.PRODUCT_COLLECTION)
                    .find({ category: category })
                    .toArray();
                resolve(products);
            } else {
                let products = await db
                    .get()
                    .collection(collections.PRODUCT_COLLECTION)
                    .find()
                    .toArray();
                resolve(products);
            }
        });
    },
    deleteproduct: (productid) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collections.PRODUCT_COLLECTION)
                .deleteOne({ _id: new ObjectId(productid) })
                .then((response) => {
                    resolve(response);
                });
        });
    },
    getproduct: (productid) => {
        return new Promise(async (resolve, reject) => {
            db.get()
                .collection(collections.PRODUCT_COLLECTION)
                .findOne({ _id: new ObjectId(productid) })
                .then((result) => {
                    resolve(result);
                });
        });
    },
    updateproduct: (id, product) => {
        product.size = product.size.split(",");
        return new Promise((resolve, reject) => {
            if (product.image) {
                db.get()
                    .collection(collections.PRODUCT_COLLECTION)
                    .updateOne(
                        { _id: new ObjectId(id) },
                        {
                            $set: {
                                name: product.name,
                                price: product.price,
                                category: product.category,
                                offer: product.offer,
                                charge: product.charge,
                                size: product.size,
                                image: product.image,
                            },
                        }
                    )
                    .then((response) => {
                        resolve(response);
                    });
            } else {
                db.get()
                    .collection(collections.PRODUCT_COLLECTION)
                    .updateOne(
                        { _id: new ObjectId(id) },
                        {
                            $set: {
                                name: product.name,
                                price: product.price,
                                category: product.category,
                                offer: product.offer,
                                charge: product.charge,
                                size: product.size,
                            },
                        }
                    )
                    .then((response) => {
                        resolve(response);
                    });
            }
        });
    },
    getallorder: () => {
        return new Promise(async (resolve, reject) => {
            let orders = await db
                .get()
                .collection(collections.ORDER_COLLECTION)
                .aggregate([
                    {
                        $project: {
                            address: "$address",
                            status: "$status",
                            date: "$date",
                            price: "$price",
                            user: "$user",
                            item: "$product.item",
                            quantity: "$product.quantity",
                            size: "$product.size",
                            date: "$date",
                            month: "$month",
                            year: "$year",
                        },
                    },
                    {
                        $lookup: {
                            from: collections.USER_COLLECTION,
                            localField: "user",
                            foreignField: "_id",
                            as: "user",
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
                            size: 1,
                            status: 1,
                            address: 1,
                            user: { $arrayElemAt: ["$user", 0] },
                            price: 1,
                        },
                    },
                ])
                .toArray();
            if (orders) {
                resolve(orders);
            } else {
                resolve();
            }
        });
    },
    getsingleorder: (orderid, userid) => {
        return new Promise(async (resolve, reject) => {
            console.log("hello");
            let product = await db
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
                            size: "$product.size",
                            date: "$date",
                            month: "$month",
                            year: "$year",
                        },
                    },
                    {
                        $lookup: {
                            from: collections.USER_COLLECTION,
                            localField: "user",
                            foreignField: "_id",
                            as: "user",
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
                            size: 1,
                            status: 1,
                            address: 1,
                            user: { $arrayElemAt: ["$user", 0] },
                            product: { $arrayElemAt: ["$product", 0] },
                            price: 1,
                        },
                    },
                ])
                .toArray();
            if (product) {
                resolve(product);
            } else {
                resolve();
            }
        });
    },
    changestatus: (type, orderid) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collections.ORDER_COLLECTION)
                .updateOne(
                    { _id: new ObjectId(orderid) },
                    {
                        $set: {
                            status: type,
                        },
                    }
                )
                .then(() => {
                    resolve();
                });
        });
    },
    deleteorder: (orderid) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collections.ORDER_COLLECTION)
                .deleteOne({ _id: new ObjectId(orderid) })
                .then(() => {
                    resolve({ status: true });
                });
        });
    },
    adminlogin: (data) => {
        return new Promise(async (resolve, reject) => {
            let admin = await db
                .get()
                .collection(collections.ADMIN_COLLECTTION)
                .findOne({ name: data.name });
            if (admin) {
                bcrypt.compare(data.password, admin.password).then((result) => {
                    if (data.email === admin.email) {
                        if (result) {
                            console.log("hai");
                            response.admin = admin;
                            response.status = true;
                            resolve(response);
                        } else {
                            console.log("hello");
                            resolve({ Status: false });
                        }
                    } else {
                        console.log("admin login failed");
                        resolve({ Status: false });
                    }
                });
            } else {
                console.log("admin login failed");
                resolve({ Status: false });
            }
        });
    },
    addcategories: (data) => {
        return new Promise(async (resolve, reject) => {
            let collection = await db
                .get()
                .collection(collections.CATEGORY_COLLECTION)
                .findOne();

            let Object = {
                category: [data],
            };
            if (collection) {
                db.get()
                    .collection(collections.CATEGORY_COLLECTION)
                    .updateOne(
                        { _id: new ObjectId(collection._id) },
                        {
                            $push: { category: data },
                        }
                    )
                    .then((response) => {
                        resolve(response);
                    });
            } else {
                db.get()
                    .collection(collections.CATEGORY_COLLECTION)
                    .insertOne(Object)
                    .then((response) => [resolve(response)]);
            }
        });
    },
    getcategoriesforproductpage: () => {
        return new Promise(async (resolve, reject) => {
            let category = await db
                .get()
                .collection(collections.CATEGORY_COLLECTION)
                .aggregate([
                    {
                        $project: {
                            category: "$category.name",
                        },
                    },
                ])
                .toArray();
            resolve(category[0].category);
        });
    },
    deletecategory: (name) => {
        return new Promise(async (resolve, reject) => {
            let category = await db
                .get()
                .collection(collections.CATEGORY_COLLECTION)
                .updateOne(
                    {},
                    {
                        $pull: {category:{name:name  },}
                    }
                );

            console.log(category);
            resolve(category)
        });
    },
};
