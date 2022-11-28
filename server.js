const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const errorhandler = require('errorhandler');
const logging = require('morgan');
const apiRouter = require("./api/api");

const app = express();
const PORT = process.env.PORT || 4000


app.use(bodyParser.json());
app.use(errorhandler());
app.use(cors());
app.use(logging('dev'));
app.use('/api', apiRouter);



app.listen(PORT, () => {
    console.log(`Server is listening on ${PORT}`);
});


module.exports = app; 