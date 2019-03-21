/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var Promise = require('promise');
var MySQL = require('mysql');
var DateFormat = require('dateformat');

var con = MySQL.createPool({
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
            get_user(eventData).then(function (result) {
                console.log("inside then function: result = " + result);
                store_product_visit(result, eventData);
            });
            break;
        case 'Leaving product page':
            console.log("leaving product page");
            get_user(eventData).then(function (result) {
                console.log("inside then function: result = " + result);
                update_leaving_time(result, eventData);
            });
            break;
        case 'Entered category page':
            console.log("entered category page");
            get_user(eventData).then(function (result) {
                console.log("inside then function: result = " + result);
                store_category_visit(result, eventData);
            });
            break;
        default:
            console.log("In default");
            break;
    }
}

function store_product_visit(userId, eventData) {
    console.log("in store product visit, event entered at: " + eventData['enteredAt']);
    var sql = "INSERT INTO product_visits (userId, productId, productUrl, enteredAt, leftAt) VALUES (?, ?, ?, ?, ?)";
    console.log("query: " + sql);
    con.query(sql, [userId, eventData['productId'], eventData['productUrl'], eventData['enteredAt'].replace(/["']/g, ""),
        '0000-00-00 00:00:00'], function (err, result) {
        if (err)
            throw err;
        console.log("1 record inserted");
    });
}

function update_leaving_time(userId, eventData) {
    console.log("updating leaving time");
    var sql = "UPDATE product_visits SET leftAt = ? WHERE userId = ? AND productId = ? "
            + "AND date(enteredAt) = ? AND leftAt = '0000-00-00 00:00:00'";
    console.log("query: " + sql);
    con.query(sql, [eventData['leftAt'].replace(/["']/g, ""), userId, eventData['productId'],
        DateFormat(new Date(), "yyyy-mm-dd")], function (err, result) {
        if (err)
            throw err;
        console.log(result.affectedRows + " record(s) updated");
    });
}

function store_category_visit(userId, eventData) {
    console.log("storing category visits");
    var sql = "INSERT INTO category_visits (userId, categoryUrl) VALUES (?, ?)";
    console.log("query: " + sql);
    con.query(sql, [userId, eventData['categoryUrl']], function (err, result) {
        if (err)
            throw err;
        console.log("1 record inserted");
    });
}

function get_user(eventData) {
    console.log("getting user");
    return new Promise((resolve, reject) => {
        var sql = "SELECT * FROM users WHERE sessionId = ?";
        console.log("query: " + sql);
        con.query(sql, [eventData['sessionId']], function (err, result) {
            var user = "";
            if (err)
                return reject(err);

            if (result.length > 0) {
                console.log("user found: " + JSON.stringify(result[0]));
                user = JSON.parse(JSON.stringify(result[0]));
                console.log("userID: " + user['userId']);
            } else {
                console.log("user not found, creating one");
                var createUserSql = "INSERT INTO users (sessionId, member) VALUES (?, ?)";
                con.query(createUserSql, [eventData['sessionId'], eventData['member']], function (err, result) {
                    if (err)
                        return reject(err);
                    console.log("user created");
                    user = JSON.parse(JSON.stringify(result[0]));
                    console.log("userID: " + user['userId']);
                });
            }

            resolve(user['userId']);
        });
    });
}