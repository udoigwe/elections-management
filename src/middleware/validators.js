const { validate } = require('../utils/functions');
const authValidations = require('../validations/auth.validation');
const electionValidations = require('../validations/election.validation');
const candidateValidations = require('../validations/candidate.validation');
const pollValidations = require('../validations/poll.validation');
const userValidations = require('../validations/user.validation');
const dashboardValidations = require('../validations/dashboard.validation');

module.exports = {
    /* Auth route validators */
    signUp: validate(authValidations.signUp),
    login: validate(authValidations.login),

    /* Election route validators */
    createElection: validate(electionValidations.create),
    updateElection: validate(electionValidations.update),
    readSingleElection: validate(electionValidations.readOne),
    deleteElection: validate(electionValidations.deleteOne),
    
    /* Candidate route validators */
    createCandidate: validate(candidateValidations.create),
    readSingleCandidate: validate(candidateValidations.readOne),
    updateCandidate: validate(candidateValidations.update),
    deleteOneCandidate: validate(candidateValidations.deleteOne),

    /* Vote route validators */
    getScoreSheet: validate(pollValidations.getScoreSheet),
    submitScoreSheet: validate(pollValidations.submitScores),

    /* User route validators */
    createUser: validate(userValidations.create),
    readSingleUser: validate(userValidations.readOne),
    updateUser: validate(userValidations.update),
    deleteOneUser: validate(userValidations.deleteOne),

    /* Dashboard validations */
    getDashboardChartData: validate(dashboardValidations.getDashboardChartData),
}