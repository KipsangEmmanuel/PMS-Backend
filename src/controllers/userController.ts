import { Request, Response } from 'express'
import mssql from 'mssql'
import {v4} from 'uuid'
import bcrypt from 'bcrypt'
import { sqlConfig } from '../config/sqlConfig'
import jwt from 'jsonwebtoken'
// import dotenv from 'dotenv'
import { LoginUser } from '../interfaces/user'
import Connection from '../dbhelpers/dbhelper'
import { ExtendedUser } from '../middleware/verifyToken'

const dbhelper = new Connection

export const registerUser = async(req:Request, res: Response) =>{
    try {
        let {name, email, phone_no, id_no, KRA_PIN, NHIF_NO, NSSF_NO, password} = req.body

        let user_id = v4()

        const hashedPwd = await bcrypt.hash(password, 5)

        // const pool = await mssql.connect(sqlConfig)

        // let result = await pool.request()
        // .input("employee_id", mssql.VarChar, employee_id) 
        // .input("name", mssql.VarChar, name)
        // .input("email", mssql.VarChar, email)
        // .input("phone_no", mssql.VarChar, phone_no)
        // .input("id_no", mssql.Int, id_no)
        // .input("KRA_PIN", mssql.VarChar, KRA_PIN)
        // .input("NSSF_NO", mssql.VarChar, NSSF_NO)
        // .input("NHIF_NO", mssql.VarChar, NHIF_NO) 
        // .input("password", mssql.VarChar, hashedPwd)
        // .execute('registerEmployee')
        
        let result = dbhelper.execute('registerUser', {
            user_id, name, email, phone_no, id_no, KRA_PIN, NHIF_NO, NSSF_NO, password: hashedPwd
        })
        

        return res.status(200).json({
            message: 'User registered successfully'
        })
        
    } catch (error) {
        return res.json({
            error: error
        })
    }
}

export const loginUser = async(req:Request, res: Response) =>{
    try {
        const {email, password} = req.body

        const pool = await mssql.connect(sqlConfig)

        let user = await (await pool.request().input("email", email).input("password", password).execute('loginEmployee')).recordset
        
        if(user[0]?.email  == email){
            const CorrectPwd = await bcrypt.compare(password, user[0]?.password)

            if(!CorrectPwd){
                return res.status(401).json({
                    message: "Incorrect password"
                })
            }

            const LoginCredentials = user.map(records =>{
                const {phone_no, id_no, KRA_PIN, password, NSSF_NO, NHIF_NO, welcomed, ...rest}=records

                return rest
            })

            console.log(LoginCredentials);

            // dotenv.config()
            const token = jwt.sign(LoginCredentials[0], process.env.SECRET as string, {
                expiresIn: '3600s'
            })

            return res.status(200).json({
                message: "Logged in successfully", token
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
        // let employees = (await pool.request().query('SELECT * FROM Employees')).recordset

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