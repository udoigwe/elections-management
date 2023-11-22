const { body, param} = require("express-validator");

module.exports = {
    submitScores: [
		body("data")
			.exists({ checkFalsy: true })
			.withMessage("Score Sheet is required")
            /* .isJSON()
            .withMessage("Score Sheet must be a JSON object or Array") */
	],
    getScoreSheet: [
        param("election_id")
            .exists({ checkFalsy: true })
            .withMessage("Election ID is required")
            .isNumeric()
            .withMessage("Election ID must be a number"),
        param("polling_station_id")
            .exists({ checkFalsy: true })
            .withMessage("Polling Station ID is required")
            .isNumeric()
            .withMessage("Polling Station ID must be a number"),
    ],
    update: [
		body("election_title")
			.exists({ checkFalsy: true })
			.withMessage("Election title is required"),
		body("election_category")
			.exists({ checkFalsy: true })
			.withMessage("Election Category is required")
            .isIn(["Federal", "State", "Local"])
            .withMessage("Election category must be one of Federal, State Or Local elections"),
        body("election_status")
            .exists({ checkFalsy: true })
            .withMessage("Election Status is required")
            .isIn(["Active", "Inactive"])
            .withMessage("Election status must be one of Active, Inactive"),
        param("election_id")
            .exists({ checkFalsy: true })
            .withMessage("Election ID is required")
            .isNumeric()
            .withMessage("Election ID must be a number")       
	],
    deleteOne: [
        param("election_id")
            .exists({ checkFalsy: true })
            .withMessage("Election ID is required")
    ]
}