graphql-node-example
======================
Sample GrahpQL server with node interface query.

## Getting Started
```bash
# clone repo
git clone https://github.com/puniwrex/graphql-node-example.git

# navigate to repo
cd graphql-node-example

# install deps
npm install
```

This example uses MongoDB, go to `src/models` to see database structure. Add your own data or use the code below to generate sample data and insert it to the database.
```bash
# insert rows
npm run insert-sample-data
```

**Additional Instructions**
- Please declare your `DB_HOST = mongodb` inside `.env` file.
- Use `/graphiql` endpoint for easy query.
- Start script uses `nodemon` (not included in repo).
- A sample query:
```
{
  node(
    id:"users:_id"
  ) {
    ...on User {
      _id
      first_name
      friends {
        first_name
      }
      posts {
        edges {
          node {
            body
            created_at
          }
        }
      }
    }
  }
}
```