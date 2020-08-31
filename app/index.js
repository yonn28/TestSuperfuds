const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mysql = require('mysql');
const myConnection = require('express-myconnection');


app.use(morgan('dev'));
app.use(bodyParser.json()); // body en formato json
app.use(bodyParser.urlencoded({ extended: false })); //body formulario


app.use(myConnection(mysql,{
    host:'dev-superfuds.cm8heorrngqo.sa-east-1.rds.amazonaws.com',
    user:'testuser',
    password:'$up3rFud$',
    database: 'test'
},'single'));


Array.prototype.groupBy = function(prop) {
    return this.reduce(function(groups, item) {
      const val = item[prop]
      groups[val] = groups[val] || []
      groups[val].push(item)
      return groups
    }, {})
  }

app.get('/', async(req,res)=>{
    req.getConnection((err,conn)=>{
        conn.query("select * from  Warehouse LEFT JOIN Warehouse_description ON Warehouse.warehouse_id=Warehouse_description.fk_warehouse_id",(err, rows)=>{
            if(err){
                res.json(err);
            }
            const response = rows.groupBy('name');
            res.json({response})
        })
    })

})


app.post('/',(req, res)=>{
    const data = req.body;
    req.getConnection((err,conn)=>{
        if(err){res.json(err);}

        conn.query('insert into Warehouse (name,headquarters_number) values (?,?)',[data.name, data.headquartersNumber],(err,response)=>{
            if(err){
                res.status(500).json(err);
            }

            data.description.forEach(element => {
                console.log(element);
                conn.query('insert into Warehouse_description (fk_warehouse_id,phone,city,address) values (?,?,?,?)',[response.insertId,element.phone,element.city,element.address],(err,response2)=>{
                    if(err){res.status(500).json(err);}
                    console.log(response2);
                })
            });

            res.status(200).json({response})
        })

    });
})

app.put('/:id',(req,res)=>{
    const { id } = req.params;
    const data = req.body;

    req.getConnection((err, conn)=>{
        if(err){
            res.json(err);
        }
        conn.query('UPDATE Warehouse set name=? ,headquarters_number=? WHERE warehouse_id =  ?',[data.name,data.headquartersNumber,id], (err, response)=>{
            if(err){
                res.json(err);
            }
            res.status(200).json({response})
        });
    })

})

app.delete('/:id',(req, res)=>{
    const { id } = req.params;
    req.getConnection((err, conn)=>{
        if(err){
            res.json(err);
        }
        conn.query('DELETE FROM Warehouse  WHERE  warehouse_id = ?',[id], (err, response)=>{
            if(err){
                res.json(err);
            }
            res.status(200).json({response})
        });
    })
})


app.listen(3000, ()=>{
    console.log(`listen on port 3000`);
})