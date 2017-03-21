'use strict';

/**
    Error server controller
*/


module.exports = {
    getErrorMessage
};


var regUniq = /"([a-zA-Z]*)"/;

/**
    Format mongoose unique validation error
*/
function getUniqueErrorMessage(err) {
    let match = err.errmsg.match(regUniq);
    let fieldName = match && (match[1] || 'Field');
    return fieldName.charAt(0).toUpperCase() + fieldName.slice(1) + ' already exists';
}

/**
    Get the error message from error object
*/
function getErrorMessage(err) {
    var message = '';

    if (err.code) {
        switch (err.code) {
            case 11000:
            case 11001:
                message = getUniqueErrorMessage(err);
                break;
            default:
                message = 'Something went wrong';
        }
    } else {
        for (var errName in err.errors) {
            if (err.errors[errName].message) {
                message = err.errors[errName].message;
            }
        }
    }

    return message;
}