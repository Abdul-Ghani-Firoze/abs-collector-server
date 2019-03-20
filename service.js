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

module.exports = {
    logEvent: function (event, eventData) {
        console.log('in service track logEvent');
        log_event(event, eventData);
    }
};

function log_event(event, eventData) {
    console.log("HERE: " + event);
    switch (event) {
        case 'Entered product page':
            console.log("entered product page");
            store_stickiness_data(eventData);
            break;
        case 'Leaving product page':
            console.log("leaving product page");
            update_leaving_time(eventData);
            break;
        case 'Entered category page':
            console.log("entered category page");
            store_category_visit(eventData);
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

function update_leaving_time(eventData) {
    console.log("updating leaving time");
}

function store_category_visit(eventData) {
    console.log("storing category visits");
    con.connect(function (err) {
        if (err)
            throw err;
        console.log("Connected!");
        var sql = "INSERT INTO category_visits (member, sessionId, categoryUrl) "
                + "VALUES (" + eventData['member'] + ", '" + eventData['sessionId'] + "', '" + eventData['categoryUrl'] + "')";
        console.log("query: " + sql);
        con.query(sql, function (err, result) {
            if (err)
                throw err;
            console.log("1 record inserted");
        });
    });
}