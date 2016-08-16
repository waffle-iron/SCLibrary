module.exports = function(db) {

  var module = {};

  module.getTrack = function(id, done) {
    db.cypher({
      query: 'MATCH (n:Track) ' +
        'WHERE id(n) = ' + parseInt(id) + ' ' +
        'RETURN n'
    }, function(error, results) {
      if (error) {
        done(null, error);
      } else {
        done(results);
      }
    });
  }

  module.rateTrack = function(tid, uid, rating, done) {
    db.cypher({
      query: 'MATCH (u:Channel)-[r:LIKES_TRACK]->(t:Track) ' +
        'WHERE id(t) = ' + parseInt(tid) + ' ' +
        'AND id(u) = ' + parseInt(uid) + ' ' +
        'SET r.rating = ' + parseInt(rating) + ' ' +
        'RETURN r'
    }, function(error, results) {
      if (error) {
        done(null, error);
      } else {
        done(results);
      }
    });
  }

  module.incPlayCount = function(tid, uid, done) {
    db.cypher({
      query: 'MATCH (u:Channel)-[r:LIKES_TRACK]->(t:Track) ' +
        'WHERE id(t) = ' + parseInt(tid) + ' ' +
        'AND id(u) = ' + parseInt(uid) + ' ' +
        'SET r.play_count = r.play_count + 1 ' +
        'RETURN r'
    }, function(error, results) {
      if (error) {
        done(null, error);
      } else {
        done(results);
      }
    });
  }

  module.toggleDLStatus = function(tid, uid, done) {
    db.cypher({
      query: 'MATCH (u:Channel)-[r:LIKES_TRACK]->(t:Track) ' +
        'WHERE id(t) = ' + parseInt(tid) + ' ' +
        'AND id(u) = ' + parseInt(uid) + ' ' +
        'SET r.downloaded = not(r.downloaded) ' +
        'RETURN r'
    }, function(error, results) {
      if (error) {
        done(null, error);
      } else {
        done(results);
      }
    });
  }

  return module;

}
