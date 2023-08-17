// This function is the endpoint's request handler.
//exports = function({ query, headers, body}, response) {
exports = function(query) {
    // Data can be extracted from the request as follows:

    // Query params, e.g. '?arg1=hello&arg2=world' => {arg1: "hello", arg2: "world"}
    const {s, q} = query;

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
    
    let agg_pipeline = [];
    if(s=="1"){
      agg_pipeline.push({
        "$match": {
          "_id": new BSON.ObjectId(q),
        },
      });
    }else if(s=="2"){
      agg_pipeline.push({
        "$search": {
          text: {
            query: q,
            path: ["title", "fullplot"]
          },
          sortBetaV1: {
            year: -1,
          },
          highlight: {
            path: ["fullplot", "title"],
          }
        }
      });
    }
    agg_pipeline.push({
      $project:
        {
          title: 1,
          fullplot: 1,
          year: 1,
          genres: 1,
          poster: 1,
          score: {
            $meta: "searchScore",
          },
          highlights: {
            $meta: "searchHighlights",
          },
        },
    });
    const results = context.services.get("mongodb-atlas").db("sample_mflix").collection("movies").aggregate(agg_pipeline);
    return results; 
};
