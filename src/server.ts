import express, { NextFunction, Request, Response, json } from 'express'
import dotenv from 'dotenv'
dotenv.config();

const app = express()

app.use(json())


app.use((error: Error, req:Request, res:Response, next:NextFunction)=>{
    res.json({
        message: error.message
    })
})

const port = process.env.PORT || 7500

app.listen(port, ()=>{
    console.log(`Server running on port ${port}`);
})