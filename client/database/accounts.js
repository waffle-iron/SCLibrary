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
            query: 'MATCH (a:Account {username:{name}, password:{pw} })' + 
                   'RETURN a',
            params: {
                name: username,
                pw: password
            }
        }, function(error, account){
            if (error){
                done(null, error);
            }
            else {
                console.log(account);

                db.cypher({ 
                    query: 'MATCH (a:Account {username:{name}, password:{pw} })-[:CONNECTED_TO]->(u:Channel) ' + 
                           'RETURN u',
                    params: {
                        name: username,
                        pw: password
                    }
                }, function(error, users){
                    if (error){
                        done(null, error);
                    }
                    else {
                        console.log(users);
                        var results = {
                            account: account[0],
                            users: users
                        }
                        //Account was successfuly created
                        done(results);
                    }
                });

            }
        });
    }

    module.getAccounts = function(done){
        db.cypher({ 
            query: 'MATCH (a:Account) ' + 
                   'RETURN a'
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

    module.getRequests = function(done){
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

    module.approveAccount = function(aid, done){
        console.log(aid);
        db.cypher({ 
            query: 'MATCH (a:Account) ' + 
                   'WHERE id(a) = {id} ' +
                   'SET a.approved = true ' + 
                   'RETURN a',
            params: {
                id: parseInt(aid)
            }
        }, function(error, results){
            if (error){
                console.log(error);
                done(null, error);
            }
            else {
                //Account approved
                done(results);
            }
        });
    }

    module.denyAccount = function(aid, done){
        db.cypher({ 
            query: 'MATCH (a:Account) ' + 
                   'WHERE id(a) = {id} ' +
                   'SET a.approved = false ' + 
                   'RETURN a',
            params: {
                id: parseInt(aid)
            }
        }, function(error, results){
            if (error){
                console.log(error);
                done(null, error);
            }
            else {
                //Account approved
                done(results);
            }
        });
    }

    module.approveRequest = function(aid, rid, uid, done){
        db.cypher({ 
            query: 'MATCH (r:Request) ' + 
                   'WHERE id(r) = {rid} ' +
                   'SET r.complete = true ' + 
                   'RETURN r',
            params: {
                rid: parseInt(rid)
            }
        }, function(error, results){
            if (error){
                console.log(error);
                done(null, error);
            }
            else {
                db.cypher({ 
                    query: 'MATCH (a:Account), (u:Channel) ' + 
                           'WHERE id(u) = {uid} ' +
                           'AND id(a) = {aid} ' + 
                           'CREATE (a)-[r:CONNECTED_TO]->(u) ' + 
                           'RETURN a, r, u',
                    params: {
                        uid: parseInt(uid),
                        aid: parseInt(aid)
                    }
                }, function(error, results){
                    if (error){
                        console.log(error);
                        done(null, error);
                    }
                    else {
                        //Account approved
                        done(results);
                    }
                });;
            }
        });
    }

    module.getRequest = function(rid, done){
        db.cypher({ 
            query: 'MATCH (r:Request) ' + 
                   'WHERE id(r) = {id} ' +
                   'RETURN r',
            params: {
                id: parseInt(rid)
            }
        }, function(error, results){
            if (error){
                console.log(error);
                done(null, error);
            }
            else {
                //Account approved
                done(results);
            }
        });
    }

    return module;

}
