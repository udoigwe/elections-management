const db = require('../utils/dbConfig');

module.exports = {
    create: async (req, res) => {
        const {
            election_id,
            candidate_fullname,
            candidate_party
        } = req.body;

        const now = Math.floor(Date.now() / 1000); 

        let connection;

        try
        {
            connection = await db.getConnection();

            //check if party already exists for this election
            const [ candidates ] = await connection.execute("SELECT * FROM candidates WHERE candidate_party = ? AND election_id = ? LIMIT 1", [ candidate_party, election_id ]);

            if(candidates.length > 0)
            {
                throw new Error("The provided political party already exists for the selected election")
            }

            //insert candidate into database
            await connection.execute(`
                INSERT INTO candidates (election_id, candidate_fullname, candidate_party, candidate_created_at)
                VALUES (?, ?, ?, ?)
            `, [ election_id, candidate_fullname, candidate_party, now ]);

            res.json({
                error: false,
                message:'Candidate created successfully'
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
            election_id,
            candidate_party,
            candidate_status
        } = req.query;

        const page = req.query.page ? parseInt(req.query.page) : null;
        const perPage = req.query.perPage ? parseInt(req.query.perPage) : null;

        let query = `
            SELECT a.*, b.election_title, b.election_category 
            FROM candidates a 
            LEFT JOIN elections b 
            ON a.election_id = b.election_id 
            WHERE 1 = 1`
        ;
        const queryParams = [];

        let query2 = `
            SELECT COUNT(*) AS total_records 
            FROM candidates a 
            LEFT JOIN elections b 
            ON a.election_id = b.election_id 
            WHERE 1 = 1
        `;
        const queryParams2 = [];

        if(election_id)
        {
            query += " AND a.election_id = ?";
            queryParams.push(election_id);

            query2 += " AND a.election_id = ?";
            queryParams2.push(election_id);
        }
        
        if(candidate_party)
        {
            query += " AND a.candidate_party = ?";
            queryParams.push(candidate_party);

            query2 += " AND a.candidate_party = ?";
            queryParams2.push(candidate_party);
        }
        
        if(candidate_status)
        {
            query += " AND a.candidate_status = ?";
            queryParams.push(candidate_status);

            query2 += " AND a.candidate_status = ?";
            queryParams2.push(candidate_status);
        }

        query += " ORDER BY a.candidate_id DESC";

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
            'candidate_id',
            'election_id',
            'election_title',
            'election_category',
            'candidate_fullname',
            'candidate_party',
            'candidate_created_at',
            'candidate_status'
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
            election_id,
            candidate_party,
            candidate_status
        } = req.query;

        let query = `
            SELECT a.*, b.election_title, b.election_category 
            FROM candidates a 
            LEFT JOIN elections b 
            ON a.election_id = b.election_id 
            WHERE 1 = 1`
        ;
        const queryParams = [];

        if(election_id)
        {
            query += " AND a.election_id = ?";
            queryParams.push(election_id);
        }

        if(candidate_party)
        {
            query += " AND a.candidate_party = ?";
            queryParams.push(candidate_party);
        }
        
        if(candidate_status)
        {
            query += " AND a.candidate_status = ?";
            queryParams.push(candidate_status);
        }

        query += " ORDER BY a.candidate_id DESC";

        let connection;
        
        try
        {    
            connection = await db.getConnection();

            const [ rows ] = await connection.execute(query, queryParams);

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
                    rtData[i].DT_RowId = rtData[i].candidate_id;
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
            candidate_id
        } = req.params;

        let query = `
            SELECT a.*, b.election_title, b.election_category 
            FROM candidates a 
            LEFT JOIN elections b 
            ON a.election_id = b.election_id 
            WHERE a.candidate_id = ?
            LIMIT 1
        `;

        const queryParams = [ candidate_id ];

        let connection;

        try
        {
            connection = await db.getConnection();

            const [ candidates ] = await connection.execute(query, queryParams);

            if(candidates.length === 0)
            {
                throw new Error("Candidate not found")
            }
    
            const candidate = candidates[0];

            res.json({
                error: false,
                candidate
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
        const { candidate_id } = req.params;

        const {
            election_id,
            candidate_fullname,
            candidate_party,
            candidate_status
        } = req.body;

        let connection;

        try
        {
            connection = await db.getConnection();

            //check if party exists 
            const [ candidates ] = await connection.execute("SELECT * FROM candidates WHERE election_id = ? AND candidate_party = ? AND candidate_id != ? LIMIT 1", [ election_id, candidate_party, candidate_id ]);

            if(candidates.length > 0)
            {
                throw new Error("The provided Political party already exists in the selected election");
            }

            const candidate = candidates[0];

            let updateQuery = `
                UPDATE candidates SET election_id = ?, 
                candidate_fullname = ?,  
                candidate_party = ?, 
                candidate_status = ?
                WHERE candidate_id = ?
            `;

            let updateQueryParams = [ election_id, candidate_fullname, candidate_party, candidate_status, candidate_id ];

            //update user
            await connection.execute(updateQuery, updateQueryParams);

            res.json({
                error: false,
                message:'Candidate updated successfully'
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
        const { candidate_id } = req.params;

        let connection;

        try
        {
            connection = await db.getConnection();

            //check if candidate exists
            const [ candidates ] = await connection.execute("SELECT * FROM candidates WHERE candidate_id = ? LIMIT 1", [ candidate_id]);

            if(candidates.length === 0)
            {
                throw new Error(`No records found`);
            }

            //delete candidate
            await connection.execute("DELETE FROM candidates WHERE candidate_id = ?", [ candidate_id ]);

            res.json({
                error:false,
                message:"Candidate deleted successfully"
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