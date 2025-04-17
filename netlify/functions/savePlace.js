const faunadb = require('faunadb');
const q = faunadb.query;

exports.handler = async (event) => {
  const client = new faunadb.Client({
    secret: process.env.FAUNADB_SECRET,
  });

  const data = JSON.parse(event.body);

  try {
    const result = await client.query(
      q.Create(
        q.Collection('places'),
        {
          data: {
            description: data.description,
            isCompleted: data.isCompleted,
            createdAt: q.Now()
          }
        }
      )
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        id: result.ref.id,
        ...result.data
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};