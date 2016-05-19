module.exports = function(db){

    var module = {};

    module.create = function(username, password, sc_account, done){
        //Check if account already exists
        db.cypher({ 
            query: 'MATCH (a:Account {username:{name} }) ' + 
                   'RETURN a',
            params: {
                name: username
            }
        }, function(error, results){
            if (error){
                done(null, error);
            }
            else {
                if (results.length == 0){
                    //Account does not already exist, create a new one
                    db.cypher({ 
                        query: 'CREATE (a:Account {username:{name}, password:{pw}, type:"user", approved:"false" })-[:REQUESTS]->' + 
                               '(r:Request {username:{sc_name}, complete:"false"}) ' + 
                               'RETURN a, r',
                        params: {
                            name: username,
                            pw: password,
                            sc_name: sc_account
                        }
                    }, function(error, results){
                        if (error){
                            done(null, error);
                        }
                        else {
                            console.log(results);
                            //Account was successfuly created
                            done(true);
                        }
                    });

                }
                else {
                    //Account already exists, signal false
                    done(false);
                }
                
            }
        });
    }

    module.login = function(username, password, done){
        db.cypher({ 
            query: 'MATCH (a:Account {username:{name}, password:{pw} }) ' + 
                   'RETURN a',
            params: {
                name: username,
                pw: password
            }
        }, function(error, results){
            if (error){
                done(null, error);
            }
            else {
                console.log(results);
                //Account was successfuly created
                done(results);
            }
        });
    }

    module.getAccountsWithRequests = function(done){
        db.cypher({ 
            query: 'MATCH (a:Account)-[:REQUESTS]->(r:Request) ' + 
                   'RETURN a, r'
        }, function(error, results){
            if (error){
                done(null, error);
            }
            else {
                //Accounts retrieved
                done(results);
            }
        });
    }

    return module;

}
