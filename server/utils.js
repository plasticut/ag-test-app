'use strict';

const
    glob = require('glob'),
    Path = require('path');


module.exports = {
    getGlobbedFiles
};


/**
 * returns full files paths that matches globPatterns
*/
function getGlobbedFiles(...globPatterns) {

    return globPatterns
        .reduce(function(allFiles, globPattern) {
            Array.prototype.push.apply( allFiles, glob(globPattern, { sync: true }) );
            return allFiles;
        }, [])
        .map( path => Path.resolve(path) );
}
