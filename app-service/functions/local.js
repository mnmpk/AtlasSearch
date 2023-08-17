// This function is the endpoint's request handler.
//exports = function({ query, headers, body}, response) {
exports = function(query) {
    // Data can be extracted from the request as follows:

    // Query params, e.g. '?arg1=hello&arg2=world' => {arg1: "hello", arg2: "world"}
    const {q} = query;

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
    
    const agg_pipeline = [
      {
        "$match": {
          "_id": ObjectId(q),
        },
      },
    ];
    const results = context.services.get("mongodb-atlas").db("sample_mflix").collection("movies").aggregate(agg_pipeline);
    return results; 
};
