const db = require('../utils/dbConfig');

module.exports = {
    getAllStates: async (req, res) => {
        const page = req.query.page ? parseInt(req.query.page) : null;
        const perPage = req.query.perPage ? parseInt(req.query.perPage) : null;

        let query = "SELECT * FROM states WHERE 1 = 1";
        const queryParams = [];

        let query2 = "SELECT COUNT(*) AS total_records FROM states WHERE 1 = 1";
        const queryParams2 = [];

        query += " ORDER BY state_name ASC";

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
    getLocalGovernments: async (req, res) => {
        const {
            state_name
        } = req.query;

        const page = req.query.page ? parseInt(req.query.page) : null;
        const perPage = req.query.perPage ? parseInt(req.query.perPage) : null;

        let query = "SELECT * FROM local_government WHERE 1 = 1";
        const queryParams = [];

        let query2 = "SELECT COUNT(*) AS total_records FROM local_government WHERE 1 = 1";
        const queryParams2 = [];

        if(state_name)
        {
            query += " AND state_name = ?";
            queryParams.push(state_name);

            query2 += " AND state_name = ?";
            queryParams2.push(state_name);
        }

        query += " ORDER BY local_id ASC";

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
    getWards: async (req, res) => {
        const {
            state_name,
            local_government_name
        } = req.query;

        const page = req.query.page ? parseInt(req.query.page) : null;
        const perPage = req.query.perPage ? parseInt(req.query.perPage) : null;

        let query = "SELECT * FROM ward WHERE 1 = 1";
        const queryParams = [];

        let query2 = "SELECT COUNT(*) AS total_records FROM ward WHERE 1 = 1";
        const queryParams2 = [];

        if(state_name)
        {
            query += " AND state_name = ?";
            queryParams.push(state_name);

            query2 += " AND state_name = ?";
            queryParams2.push(state_name);
        }

        if(local_government_name)
        {
            query += " AND local_government_name = ?";
            queryParams.push(local_government_name);

            query2 += " AND local_government_name = ?";
            queryParams2.push(local_government_name);
        }

        query += " ORDER BY wards_id ASC";

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
    getPollingUnits: async (req, res) => {
        const {
            state,
            local_government,
            ward
        } = req.query;

        const page = req.query.page ? parseInt(req.query.page) : null;
        const perPage = req.query.perPage ? parseInt(req.query.perPage) : null;

        let query = "SELECT * FROM polling WHERE 1 = 1";
        const queryParams = [];

        let query2 = "SELECT COUNT(*) AS total_records FROM polling WHERE 1 = 1";
        const queryParams2 = [];

        if(state)
        {
            query += " AND state = ?";
            queryParams.push(state);

            query2 += " AND state = ?";
            queryParams2.push(state);
        }
        
        if(local_government)
        {
            query += " AND local_government = ?";
            queryParams.push(local_government);

            query2 += " AND local_government = ?";
            queryParams2.push(local_government);
        }

        if(ward)
        {
            query += " AND ward = ?";
            queryParams.push(ward);

            query2 += " AND ward = ?";
            queryParams2.push(ward);
        }

        query += " ORDER BY polling_station ASC";

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
    }
}