exports = function(arg){
  
  const {r} = arg;
    
  // This default function will get a value and find a document in MongoDB
  // To see plenty more examples of what you can do with functions see: 
  // https://www.mongodb.com/docs/atlas/app-services/functions/

  // Find the name of the MongoDB service you want to use (see "Linked Data Sources" tab)
  var serviceName = "mongodb-atlas";

  // Update these to reflect your db/collection
  var dbName = "17Live";
  var collName = "keyword";

  const agg_pipeline = [
  {
    $search: {
      index: "keyword-search",
      compound: {
        should: [
          {
            near: {
              path: "uniqueCount",
              origin: 10000,
              pivot: 1,
              score: { boost: { value: 10000 } },
            },
          },
          {
            near: {
              path: "popularScore",
              origin: 100,
              pivot: 1,
              score: { boost: { value: 3000 } },
            },
          },
          {
            near: {
              path: "trendingScore",
              origin: 100,
              pivot: 1,
              score: { boost: { value: 5000 } },
            },
          },
        ],
        mustNot: [
          {
            equals: {
              value: 3,
              path: "status",
            },
          },
        ],
        filter: [
          {
            text: {
              query: r,
              path: "region",
            },
          },
        ],
      },
    },
  },
  {
    $project: {
      _id: 0,
      keyword: 1,
      score: { $meta: "searchScore" },
    },
  },
]
;
    const results = context.services.get(serviceName).db(dbName).collection(collName).aggregate(agg_pipeline);
    return results; 
};

