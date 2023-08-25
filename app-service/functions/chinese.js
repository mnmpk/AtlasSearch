// This function is the endpoint's request handler.
//exports = function({ query, headers, body}, response) {
exports = function (query) {
  // Data can be extracted from the request as follows:

  // Query params, e.g. '?arg1=hello&arg2=world' => {arg1: "hello", arg2: "world"}
  const { coll, c, q, s, n, t, m, d, types, districts } = query;

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
  if (c == "mlt") {
    let like = [];
    if(n){
      like.push({
        "name.en": n.en,
      });
      like.push({
        "name.zh-hk": n["zh-hk"],
      });
      like.push({
        "name.zh-cn": n["zh-cn"],
      });
    }
    if(m){
      like.push({
        "merits.en": m.en,
      });
      like.push({
        "merits.zh-hk": m["zh-hk"],
      });
      like.push({
        "merits.zh-cn": m["zh-cn"],
      });
    }
    if(d){
      like.push({
        "district.en": d.en,
      });
      like.push({
        "district.zh-hk": d["zh-hk"],
      });
      like.push({
        "district.zh-cn": d["zh-cn"],
      });
    }
    if(t){
      like.push({
        bldg_types: t,
      });
    }
    agg_pipeline.push({
      $search: {
        moreLikeThis: {
          like: like
        },
      },
    });
    agg_pipeline.push({
      $limit:
        4,
    });
  }else if (c == "autocomplete") {
    agg_pipeline.push({
      $search: {
        index: "autocomplete",
        compound: {
          should: [{
            autocomplete: {
              query: q,
              path: "name.en",
            }
          }, {
            autocomplete: {
              query: q,
              path: "name.zh-hk",
            }
          }, {
            autocomplete: {
              query: q,
              path: "name.zh-cn",
            }
          }, {
            autocomplete: {
              query: q,
              path: "merits.en",
            }
          }, {
            autocomplete: {
              query: q,
              path: "merits.zh-hk",
            }
          }, {
            autocomplete: {
              query: q,
              path: "merits.zh-cn",
            }
          }],
        },
      },
    });
    agg_pipeline.push({
      $limit:
        5,
    });
  } else{
    let filters = [];
    if (types && types.length) {
      filters.push({
        text: {
          query: types,
          path: "bldg_types",
        }
      });
    }
    if (districts && districts.length) {
      filters.push({
        compound:{
          should:[{
            text: {
              query: districts,
              path: "district.en",
            }
          },{
            text: {
              query: districts,
              path: "district.zh-hk",
            }
          },{
            text: {
              query: districts,
              path: "district.zh-cn",
            }
          }]
        }
      });
    }
    var search = {
      compound: {
        filter: filters,
        should: [{
          wildcard: {
            query: "*"+q+"*",
            path: [
              {
                value: "name.zh-hk",
                multi: "canton",
              },
              {
                value: "name.zh-cn",
                multi: "canton",
              },
              {
                value: "merits.zh-hk",
                multi: "canton",
              },
              {
                value: "merits.zh-cn",
                multi: "canton",
              },
              {
                value: "address.zh-hk",
                multi: "canton",
              },
              {
                value: "address.zh-cn",
                multi: "canton",
              },
            ],
            score:{boost:{value:3}},
            allowAnalyzedField:true
          },
        },{
          text: {
            query: q,
            path: ["name.en", "merits.en", "address.en", "name.zh-hk", "merits.zh-hk", "address.zh-hk","name.zh-cn", "merits.zh-cn", "address.zh-cn"],
          }
        }],
        minimumShouldMatch:1,
      },
      highlight: {
        path: ["name.en", "merits.en", "address.en", "name.zh-hk", "merits.zh-hk", "address.zh-hk","name.zh-cn", "merits.zh-cn", "address.zh-cn"],
      }
    };
    if (s == "Opening Year") {
      search["sortBetaV1"] = {
        op_date: -1,
      };
    }
    agg_pipeline.push({
      $search: search
    });
  }
  agg_pipeline.push({
    $project:
    {
      name: 1,
      address: 1,
      merits: 1,
      op_date: 1,
      bldg_types: 1,
      district: 1,
      photo:1,
      location:1,
      score: {
        $meta: "searchScore",
      },
      highlights: {
        $meta: "searchHighlights",
      },
    },
  });
  agg_pipeline.push({
    $limit:
      25,
  });

  if (c == "facets") {
    agg_pipeline = [
      {
        $searchMeta: {
          facet: {
            operator: {
              text: {
                path: ["name.en", "merits.en","name.zh-hk", "merits.zh-hk","name.zh-cn", "merits.zh-cn"],
                query: q,
              },
            },
            facets: {
              typesFacet: {
                type: "string",
                path: "bldg_types",
              },
              districtFacet: {
                type: "string",
                path: "district.zh-hk",
              },
            },
          },
        },
      },
      {
        $project:
        {
          Types:
            "$facet.typesFacet.buckets",
          Districts:
            "$facet.districtFacet.buckets",
        },
      },
    ];
  }
  const results = context.services.get("mongodb-atlas").db("search").collection(coll).aggregate(agg_pipeline);
  return results;
};
