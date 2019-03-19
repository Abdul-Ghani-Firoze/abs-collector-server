/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


var mysql = require('mysql');

var con = mysql.createConnection({
    host: "localhost",
    user: "abs",
    password: "absadmin",
    database: "abs"
});

exports.track = function (data, req, res) {
    console.log('in service track');

    res.send('1');

}

exports.logEvent = function (event, eventData) {
    console.log("HERE: " + event);
    switch (event) {
        case 'Entered product page':
            console.log("enterd");
            store_stickiness_data(eventData);
            break;
        default:
            console.log("In default");
            break;
    }
}

function store_stickiness_data(eventData) {
    console.log("in store stickiness, event entered at: " + eventData['enteredAt']);
    con.connect(function (err) {
        if (err)
            throw err;
        console.log("Connected!");
        var sql = "INSERT INTO stickiness_data (userId, productId, enteredAt, leftAt) "
                + "VALUES (1, " + eventData['productId'] + ", '" + eventData['enteredAt'].replace(/["']/g, "") + "', " + "'0000-00-00 00:00:00'" + ")";
        console.log("query: " + sql);
        con.query(sql, function (err, result) {
            if (err)
                throw err;
            console.log("1 record inserted");
        });
    });
}