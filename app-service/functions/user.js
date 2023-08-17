exports = function(arg){
  
  const {q, r, as, ae, fs, fe} = arg;
    
  // This default function will get a value and find a document in MongoDB
  // To see plenty more examples of what you can do with functions see: 
  // https://www.mongodb.com/docs/atlas/app-services/functions/

  // Find the name of the MongoDB service you want to use (see "Linked Data Sources" tab)
  var serviceName = "mongodb-atlas";

  // Update these to reflect your db/collection
  var dbName = "17Live";
  var collName = "user";

  const agg_pipeline = [
  {
    '$search': {
      'index': 'user-search', 
      'compound': {
        'should': [
          {
            'wildcard': {
              'query': '*'+q+'*', 
              'path': 'name'
            }
          }, {
            'text': {
              'query': q, 
              'path': {
                'wildcard': '*'
              }, 
              'fuzzy': {}
            }
          }
        ], 
        'must': [], 
        'filter': [
          {
            'text': {
              'query': r, 
              'path': 'region'
            }
          }, {
            'range': {
              'path': 'age', 
              'gte': as, 
              'lte': ae
            }
          }, {
            'range': {
              'path': 'followerCount', 
              'gte': fs, 
              'lte': fe
            }
          }
        ]
      }, 
      'highlight': {
        'path': {
          'wildcard': '*'
        }
      }
    }
  }, {
    '$facet': {
      'docs': [
        {
          '$project': {
            '_id': 0, 
            'name': 1, 
            'age': 1, 
            'bio': 1, 
            'followerCount': 1, 
            'region': 1, 
            'highlights': {
              '$meta': 'searchHighlights'
            }, 
            'score': {
              '$meta': 'searchScore'
            }
          }
        }
      ], 
      'categorizedByAge': [
        {
          '$bucketAuto': {
            'groupBy': '$age', 
            'buckets': 5
          }
        }
      ], 
      'categorizedByFollowerCount': [
        {
          '$bucketAuto': {
            'groupBy': '$followerCount', 
            'buckets': 5
          }
        }
      ]
    }
  }
];
    const results = context.services.get(serviceName).db(dbName).collection(collName).aggregate(agg_pipeline);
    return results; 
};

