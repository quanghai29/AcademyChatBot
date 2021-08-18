module.exports = function (app) {
    app.use((req, res, next) => {
        res.status(404).json({
            error_message: 'Endpoint not found'
        })
    })

    app.use(function (err, req, res, next) {
        console.log(err.stack);
        res.status(500).json({
            error_message: 'Something broke!'
        })
    })
};
