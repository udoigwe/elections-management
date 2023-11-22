const db = require('../utils/dbConfig');

module.exports = {
    submitPolls: async (req, res) => {
        const {
            data
        } = req.body;

        const userData = req.userDecodedData;

        const now = Math.floor(Date.now() / 1000); 

        let connection;

        try
        {
            connection = await db.getConnection();

            //start db transaction
            await connection.beginTransaction()

            const candidateData = data;

            //itirate through all candidate data and submit each poll
            for (let i = 0; i < candidateData.length; i++)
            {
                const candidate = candidateData[i];

                //check if election is active
                const [ elections ] = await connection.execute(`SELECT election_status FROM elections WHERE election_id = ? LIMIT 1`, [ candidate.election_id]);

                //check if candidate score exists
                const [ scores ] = await connection.execute(`SELECT poll_id FROM polls WHERE polling_station_id = ? AND election_id = ? AND candidate_id = ? LIMIT 1`, [ candidate.polling_unit_id, candidate.election_id, candidate.candidate_id ]);

                if(elections.length === 0)
                {
                    throw new Error(`Election not found`);
                }

                if(elections[0].election_status === "Inactive")
                {
                    throw new Error(`Election not active`)
                }

                if(scores.length > 0)
                {
                    const score = scores[0];

                    //update the score with the current candidate score
                    if(userData.user_role === "Admin")
                    {
                        await connection.execute(`UPDATE polls SET primary_poll = ? WHERE poll_id = ?`, [ candidate.poll, score.poll_id ]);
                    }
                    
                    if(userData.user_role === "Observer")
                    {
                        await connection.execute(`UPDATE polls SET secondary_poll = ? WHERE poll_id = ?`, [ candidate.poll, score.poll_id ]);
                    }
                }
                 
                if(scores.length === 0)
                {
                    //no scores were found. Insert a new score into the table
                    if(userData.user_role === "Admin")
                    {
                        await connection.execute(`
                            INSERT INTO polls 
                            (
                                polling_station_id,
                                election_id,
                                candidate_id,
                                primary_poll,
                                poll_created_at
                            ) VALUES (?, ?, ?, ?, ?)
                        `, [ candidate.polling_unit_id, candidate.election_id, candidate.candidate_id, candidate.poll, now ])
                    }

                    if(userData.user_role === "Observer")
                    {
                        await connection.execute(`
                            INSERT INTO polls 
                            (
                                polling_station_id,
                                election_id,
                                candidate_id,
                                secondary_poll,
                                poll_created_at
                            ) VALUES (?, ?, ?, ?, ?)
                        `, [ candidate.polling_unit_id, candidate.election_id, candidate.candidate_id, candidate.poll, now ])
                    }
                }
            }

            //commit queries
            await connection.commit();

            res.json({
                error: false,
                message:'Polls submitted successfully'
            })
        }
        catch(e)
        {   
            connection ? await connection.rollback() : null;

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
    getScoreSheetForDataTable: async (req, res) => {
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
        var columnsJoined = columns.join(', ');

        const {
            election_id,
            polling_station_id
        } = req.params;

        let query = `
            SELECT a.*, b.election_title, b.election_category 
            FROM candidates a 
            LEFT JOIN elections b
            ON a.election_id = b.election_id 
            WHERE a.election_id = ? 
        `;
        const queryParams = [election_id];

        query += " ORDER BY a.candidate_id DESC";

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
                    rtData[i].DT_RowId = rtData[i].candidate_id;

                    const candidate = rtData[i];

                    //check if the candidate has a score in the selected polling unit
                    const [ polls ] = await connection.execute(`SELECT primary_poll, secondary_poll FROM polls WHERE polling_station_id = ? AND election_id = ? AND candidate_id = ? LIMIT 1`, [ polling_station_id, election_id, candidate.candidate_id ]);
                    
                    const poll = polls[0]?.primary_poll || 0;
                    const observerPoll = polls[0]?.secondary_poll || 0;
                    candidate.primary_poll = poll;
                    candidate.observer_poll = observerPoll;

                    data.push(candidate);
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
    getPollsForDataTable: async (req, res) => {
        //dataTable Server-Side parameters
        var columns = [
            'poll_id',
            'state',
            'local_government',
            'ward',
            'polling_station',
            'election_title',
            'election_category',
            'candidate_fullname',
            'candidate_party',
            'total_polls',
            'total_observed_polls'
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
            state,
            local_government,
            ward,
            polling_station_id,
            candidate_id
        } = req.query;

        let query = `
            SELECT 
                a.*, 
                b.*, 
                c.election_title, c.election_category, 
                d.candidate_fullname, d.candidate_party, 
                SUM(a.primary_poll) AS total_polls,
                SUM(a.secondary_poll) AS total_observed_polls
            FROM polls a 
            LEFT JOIN polling b ON a.polling_station_id = b.polling_id 
            LEFT JOIN elections c ON a.election_id = c.election_id 
            LEFT JOIN candidates d ON a.candidate_id = d.candidate_id 
            WHERE 1 = 1
        `;
        const queryParams = [];

        if(election_id)
        {
            query += " AND a.election_id = ?";
            queryParams.push(election_id);
        }

        if(state)
        {
            query += " AND b.state = ?";
            queryParams.push(state);
        }
        
        if(local_government)
        {
            query += " AND b.local_government = ?";
            queryParams.push(local_government);
        }
        
        if(ward)
        {
            query += " AND b.ward = ?";
            queryParams.push(ward);
        }
        
        if(polling_station_id)
        {
            query += " AND a.polling_station_id = ?";
            queryParams.push(polling_station_id);
        }
        
        if(candidate_id)
        {
            query += " AND a.candidate_id = ?";
            queryParams.push(candidate_id);
        }

        query += ` GROUP BY candidate_id, election_id`;

        query += " ORDER BY total_polls DESC";

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
                    rtData[i].DT_RowId = rtData[i].poll_id;
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
    }
}