
//api function to add a new product to the DB
import {Product} from "@/models/Product"
import { mongooseConnect } from "@/lib/mongoose";

export default async function handle(req, res) {
    
    //get request method to test for POST
    const {method} = req;    

    //Connect to DB
    await mongooseConnect()

    if (method === 'GET') {

        //If request is for single id
        if(req.query?.id){
            res.json(await Product.findOne({_id:req.query.id}))
        } else {
            res.json(await Product.find())
        }
 
    }
    
    if (method === 'POST') {
        const {title,description,price,images,category,properties} = req.body
        const productDoc = await Product.create({
            title,description,price,images,category,properties
        })

        //return the created product object
        res.json(productDoc)
    }

    if (method === 'PUT') {
        const {title,description,price,images,_id, category,properties} = req.body
        await Product.updateOne({_id},{title,description,price,images,category,properties})

        //Response true to signify success
        res.json(true)
    }    
    
    if (method === 'DELETE'){
        if(req.query?.id){
            await Product.deleteOne({_id:req.query?.id})
            res.json(true)
        } 
    }
     
    
}