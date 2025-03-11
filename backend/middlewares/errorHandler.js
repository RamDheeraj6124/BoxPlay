// errorHandler.js
const errorHandler = (err, req, res, next) => {
    console.log("error handling middleware");
    console.log("path:" + req.path);
    console.log('error', err);

    res.status(500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
};

module.exports = errorHandler;
