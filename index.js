const express = require('express');
const { ApolloServer, gql, makeExecutableSchema } = require('apollo-server-express');
const app = express();
const db = require('./db');

// types
//
// types extends the SimplyRets object types schema to include the Query and Mutation types.
let types = require('./types')+ `
    type Query {
        Listing(mlsId: String!): Listing,
        Listings(city: String!): [Listing]
    },
    type Mutation {
        Favorite (mlsId: String!, value: Int!): Listing
    }
`;
let typeDefs = gql`${types}`;

// resolvers
//
// Adds the resolver functions to handle the GraphQl queries for fetching and updating listings.
const resolvers = {
    Query: {
        Listing: async (obj, args) => {
            return await db.listing(args.mlsId);            
        },
        Listings: async (obj, args) => {
            return await db.listings(args.city);
        }    
    },
    Mutation: {
        Favorite: async (obj, args) => {
          return await db.favoriteListing(args.mlsId, args.value);
        }
    }
};

//
// create the ApolloServer passing a context function that will authenticate any GraphQl endpoint operations
const server = new ApolloServer({
    schema: makeExecutableSchema({ typeDefs, resolvers }),
    context: async ({ req }) => {
        let user = await db.authenticate(req);
        if (!user) throw new Error('Error: Not authorized');
        return { user };
    }
});

(async function run() {
    db.open();

    server.applyMiddleware({ app, path:"/graphql" });

    app.listen({ port: 4000 }, () =>
        console.log(`Listening on http://localhost:4000/graphql`)
    );
})();
