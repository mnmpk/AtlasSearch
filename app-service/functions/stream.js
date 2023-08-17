exports = function(arg){
  
  const {q, r, ts, te} = arg;
    
  // This default function will get a value and find a document in MongoDB
  // To see plenty more examples of what you can do with functions see: 
  // https://www.mongodb.com/docs/atlas/app-services/functions/

  // Find the name of the MongoDB service you want to use (see "Linked Data Sources" tab)
  var serviceName = "mongodb-atlas";

  // Update these to reflect your db/collection
  var dbName = "17Live";
  var collName = "stream";

  const agg_pipeline = [
  {
    $search: {
      index: "stream-search",
      compound: {
        should: [
          {
            near: {
              path: "beginTime",
              origin: Date.now(),
              pivot: 3600000,
            },
          },
          {
            wildcard: {
              query: "*"+q+"*",
              path: {
                value: "caption",
                multi: "keyword",
              },
            },
          },
          {
            text: {
              query: q,
              path: "caption",
              fuzzy: {},
            },
          },
          {
                        embeddedDocument: {
                            path: "hashtags",
                            operator: {
                                text: {
                                    path: "hashtags.text",
                                    query: q,
                                },
                            },
                        },
                    },
        ],
        must: [],
        filter: [
          {
            text: {
              query: r,
              path: "region",
            },
          },
          {
            range: {
              gte: ts,
              lt: te,
              path: "beginTime",
            },
          },
          {
            equals: {
              value: 0,
              path: "streamerType",
            },
          },
          {
            range: {
              gte: 1,
              lte: 2,
              path: "status",
            },
          },
        ],
      },
      highlight: {
        path: { wildcard: "*" },
      },
    },
  },
  {
    $facet: {
      docs: [
        {
          $project: {
            _id: 0,
            caption: 1,
            hashtags:1,
            region: 1,
            beginTime: 1,
            status: 1,
            highlights: {
              $meta: "searchHighlights",
            },
            score: {
              $meta: "searchScore",
            },
          },
        },
      ],
      categorizedBybeginTime: [
        {
          $bucketAuto: {
            groupBy: "$beginTime",
            buckets: 5,
          },
        },
      ],
    },
  },
]
;
    const results = context.services.get(serviceName).db(dbName).collection(collName).aggregate(agg_pipeline);
    return results; 
};

