const { body, param} = require("express-validator");

module.exports = {
    getDashboardChartData: [
		param("election_id")
            .exists({ checkFalsy: true })
            .withMessage("Election ID is required")
            .isNumeric()
            .withMessage("Election ID must be a number")   
	]
}