const db = require('../utils/dbConfig');
const { sumArray } = require('../utils/functions');

module.exports = {
    dashboard: async (req, res) => {

        let connection;
        let electionTitle = '';
        const candidateArray = [];
        const pollsArray = [];
        const observedPollsArray = [];

        try
        {
            connection = await db.getConnection();
            const [ candidates ] = await connection.execute(`SELECT COUNT(*) AS candidate_count FROM candidates WHERE candidate_status = 'Active'`);
            const [ elections ] = await connection.execute(`SELECT COUNT(*) AS election_count FROM elections WHERE election_status = 'Active'`);
            const [ LGAs ] = await connection.execute(`SELECT COUNT(*) AS lga_count FROM local_government`);
            const [ pollingUnits ] = await connection.execute(`SELECT COUNT(*) AS polling_unit_count FROM polling`);
            const [ states ] = await connection.execute(`SELECT COUNT(*) AS state_count FROM states`);
            const [ wards ] = await connection.execute(`SELECT COUNT(*) AS ward_count FROM ward`);
            const [ users ] = await connection.execute(`SELECT COUNT(*) AS user_count FROM users`);
            const [ Election ] = await connection.execute(`SELECT * FROM elections WHERE election_status = 'Active' ORDER BY election_id DESC LIMIT 1`);

            //get polls data
            const [ polls ] = await connection.execute(`
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
                WHERE a.election_id = ? GROUP BY a.candidate_id, a.election_id ORDER BY total_polls DESC
            `, [ Election[0]?.election_id ]);

            for(let i = 0; i < polls.length; i++) 
            {
                const poll = polls[i];

                electionTitle = poll.election_title;
                candidateArray.push(poll.candidate_fullname);
                pollsArray.push(parseInt(poll.total_polls));
                observedPollsArray.push(parseInt(poll.total_observed_polls));
            }

            const chartData = {
                candidates: candidateArray,
                polls: pollsArray,
                observedPolls: observedPollsArray,
                totalPolls: sumArray(pollsArray),
                electionTitle
            }

            const dashboard = {
                candidate_count: candidates[0].candidate_count,
                election_count: elections[0].election_count,
                lga_count: LGAs[0].lga_count,
                polling_unit_count: pollingUnits[0].polling_unit_count,
                state_count: states[0].state_count,
                ward_count: wards[0].ward_count,
                user_count: users[0].user_count,
                chartData
            }

            res.json({
                error:false,
                dashboard
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
            connection ? connection.release() : null;
        }
    },
    getPollsChartData: async (req, res) => {
        const { 
            election_id
        } = req.params;

        let connection;
        let electionTitle = '';
        const candidateArray = [];
        const pollsArray = [];
        const observedPollsArray = [];

        try
        {
            //instantiate db connection
            connection = await db.getConnection();

            //check if election exists
            const [ elections ] = await connection.execute(`SELECT * FROM elections WHERE election_id = ? LIMIT 1`, [ election_id]);

            if(elections.length === 0)
            {
                throw new Error(`No records found`);
            }

            //get polls data
            const [ polls ] = await connection.execute(`
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
                WHERE a.election_id = ? GROUP BY a.candidate_id, a.election_id ORDER BY total_polls DESC
            `, [ election_id ]);

            for(let i = 0; i < polls.length; i++) 
            {
                const poll = polls[i];

                electionTitle = poll.election_title;
                candidateArray.push(poll.candidate_fullname);
                pollsArray.push(parseInt(poll.total_polls));
                observedPollsArray.push(parseInt(poll.total_observed_polls));
            }

            const chartData = {
                candidates: candidateArray,
                polls: pollsArray,
                observedPolls: observedPollsArray,
                totalPolls: sumArray(pollsArray),
                electionTitle
            }

            res.json({
                error: false,
                chartData
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
            connection ? connection.release() : null;
        }
    }
}