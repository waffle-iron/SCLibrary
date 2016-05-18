module.exports = function(db){

    var module = {};

    module.create = function(username, password, done){
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
                        query: 'CREATE (a:Account {username:{name}, password:{pw} }) ' + 
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
                //Account was successfuly created
                done(results);
            }
        });
    }

    return module;

}
