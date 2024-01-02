var express = require('express');
var router = express.Router();

router.post('/', async (req, res) => {
    // save recording to file
    const fs = require('fs');
    const path = require('path');
    const filename = path.join(__dirname, '../assets/recordings/temp.json');

    fs.writeFileSync(filename, JSON.stringify(req.body, null, 2));

    console.log("recording", req.body);
    res.send("ok");
   
});

module.exports = router;
