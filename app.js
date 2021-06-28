const express = require('express')
const hbs = require('hbs')
const session = require('express-session');
var app = express();

app.use(session({
    resave: true, 
    saveUninitialized: true, 
    secret: 'abcc##$$0911233$%%%32222', 
    cookie: { maxAge: 60000 }}));

app.use(express.static('public'))

const dbHandler = require('./databaseHandler');

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: false}));

app.set('view engine','hbs')


app.get('/', (req,res)=>{
    res.render('index')
})

app.get('/login',async(req,res)=>{
    if(req.session.username != null){
        const results = await dbHandler.searchProduct('');
        res.render('manager',{name:req.session.username, model:results})
    }else
    res.render('login', {msg:"", nameError:"", passError:""})
})

app.post('/manager', async(req,res)=>{
    const nameInput = req.body.txtName;
    const passInput = req.body.txtPassword;
    const found = await dbHandler.checkUser(nameInput,passInput);
    if(nameInput.trim().length <5){
        res.render('login',{msg:"", passError:"",
        nameError:"Name must be more than 5 characters !"})
    }
    else if(nameInput.includes('@') == false){
        res.render('login',{msg:"", passError:"", 
        nameError:"Missing @ character in username !"})
    }
    else if(nameInput.endsWith('fpt.edu.vn') == false){
        res.render('login',{msg:"", passError:"", 
        nameError:"Must have the extension fpt.edu.vn !"})
    }
    else if(passInput.trim().length <3){
        res.render('login',{msg:"",  nameError:"",
        passError:"Password must be more than 5 characters !"})
    }
    else if(found){
        req.session.username = nameInput;
        const results = await dbHandler.searchProduct('');
        res.render('manager',{name:req.session.username, model:results})
    }else{
        res.render('login',{msg:"Login failed ! Wrong Account !", passError:"", nameError:""})
    }
})

app.post('/search', async(req,res)=>{
    const seachText = req.body.txtName;
    const results = await dbHandler.searchProduct(seachText);
    res.render('manager',{name:req.session.username, model:results})
})

app.get('/add',(req,res)=>{
    if(req.session.username == null){
        res.render('login', {msg:"", nameError:"", passError:""})
    }else
    res.render('add',{name:req.session.username, nameError:'', categoryError:'', priceError:''})
})

app.post('/insert', async(req,res)=>{
    var nameInput = req.body.txtName;
    var categoryInput = req.body.txtCategory;
    var priceInput = req.body.txtPrice;
    if(nameInput.trim().length < 3){
        res.render('add',{name:req.session.username,
            nameError:'Name must be more than 3 characters !', 
            categoryError:'',
            priceError:''})
    }
    else if(isNaN(categoryInput) == false){
        res.render('add',{name:req.session.username,
            nameError:'', 
            categoryError:'Category cannot be single digit !',
            priceError:''})
    }
    else if(categoryInput.trim().length < 3){
        res.render('add',{name:req.session.username,
            nameError:'', 
            categoryError:'Category must be more than 3 characters !',
            priceError:''})
    }
    else if(isNaN(priceInput)){
        res.render('add',{name:req.session.username,
            nameError:'', 
            categoryError:'',
            priceError:'Price must be in digits !'})
    }
    else if(priceInput > 2000){
        res.render('add',{name:req.session.username,
            nameError:'', 
            categoryError:'',
            priceError:'Price must be less than 2000 !'})
    }
    else if(priceInput < 10){
        res.render('add',{name:req.session.username,
            nameError:'', 
            categoryError:'',
            priceError:'Price must be more than 10 !'})
    }
    else{
        var Product = {Name:nameInput,Category:categoryInput, Price:priceInput}
        await dbHandler.addProduct(Product);
        res.redirect('login')
    }
})

app.get('/delete', async(req,res)=>{
    if(req.session.username == null){
        res.render('login', {msg:"", nameError:"", passError:""})
    }
    else{
        const id = req.query.id;
        await dbHandler.deleteProduct(id);
        res.redirect('login')
    }
})

app.get('/update', async(req,res)=>{
    if(req.session.username == null){
        res.render('login', {msg:"", nameError:"", passError:""})
    }
    else{
        const id = req.query.id;
        const results = await dbHandler.findbyID(id);
        res.render('update',{Product:results, name:req.session.username,
                            nameError:'', categoryError:'', priceError:''})
    }
})

app.post('/edit', async(req,res)=>{
    let id = req.body.id;
    let nameInput = req.body.txtName;
    let categoryInput = req.body.txtCategory;
    let priceInput = req.body.txtPrice;
    const results = await dbHandler.findbyID(id);
    if(nameInput.trim().length < 3){
        res.render('update',{Product:results, name:req.session.username,
            nameError:'Name must be more than 3 characters !', 
            categoryError:'',
            priceError:''})
    }
    else if(isNaN(categoryInput) == false){
        res.render('update',{Product:results, name:req.session.username,
            nameError:'', 
            categoryError:'Category cannot be single digit !',
            priceError:''})
    }
    else if(categoryInput.trim().length < 3){
        res.render('update',{Product:results, name:req.session.username,
            nameError:'', 
            categoryError:'Category must be more than 3 characters !',
            priceError:''})
    }
    else if(isNaN(priceInput)){
        res.render('update',{Product:results, name:req.session.username,
            nameError:'', 
            categoryError:'',
            priceError:'Price must be in digits !'})
    }
    else if(priceInput > 2000){
        res.render('update',{Product:results, name:req.session.username,
            nameError:'', 
            categoryError:'',
            priceError:'Price must be less than 2000 !'})
    }
    else if(priceInput < 10){
        res.render('update',{Product:results, name:req.session.username,
            nameError:'', 
            categoryError:'',
            priceError:'Price must be more than 10 !'})
    }
    else{
        var updateProduct = {$set : {Name:nameInput, Category:categoryInput, Price:priceInput}};
        await dbHandler.updateProduct(id,updateProduct);
        res.redirect('login')
    }
})

app.get('/logout',(req,res)=>{
    req.session.destroy();
    res.redirect('login')
})

var PORT = process.env.PORT || 5000
app.listen(PORT);
console.log("Server is running at " + PORT);