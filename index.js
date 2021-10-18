const exp = require("constants");
const { json } = require("express");
const express = require("express");
const app = express();
const fs = require("fs");

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.get('/', (req, res)=>{
    return res.send("Hello world")
})

app.get("/todos", (req, res)=>{
    const showPending = req.query.showpending;

    fs.readFile("./store/todos.json", "utf-8", (err, data)=>{
        if(err){
            return res.status(500).send("Sorry, something went wrong!")
        }

        const todos = JSON.parse(data)
        if(showPending !== '1'){
            return res.json({todoList: todos})
        }else{
            return res.json({todoList: todos.filter(t =>{return t.complete === false})})
        }
    
    })
})

app.put('/todos/:id/complete', (req, res)=>{
    const id = req.params.id;
    
    const findTodoById = (todos, id)=>{
        for(let i = 0; i<todos.length; i++){
            if(todos[i].id === parseInt(id)){
                return i;
            }
        }
        return -1

    }

    fs.readFile('./store/todos.json', 'utf-8', (err, data)=>{
        if(err){
            return res.status(500).send("Sorry, something went wrong!");
        }
        let todos = JSON.parse(data);
        const todoIndex = findTodoById(todos, id);

        if(todoIndex === -1){
            return res.status(404).send("Page Not Found!")
        }

        // return res.json(todos[todoIndex])
        todos[todoIndex].complete=true;


        fs.writeFile('./store/todos.json', JSON.stringify(todos), ()=>{
            return res.json({'status':'Ok'})
        })
    })
})

app.delete('/todo/:id/deletetodo', (req, res)=>{
    const id = req.params.id
    fs.readFile('./store/todos.json', 'utf-8', (err, data)=>{
        if(err){
            return res.status(404).send("todo not found for the given id");
        }
        let todos = JSON.parse(data);
        let updatedTodos = todos.filter(t=>{
            if(t.id !== parseInt(id)){
                return t;
            }
        });
        todoLength = updatedTodos.length;
        let i = 1
        updatedTodos = updatedTodos.map(t=>{
            if(i<=todoLength){
                t.id = i;
                i+=1;
                return t;
            }
        })
        
        fs.writeFile('./store/todos.json', JSON.stringify(updatedTodos), ()=>{
            return res.json({"status":"Ok"})
        });
    })
})

app.post('/todo', (req,res)=>{
    if(!req.body.name){
        return res.status(400).send("missing name")
    }
    fs.readFile('./store/todos.json', 'utf-8', (err, data)=>{
        if(err){
            return res.status(500).send("Sorry, something went wrong!")

        }
        const todos = JSON.parse(data);
        const maxId = Math.max.apply(Math, todos.map(t =>{return t.id}));

        todos.push({
            id: maxId +1,
            complete: false,
            name: req.body.name
        })

        fs.writeFile('./store/todos.json', JSON.stringify(todos), ()=>{
            return res.json({"status":"Ok"});
        })

    })
})

app.listen(3000, ()=>{
    console.log('application is running on http://localhost:3000')
})