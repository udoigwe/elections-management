const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

exports.validateEmail = (email) => {
    
    var filter = /^[\w-.+]+@[a-zA-Z0-9.-]+.[a-zA-Z0-9]{2,4}$/;

    if(filter.test(email))
    {
        return true;
    }
    else 
    {
        return false;
    }
}

exports.validateDigits = (entry) => {
    var filter = /^[0-9]+$/;

    if(filter.test(entry))
    {
        return true;
    }
    else
    {
        return false;
    }
}

exports.validateLeadingZeros = (entry) => {
    var filter = /^(0|[1-9][0-9]*)$/;

    if(filter.test(entry))
    {
        return true
    }
    else
    {
        return false
    }
}

exports.verifyToken = (token, cb) => {
    jwt.verify(token, process.env.jWT_SECRET, (err, decoded) => {
        if(err)
        {
            cb(err, null);
        }
        else
        {
            cb(null, decoded);
        }
    });
}

exports.uuidv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
}

exports.slugify = (text) => {
    return text.toLowerCase().replace(/ /g,'-').replace(/[^\w-]+/g,'');
}

exports.stripHtmlTags = (str) => {
    str = str.toString();
          
    // Regular expression to identify HTML tags in 
    // the input string. Replacing the identified 
    // HTML tag with a null string.
    return str.replace( /(<([^>]+)>)/ig, '');
}

exports.escapeHtml = (str) => {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

exports.capitalizeWords = (sentence) => {
    return sentence
        .split(" ") // Split the sentence into words
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
        .join(" "); // Join the words back together with spaces
}

exports.validate = (validations) => {
    
    return async (req, res, next) => {
        try
        {
            await Promise.all(validations.map(validation => validation.run(req)));
            const errors = validationResult(req);
    
            if(!errors.isEmpty())
            {
                //iterate through the errors and show the first to the user
                throw new Error(`${errors.array()[0].msg}`)
            }
    
            return next();
        }
        catch(e)
        {
            res.json({
                error:true,
                message:e.message
            });
        }
    };
};

exports.sumArray = (numbers) => {
    const sum = numbers.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    return sum;
}