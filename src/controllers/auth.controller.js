const db = require('../utils/dbConfig');
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');

module.exports = {
    signUp: async (req, res) => {
        const now = Math.floor(Date.now() / 1000);
        const {
            user_firstname,
            user_lastname,
            user_email,
            password
        } = req.body;

        let connection;
    
        try
        {
            connection = await db.getConnection();

            const encPassword = CryptoJS.AES.encrypt(password, process.env.CRYPTOJS_SECRET).toString();

            //check if email already exists
            const [ users ] = await connection.execute("SELECT * FROM users WHERE user_email = ? LIMIT 1", [user_email]);

            if(users.length > 0)
            {
                throw new Error('Preffered email already exists');
            }

            let query = `INSERT INTO users 
                (
                    user_firstname, 
                    user_lastname, 
                    user_email, 
                    plain_password, 
                    enc_password, 
                    user_created_at
                ) VALUES (?, ?, ?, ?, ?, ?)
            `;

            const queryParams = [user_firstname, user_lastname, user_email, password, encPassword, now];

            await connection.execute(query, queryParams);

            res.json({
                error:false,
                message:`Sign Up completed`
            })
        }
        catch(e)
        {
            res.json({
                error:true,
                message:e.message
            })
        }
        finally
        {
            if(connection)
            {
                connection.release();
            }
        }
    },
    login: async (req, res) => {
        const { 
            email, 
            password 
        } = req.body;

        const now = Math.floor(Date.now() / 1000);

        let connection;

        try
        {
            connection = await db.getConnection();

            const  [rows ] = await connection.execute("SELECT * FROM users WHERE user_email = ? LIMIT 1", [email]);

            if(rows.length == 0)
            {
                throw new Error("Invalid credentials");
            }

            const user = rows[0];

            const decryptedPassword = CryptoJS.AES.decrypt(user.enc_password, process.env.CRYPTOJS_SECRET);
            const decryptedPasswordToString = decryptedPassword.toString(CryptoJS.enc.Utf8);

            if(decryptedPasswordToString !== password)
            {
                throw new Error('Invalid credentials')
            }

            if(user.user_status == "Inactive")
            {
                throw new Error('Sorry!!! Your account is currently inactive. Please contact administrator')
            }

            //destructure user object to remove passwords
            const { enc_password, plain_password, ...rest } = user;

            const token = jwt.sign(
                rest,
                process.env.JWT_SECRET,
                {
                    expiresIn: 60 * 60 * 24 * 7
                }
            );

            //update last login timestamp
            await connection.execute("UPDATE users SET last_logged_in = ? WHERE user_email = ?", [now, email]);

            res.json({
                error:false,
                user:rest,
                token
            });
        }
        catch(e)
        {
            res.json({
                error:true,
                message:e.message
            })
        }
        finally
        {
            if(connection)
            {
                connection.release();
            }
        }
    }
}