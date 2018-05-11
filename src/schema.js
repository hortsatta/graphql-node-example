export default `
  interface Node {
    _id: ID!
  }

  type User implements Node {
    _id: ID!
    first_name: String!
    last_name: String
    friends: [User]
    posts(
      after: String,
      first: Int
    ): PostsConnection
    created_at: String!
    updated_at: String!
  }

  type Post implements Node {
    _id: ID!
    user_id: ID!
    body: String!
    created_at: String!
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  type PostEdge {
    cursor: String!
    node: Post
  }

  type PostsConnection {
    pageInfo: PageInfo!
    edges: [PostEdge]
  }

  type Query {

    # query any collection by id
    node(
      id: ID!
    ): Node

  }

  type Mutation {

    # create new user
    createUser(
      first_name: String!
      last_name: String!
    ): User

  }

  # we need to tell the server which types represent the root query
  # and root mutation types. we call them RootQuery and RootMutation by convention.
  schema {
    query: Query
    mutation: Mutation
  }
`;