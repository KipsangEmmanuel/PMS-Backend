import { Request, Response } from 'express'
import mssql from 'mssql'
import {v4} from 'uuid'
import bcrypt from 'bcrypt'
import { sqlConfig, testConnection } from '../config/sqlConfig'
import jwt from 'jsonwebtoken'
// import dotenv from 'dotenv'
import { LoginUser } from '../interfaces/user'
import Connection from '../dbhelpers/dbhelper'
import { ExtendedUser } from '../middleware/verifyToken'

const dbhelper = new Connection

export const registerUser = async(req:Request, res: Response) =>{
    try {
        let {name, email, password, role} = req.body

        let user_id = v4()

        const hashedPwd = await bcrypt.hash(password, 5)
        
        let result = await dbhelper.execute('registerUser', {
            user_id,
            name,
            email,
            password: hashedPwd,
            role,
        })
        console.log(result);
        
        

        return res.status(200).json({
            message: 'User registered successfully'
        });
        
    } catch (error) {
        return res.status(500).json({
            error: 'An error occurred while registering the user.'
        })
    }
}

export const loginUser = async(req:Request, res: Response) =>{
    try {
        const {email, password} = req.body

        // console.log(email);
        
        // testConnection()
        const pool = await mssql.connect(sqlConfig);
        // console.log(pool);


        

        let user = await (await pool
            .request()
            .input("email", email)
            .input("password", password)
            .execute('loginUser')).recordset

            // console.log(user);
            
        
        if(user[0]?.email  == email){
            // const CorrectPwd = await bcrypt.compare(password, user[0]?.password)
            const CorrectPwd = password
            // console.log(password);
            

            if(!CorrectPwd){
                return res.status(401).json({
                    message: "Incorrect password"
                })
            }

            const LoginCredentials = user.map(records =>{
                const {...rest}=records

                return rest
            })

            // console.log(LoginCredentials);

            // dotenv.config()
            const token = jwt.sign(LoginCredentials[0], process.env.SECRET as string, {
                expiresIn: '24hr'
            })

            return res.status(200).json({
                message: "Logged in successfully",
                token
            })
            
        }else{
            return res.json({
                message: "Email not found"
            })
        }

    } catch (error) {
        return res.json({
            error: error
        })
    }
}

export const getAllUsers = async(req:Request, res:Response)=>{
    try {

        const pool = await mssql.connect(sqlConfig)

        let users = (await pool.request().execute('fetchAllUsers')).recordset
        // let users = (await pool.request().query('SELECT * FROM Users')).recordset

        return res.status(200).json({
            users: users
        })
        
    } catch (error) {
        return res.json({
            error: error
        })
    }
}

export const checkUserDetails = async (req:ExtendedUser, res:Response)=>{
    
    if(req.info){


        return res.json({
            info: req.info
        })
    }
}