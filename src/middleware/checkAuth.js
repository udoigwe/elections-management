const jwt = require('jsonwebtoken');

module.exports = {
    verifyToken: (req, res, next) => {
        try 
        {
            const decoded = jwt.verify(req.headers['x-access-token'], process.env.JWT_SECRET);
            req.userDecodedData = decoded;
            next();
        }
        catch (error)
        {
            res.json({
                error:true,
                message:'Authentication failed'
            });
        }
    },
    isAdminCheck: (req, res, next) => {
        try 
        {
            const decoded = jwt.verify(req.headers['x-access-token'], process.env.JWT_SECRET);

            if(decoded.user_role === "Admin")
            {
                req.userDecodedData = decoded;
                next();
            }
            else
            {
                res.json({
                    error:true,
                    message:'Sorry!!! You are not authorized to access this resource'
                });
            }
        }
        catch (error)
        {
            res.status(401).json({
                error:true,
                message:'Authentication failed'
            });
        }
    }
}