const db = require('../utils/dbConfig');
const CryptoJS = require('crypto-js');

module.exports = {
    create: async (req, res) => {
        const {
            user_firstname,
            user_lastname,
            user_email,
            user_role,
            password
        } = req.body;

        const now = Math.floor(Date.now() / 1000); 
        const stateCode = !req.body.user_state_code ? null : req.body.user_state_code;

        let connection;

        try
        {
            connection = await db.getConnection();

            const encPassword = CryptoJS.AES.encrypt(password, process.env.CRYPTOJS_SECRET).toString();

            //check if email already exists
            const [ users ] = await connection.execute("SELECT * FROM users WHERE user_email = ? LIMIT 1", [ user_email]);

            if(users.length > 0)
            {
                throw new Error("The provided email address already exist")
            }

            //insert user into database
            await connection.execute(`
                INSERT INTO users (user_firstname, user_lastname, user_email, enc_password, plain_password, user_role, user_state_code, user_created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [ user_firstname, user_lastname, user_email, encPassword, password, user_role, stateCode, now ]);

            res.json({
                error: false,
                message:'User created successfully'
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
    readAll: async (req, res) => {
        const {
            user_status,
            user_role
        } = req.query;

        const page = req.query.page ? parseInt(req.query.page) : null;
        const perPage = req.query.perPage ? parseInt(req.query.perPage) : null;

        let query = "SELECT * FROM users WHERE 1 = 1";
        const queryParams = [];

        let query2 = "SELECT COUNT(*) AS total_records FROM users WHERE 1 = 1";
        const queryParams2 = [];

        if(user_status)
        {
            query += " AND user_status = ?";
            queryParams.push(user_status);

            query2 += " AND user_status = ?";
            queryParams2.push(user_status);
        }
        
        if(user_role)
        {
            query += " AND user_role = ?";
            queryParams.push(user_role);

            query2 += " AND user_role = ?";
            queryParams2.push(user_role);
        }

        query += " ORDER BY user_id DESC";

        if(page && perPage)
        {
            const offset = (page - 1) * perPage;
            query += " LIMIT ?, ?";
            queryParams.push(offset);
            queryParams.push(perPage);
        }

        let connection;

        try
        {
            connection = await db.getConnection();

            const [ data ] = await connection.execute(query, queryParams);
            const [ total ] = await connection.execute(query2, queryParams2);

            /* PAGINATION DETAILS */

            //total records
            const totalRecords = parseInt(total[0].total_records);

            // Calculate total pages if perPage is specified
            const totalPages = perPage ? Math.ceil(totalRecords / perPage) : null;

            // Calculate next and previous pages based on provided page and totalPages
            const nextPage = page && totalPages && page < totalPages ? page + 1 : null;
            const prevPage = page && page > 1 ? page - 1 : null;

            res.json({
                error: false,
                data,
                paginationData: {
                    totalRecords,
                    totalPages,
                    currentPage: page,
                    itemsPerPage: perPage,
                    nextPage,
                    prevPage
                }
            })
        }
        catch(e)
        {
            res.json({
                error: true,
                message: e.message
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
    getForDataTable: async (req, res) => {
        //dataTable Server-Side parameters
        var columns = [
            'user_id',
            'user_firstname',
            'user_lastname',
            'user_email',
            'user_role',
            'user_state_code',
            'user_created_at',
            'user_status'
        ];

        var draw = parseInt(req.query.draw);
        var start = parseInt(req.query.start);
        var length = parseInt(req.query.length);
        var orderCol = req.query.order[0].column;
        var orderDir = req.query.order[0].dir;
        var search = req.query.search.value;

        var dTData = dTNumRows = dNumRowsFiltered = where = "";
        var filter = search == "" || search == null ? false : true;
        orderCol = columns[orderCol];
        var columnsJoined = columns.join(', ') 

        const { 
            user_status,
            user_role
        } = req.query;

        let query = `SELECT * FROM users WHERE 1 = 1`;
        const queryParams = [];

        if(user_status)
        {
            query += " AND user_status = ?";
            queryParams.push(user_status);
        }

        if(user_role)
        {
            query += " AND user_role = ?";
            queryParams.push(user_role);
        }

        query += " ORDER BY user_id DESC";

        let connection;
        
        try
        {    
            connection = await db.getConnection();

            const [ rows ] = await connection.execute(query, queryParams);
            //console.log(query, queryParams)

            dTNumRows = rows.length;

            if(filter)
            {
                where += "WHERE ";
                var i = 0;
                var len = columns.length - 1;

                for(var x = 0; x < columns.length; x++)
                {
                    if(i == len)
                    {
                        where += `${columns[x]} LIKE '%${search}%'`;
                    }
                    else
                    {
                        where += `${columns[x]} LIKE '%${search}%' OR `;
                    }

                    i++;
                }

                const [ rows1 ] = await connection.execute(`SELECT * FROM (${query})X ${where}`, queryParams);

                dNumRowsFiltered = rows1.length;
            }
            else
            {
                dNumRowsFiltered = dTNumRows;
            }

            const [ rows2 ] = await connection.execute(`SELECT ${columns} FROM (${query})X ${where} ORDER BY ${orderCol} ${orderDir} LIMIT ${length} OFFSET ${start}`, queryParams);

            if(rows2.length > 0)
            {
                var data = [];
                var rtData = rows2;

                for(var i = 0; i < rtData.length; i++) 
                {
                    rtData[i].DT_RowId = rtData[i].user_id;
                    data.push(rtData[i]);
                };

                dTData = data;
            }
            else
            {
                dTData = [];  
            }

            var responseData = {
                draw:draw,
                recordsTotal:dTNumRows,
                recordsFiltered:dNumRowsFiltered,
                data:dTData
            }

            res.send(responseData);

        }
        catch(e)
        {
            console.log(e.message)
        }
        finally
        {
            connection.release();
        }
    },
    readOne: async (req, res) => {
        const {
            user_id
        } = req.params;

        let query = "SELECT * FROM users WHERE user_id = ? LIMIT 1";
        const queryParams = [ user_id ];

        let connection;

        try
        {
            connection = await db.getConnection();

            const [ users ] = await connection.execute(query, queryParams);

            if(users.length === 0)
            {
                throw new Error("User record does not exist")
            }
    
            const user = users[0];

            res.json({
                error: false,
                user
            })
        }
        catch(e)
        {
            res.json({
                error: true,
                message: e.message
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
    update: async (req, res) => {
        const { user_id } = req.params;

        const {
            user_firstname,
            user_lastname,
            user_email,
            user_role,
            user_status
        } = req.body;

        const stateCode = !req.body.user_state_code ? null : req.body.user_state_code;
        let connection;

        try
        {
            connection = await db.getConnection();

            //check if user exists 
            const [ users ] = await connection.execute("SELECT * FROM users WHERE user_email = ? AND user_id != ? LIMIT 1", [ user_email, user_id ]);

            if(users.length > 0)
            {
                throw new Error("The provided email address already exists");
            }

            const user = users[0];

            let updateQuery = `
                UPDATE users SET user_firstname = ?, 
                user_lastname = ?, 
                user_email = ?, 
                user_role = ?, 
                user_status = ?,
                user_state_code = ?
                WHERE user_id = ?
            `;

            let updateQueryParams = [ user_firstname, user_lastname, user_email, user_role, user_status, stateCode, user_id ];

            //update user
            await connection.execute(updateQuery, updateQueryParams);

            res.json({
                error: false,
                message:'User updated successfully'
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
    deleteOne: async (req, res) => {
        const { user_id } = req.params;

        let connection;

        try
        {
            connection = await db.getConnection();

            //check if user exists
            const [ users ] = await connection.execute("SELECT * FROM users WHERE user_id = ? LIMIT 1", [ user_id]);

            if(users.length === 0)
            {
                throw new Error(`No records found`);
            }

            //delete user
            await connection.execute("DELETE FROM users WHERE user_id = ?", [ user_id ]);

            res.json({
                error:false,
                message:"User deleted successfully"
            })
        }
        catch(e)
        {
            res.json({
                error: true,
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