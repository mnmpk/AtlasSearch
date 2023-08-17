
/*
  This function is run when a GraphQL Query is made requesting your
  custom field name. The return value of this function is used to
  populate the resolver generated from your Payload Type.

  This function expects the following input object:

  {
    "type": "object",
    "title": "MyCustomResolverInput",
    "properties": {
      "name": {
        "type": "string"
      }
    },
    "required": ["name"]
  }

  And the following payload object:

  {
    "type": "object",
    "title": "MyCustomResolverResult",
    "properties": {
      "hello": {
        "type": "string"
      }
    }
  }
*/

exports = async function sumEstate(input, source) {
  console.log("input:" + input);
  console.log(JSON.stringify(source));
  const cluster = context.services.get("mongodb-atlas");
  const sales = cluster.db("search").collection("data");
  const result = await sales
    .aggregate([
      {
        $group: {
          _id: undefined,
          totalEstate: { $sum: input.i },
        }
      }
    ])
    .next();
  return {"test":"",count:result.totalEstate};
};