const { body, param} = require("express-validator");

module.exports = {
    create: [
		body("election_title")
			.exists({ checkFalsy: true })
			.withMessage("Election title is required"),
		body("election_category")
			.exists({ checkFalsy: true })
			.withMessage("Election category is required")   
	],
    readOne: [
        param("election_id")
            .exists({ checkFalsy: true })
            .withMessage("Election ID is required")
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