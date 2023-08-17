// This function is the endpoint's request handler.
//exports = function({ query, headers, body}, response) {
exports = function(query) {
    // Data can be extracted from the request as follows:

    // Query params, e.g. '?arg1=hello&arg2=world' => {arg1: "hello", arg2: "world"}
    const {coll, i, q, o, f, lat, lng, r, l, k, e, c, j, p} = query;

    // Headers, e.g. {"Content-Type": ["application/json"]}
    //const contentTypes = headers["Content-Type"];

    // Raw request body (if the client sent one).
    // This is a binary object that can be accessed as a string using .text()
    //const reqBody = body;

    //console.log("query, fuzzy, lat, lng, radius, limit: ", q, f, lat, lng, r, l);
    //console.log("Content-Type:", JSON.stringify(contentTypes));
    //console.log("Request body:", reqBody);
    
    // You can use 'context' to interact with other Realm features.
    // Accessing a value:
    // var x = context.values.get("value_name");

    // Querying a mongodb service:
    // const doc = context.services.get("mongodb-atlas").db("dbname").collection("coll_name").findOne();

    // Calling a function:
    // const result = context.functions.execute("function_name", arg1, arg2);
    let must=[];
    let paths = [];
    let should = [];
    if(q){
      if(p){
        paths.push(p);
        if(k){
          var kp = {"value": p, "multi": "keyword"};
          paths.push(kp);
        }
        if(e){
          var ep = {"value": p, "multi": "english"};
          paths.push(ep);
        }
        if(c){
          var cp = {"value": p, "multi": "chinese"};
          paths.push(cp);
        }
        if(j){
          var jp = {"value": p, "multi": "japanese"};
          paths.push(jp);
        }
      }else{
        paths.push({'wildcard': '*'});
      }
      
      paths.forEach((path) => {
        if(o=="text"){
          let intF = parseInt(f);
            if(intF>0){
              should.push({ "text": { "query": q, "path": path, "fuzzy": {
                'maxEdits': intF,
                'prefixLength': 0
              } } });
            } else {
              should.push({ "text": { "query": q, "path": path}});
            }
        }else if(o=="wildcard"){
          should.push({ "wildcard": { "query": "*"+q+"*", "path": path , "allowAnalyzedField":true} });
        }else if(o=="regex"){
          should.push({ "regex": { "query": ".*"+q+".*", "path": path , "allowAnalyzedField":true} });
        }
      });
      must.push({'compound':{
          'should':should
      }});
    }
    
    if(lat && lng && r){
      must.push({
          'geoWithin': { 
              'path' : 'location',
              'circle' : { 'center': { "type": "Point", "coordinates": [parseFloat(lng), parseFloat(lat)]}, 'radius': parseInt(r) }
          }
      });
    }
    let search = {
      'index':i,
      'compound':{
          'must':must
      }
    };
    if(paths.length){
      search['highlight']={ 
        'path': paths
      };
    }
    
    const agg_pipeline = [
        {
          '$search': search
        }, {
            '$project': {
                'document': "$$ROOT",
                'highlights': {"$meta": "searchHighlights"},
                'score': {
                    '$meta': 'searchScore'
                }
            }
        },
        {
          '$limit': parseInt(l)
        }
    ];
    const results = context.services.get("mongodb-atlas").db("search").collection(coll).aggregate(agg_pipeline);
    console.log("params:{i:"+i+",coll:"+coll+",q:\""+q+"\", o: "+o+", f: "+f+", lat:"+lat+", lng:"+lng+", r:"+r+", l:"+l+", k:"+k+", e:"+e+", c:"+c+", j:"+j+", p:"+p+"}");
    return results; 
};
