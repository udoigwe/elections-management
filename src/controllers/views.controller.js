module.exports = {

    /* Authentication Routes */
    signin: async (req, res) => {
        res.render('signin', { title:'Sign In', layout: './layouts/default'})
    },
    register: async (req, res) => {
        res.render('register', { title:'Register', layout: './layouts/default'})
    },
    home: async (req, res) => {
        res.render('index', { title:'Home', layout: './layouts/default'})
    },

    /* Admin Controllers */
    adminDashboard: async (req, res) => {
        res.render('admin/index', { title:'Dashboard', layout: './layouts/admin'})
    },
    users: async (req, res) => {
        res.render('admin/users', { title:'Users', layout: './layouts/admin' })
    },
    elections: async (req, res) => {
        res.render('admin/elections', { title:'Elections', layout: './layouts/admin' })
    },
    
    candidates: async (req, res) => {
        res.render('admin/candidates', { title:'Candidates', layout: './layouts/admin' })
    },

    scoreSheet: async (req, res) => {
        res.render('admin/score-sheet', { title:'Score Sheet', layout: './layouts/admin' })
    },

    polls: async (req, res) => {
        res.render('admin/polls', { title:'Polls', layout: './layouts/admin' })
    },

    /* Observer routes */
    observerDashboard: async (req, res) => {
        res.render('observer/index', { title:'Dashboard', layout: './layouts/observer'})
    },

    observerScoreSheet: async (req, res) => {
        res.render('observer/score-sheet', { title:'Score Sheet', layout: './layouts/observer' })
    },

    observerPolls: async (req, res) => {
        res.render('observer/polls', { title:'Polls', layout: './layouts/observer' })
    },

    /* Visitor route controllers */
    visitorDashboard: async (req, res) => {
        res.render('visitor/index', { title:'Dashboard', layout: './layouts/visitor'})
    },

    visitorPolls: async (req, res) => {
        res.render('visitor/polls', { title:'Polls', layout: './layouts/visitor' })
    }
}