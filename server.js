// node js express settings
var express = require("express")
const app = express()
const port = 8383
app.use(express.json())

// nodemon server.js to livereload.

// firebase configuration 
var firebase = require("./firebase")
var db = firebase.db

app.get('/expenses', (req, res) =>{
    db.ref("expenses").on("value", (snapshot) => {
        const data = snapshot.val();
        res.status(200).send(data)
    });
})

app.get('/this-month-expenses', async (req, res) => {
    var date = new Date();
    var firstDay = (new Date(date.getFullYear(), date.getMonth(), 1).toISOString()).toString('YYYY-MM-DD HH:mm:ss');

    var expenses = []

    expenses.push(
        await db.ref("expenses").orderByChild('when').startAt(firstDay).get('child_added', (snapshot) => {
            return snapshot.val()
        })
    )

    res.status(200).send(expenses)
})

app.get('/expense/:id', async (req, res) => {
    const expenseID = String(req.params.id);
    
    db.ref("expenses").child(expenseID).on('value', (snapshot) => {
        res.status(200).send(snapshot.val())
    })
    
})

app.delete('/expense/:id', async (req, res) => {
    const expenseID = String(req.params.id);

    db.ref("test").child(expenseID).remove(
        ()=>{
            res.status(200).send({
                "deleted": true
            })
        },
        ()=>{
            res.status(200).send({
                "deleted": false
            })
        }
    );
})

app.get('/category/:id', async (req, res) => {
    const categoryID = String(req.params.id);
    
    db.ref("categories").child(categoryID).on('value', (snapshot) => {
        res.status(200).send(snapshot.val())
    })    
})

app.get('/beneficiary/:id', async (req, res) => {
    const beneficiaryID = String(req.params.id);
    
    db.ref("beneficiaries").child(beneficiaryID).on('value', (snapshot) => {
        res.status(200).send(snapshot.val())
    })

})

app.post('/create-expense', async (req, res) => {
    const { amount, beneficiary, category, description, paidFrom, when } = req.body

    db.ref("test").push({
        "amount": amount,
        "beneficiary": beneficiary,
        "category": category,
        "description": description,
        "paidFrom": paidFrom,
        "when": when
    }).then(
        (id)=>{
            res.status(200).send(
                {"id":id.key}
            )
        }
    )
})

app.listen(port, () => console.log(`Server has started on port: ${port}`))