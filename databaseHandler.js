const MongoClient = require('mongodb').MongoClient;
const url = "mongodb+srv://nguyenduong:nguyenduong123@duong.0p1te.mongodb.net/test";
const dbName = "ToyStore"


async function getDbo(){
    const client = await MongoClient.connect(url);
    const dbo = client.db(dbName);
    return dbo;
}

async function checkUser(nameInput, passInput){
    const dbo = await getDbo();
    const results = await dbo.collection("Users").
        findOne({$and:[{Username:nameInput},{Password:passInput}]});
        if(results != null)
            return true;
        else
            return false;
}

async function searchProduct(condition){
    const searchCondition = new RegExp(condition, 'i')
    const dbo = await getDbo();
    const results = await dbo.collection("Product").
        find({Name:searchCondition}).toArray();
    return results;
}

async function findbyID(id){
    var ObjectID = require('mongodb').ObjectID;
    let condition = {"_id" : ObjectID(id)};

    const dbo = await getDbo();
    const results = dbo.collection("Product").findOne(condition);
    return results;
}

async function addProduct(Product){
    const dbo = await getDbo();
    await dbo.collection("Product").insertOne(Product);
}

async function deleteProduct(id){
    var ObjectID = require('mongodb').ObjectID;
    let condition = {"_id" : ObjectID(id)};
    const dbo = await getDbo();
    await dbo.collection("Product").deleteOne(condition);
}

async function updateProduct(id, updateProduct){
    var ObjectID = require('mongodb').ObjectID;
    let condition = {"_id" : ObjectID(id)};
    const dbo = await getDbo();
    await  dbo.collection("Product").updateOne(condition, updateProduct);
}

module.exports = {checkUser, searchProduct, addProduct, deleteProduct, findbyID, updateProduct}