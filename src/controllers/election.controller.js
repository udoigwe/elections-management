const db = require('../utils/dbConfig');
const CryptoJS = require('crypto-js');
const { slugify } = require('../utils/functions');

module.exports = {
    create: async (req, res) => {
        const {
            election_title,
            election_category
        } = req.body;

        const now = Math.floor(Date.now() / 1000); 

        let connection;

        try
        {
            connection = await db.getConnection();

            const electionSlug = slugify(election_title);

            //check if election already exists
            const [ elections ] = await connection.execute("SELECT * FROM elections WHERE election_slug = ? LIMIT 1", [ electionSlug]);

            if(elections.length > 0)
            {
                throw new Error("The provided election titl already exist")
            }

            //insert election into database
            await connection.execute(`
                INSERT INTO elections (election_title, election_slug, election_category, election_created_at)
                VALUES (?, ?, ?, ?)
            `, [ election_title, electionSlug, election_category, now ]);

            res.json({
                error: false,
                message:'Election created successfully'
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
            election_status,
            election_category
        } = req.query;

        const page = req.query.page ? parseInt(req.query.page) : null;
        const perPage = req.query.perPage ? parseInt(req.query.perPage) : null;

        let query = "SELECT * FROM elections WHERE 1 = 1";
        const queryParams = [];

        let query2 = "SELECT COUNT(*) AS total_records FROM elections WHERE 1 = 1";
        const queryParams2 = [];

        if(election_status)
        {
            query += " AND election_status = ?";
            queryParams.push(election_status);

            query2 += " AND election_status = ?";
            queryParams2.push(election_status);
        }
        
        if(election_category)
        {
            query += " AND election_category = ?";
            queryParams.push(election_category);

            query2 += " AND election_category = ?";
            queryParams2.push(election_category);
        }

        query += " ORDER BY election_id DESC";

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
            'election_id',
            'election_title',
            'election_category',
            'election_created_at',
            'election_status'
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
            election_status,
            election_category
        } = req.query;

        let query = `SELECT * FROM elections WHERE 1 = 1`;
        const queryParams = [];

        if(election_status)
        {
            query += " AND election_status = ?";
            queryParams.push(election_status);
        }

        if(election_category)
        {
            query += " AND election_category = ?";
            queryParams.push(election_category);
        }

        query += " ORDER BY election_id DESC";

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
                    rtData[i].DT_RowId = rtData[i].election_id;
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
            election_id
        } = req.params;

        let query = "SELECT * FROM elections WHERE election_id = ? LIMIT 1";
        const queryParams = [ election_id ];

        let connection;

        try
        {
            connection = await db.getConnection();

            const [ elections ] = await connection.execute(query, queryParams);

            if(elections.length === 0)
            {
                throw new Error("Election not found")
            }
    
            const election = elections[0];

            res.json({
                error: false,
                election
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
        const { election_id } = req.params;

        const {
            election_title,
            election_category,
            election_status
        } = req.body;

        let connection;

        try
        {
            connection = await db.getConnection();

            const electionSlug = slugify(election_title);

            //check if election exists 
            const [ elections ] = await connection.execute("SELECT * FROM elections WHERE election_slug = ? AND election_id != ? LIMIT 1", [ electionSlug, election_id ]);

            if(elections.length > 0)
            {
                throw new Error("The provided Election Title already exists");
            }

            const election = elections[0];

            let updateQuery = `
                UPDATE elections SET election_title = ?, 
                election_slug = ?,  
                election_category = ?, 
                election_status = ?
                WHERE election_id = ?
            `;

            let updateQueryParams = [ election_title, electionSlug, election_category, election_status, election_id ];

            //update user
            await connection.execute(updateQuery, updateQueryParams);

            res.json({
                error: false,
                message:'Election updated successfully'
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
        const { election_id } = req.params;

        let connection;

        try
        {
            connection = await db.getConnection();

            //check if election exists
            const [ elections ] = await connection.execute("SELECT * FROM elections WHERE election_id = ? LIMIT 1", [ election_id]);

            if(elections.length === 0)
            {
                throw new Error(`No records found`);
            }

            //delete election
            await connection.execute("DELETE FROM elections WHERE election_id = ?", [ election_id ]);

            res.json({
                error:false,
                message:"Election deleted successfully"
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