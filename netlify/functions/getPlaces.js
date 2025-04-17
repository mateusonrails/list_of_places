const faunadb = require('faunadb');
const q = faunadb.query;

exports.handler = async () => {
  const client = new faunadb.Client({
    secret: process.env.FAUNADB_SECRET,
  });

  try {
    const result = await client.query(
      q.Map(
        q.Paginate(q.Documents(q.Collection('places'))),
        q.Lambda('ref', q.Get(q.Var('ref')))
      )
    );

    const places = result.data.map(item => ({
      id: item.ref.id,
      description: item.data.description,
      isCompleted: item.data.isCompleted
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(places),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};