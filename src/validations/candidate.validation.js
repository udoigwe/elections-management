const { body, param} = require("express-validator");

module.exports = {
    create: [
		body("election_id")
			.exists({ checkFalsy: true })
			.withMessage("Election ID is required")
            .isNumeric()
            .withMessage("Election ID must be a number"),
		body("candidate_fullname")
			.exists({ checkFalsy: true })
			.withMessage("Candidate full name is required"), 
		body("candidate_party")
			.exists({ checkFalsy: true })
			.withMessage("Candidate party is required")   
	],
    readOne: [
        param("candidate_id")
            .exists({ checkFalsy: true })
            .withMessage("Candidate ID is required")
            .isNumeric()
            .withMessage("Candidate ID must be a number"),
    ],
    update: [
		body("election_id")
			.exists({ checkFalsy: true })
			.withMessage("Election ID is required")
            .isNumeric()
            .withMessage("Election ID must be a number"),
		body("candidate_fullname")
			.exists({ checkFalsy: true })
			.withMessage("Candidate full name is required"), 
		body("candidate_party")
			.exists({ checkFalsy: true })
			.withMessage("Candidate party is required"),
        body("candidate_status")
            .exists({ checkFalsy: true })
            .withMessage("Candidate Status is required")
            .isIn(["Active", "Inactive"])
            .withMessage("Candidate status must be one of Active, Inactive"),
        param("candidate_id")
            .exists({ checkFalsy: true })
            .withMessage("Candidate ID is required")
            .isNumeric()
            .withMessage("Candidate ID must be a number")       
	],
    deleteOne: [
        param("candidate_id")
            .exists({ checkFalsy: true })
            .withMessage("Candidate ID is required")
            .isNumeric()
            .withMessage("Candidate ID must be a number")  
    ]
}