const aes256 = require("aes256");
const connection = require("../app")
const aes = require("./aes");

exports.addCred = async function(req,res) {

    var details = {
        username: req.session.username,
        url : req.body.url,
        uname : req.body.uname, 
        password : await aes.encrypting(req.session.password, req.body.password)
    };
    var sql = "insert into credentials set ?";
    connection.query(sql,[details], async (err, results)=> {
        try {
            console.log("new password-credentials added successfully!");
            res.redirect("/dashboard");
        }
        catch(err) {
            console.log("/addCred route: ",err);
            return res.redirect("back");
        }
    });
}


exports.showCred = async function(req, res){
    var sql = "select * from credentials where username = ?";

    connection.query(sql,[req.session.username],async (err, results)=>{
        try{
            for(var i=0; i<results.length; i++) {
                var ciphertext = results[i].password;
                results[i].password = aes256.decrypt(req.session.password, ciphertext);

                // if(i==results.length-1) {
                //     res.render("dashboard",{msg:"", data: results});
                // }
            }

            res.render("dashboard",{msg:"", data: results});
            // if(results.length==0) {
            //     res.render("dashboard",{msg:"", data: []});
            // }
        }
        catch(err) {
            res = new Array();
            console.log("err at GET req to /dashboard :",err);
            res.render("dashboard",{msg:"Error while getting credentials!", data: res});
        }
    });
}
