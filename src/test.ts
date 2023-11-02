import { Request, Response } from 'express';
import { v4 } from 'uuid';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sqlConfig } from '../config/sqlConfig';
import Connection from '../dbhelpers/dbhelper';
import { ExtendedUser } from '../middleware/verifyToken';

const dbhelper = new Connection();

export const registerUser = async (req: Request, res: Response) => {
    try {
        const { name, email, password, role } = req.body;
        const user_id = v4();
        const hashedPwd = await bcrypt.hash(password, 5);

        // Ensure that the execute function returns a result
        const result = await dbhelper.execute('registerUser', {
            user_id,
            name,
            email,
            password: hashedPwd,
            role,
        });

        return res.status(200).json({
            message: 'User registered successfully',
        });
    } catch (error) {
        return res.status(500).json({
            error: 'An error occurred while registering the user.',
        });
    }
};

export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const pool = await mssql.connect(sqlConfig);

        const user = await pool
            .request()
            .input('email', email)
            .input('password', password)
            .execute('loginUser');

        if (user.recordset[0]?.email === email) {
            const CorrectPwd = await bcrypt.compare(password, user.recordset[0]?.password);

            if (!CorrectPwd) {
                return res.status(401).json({
                    message: 'Incorrect password',
                });
            }

            // Create a LoginCredentials object, if needed

            const token = jwt.sign(user.recordset[0], process.env.SECRET, {
                expiresIn: '1hr',
            });

            return res.status(200).json({
                message: 'Logged in successfully',
                token,
            });
        } else {
            return res.status(404).json({
                message: 'Email not found',
            });
        }
    } catch (error) {
        return res.status(500).json({
            error: 'An error occurred while logging in.',
        });
    }
};

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const pool = await mssql.connect(sqlConfig);
        const users = await pool.request().execute('fetchAllUsers');

        return res.status(200).json({
            users: users.recordset,
        });
    } catch (error) {
        return res.status(500).json({
            error: 'An error occurred while fetching users.',
        });
    }
};

export const checkUserDetails = (req: ExtendedUser, res: Response) => {
    if (req.info) {
        return res.status(200).json({
            info: req.info,
        });
    } else {
        return res.status(404).json({
            message: 'User information not found',
        });
    }
};
