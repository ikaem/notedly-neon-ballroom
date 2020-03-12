// require cors at top of the file
const cors = require("cors");
// require helmet at the top of the file
const helmet = require("helmet");

const depthLimit = require("graphql-depth-limit");
const { createComplexityLimitRule } = require("graphql-validation-complexity");

require("dotenv").config();
const db = require("./db");
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const jwt = require("jsonwebtoken");

const typeDefs = require("./schema");
const models = require("./models/index");
const resolvers = require("./resolvers");

const notes = [
    {id: 1, content: "This a note", author: "Adam Scott"},
    {id: 2, content: "This another note", author: "Adam Scott"},
    {id: 3, content: "This a third note", author: "Adam Scott"},
]

const port = process.env.PORT || 4000;
const DB_HOST = process.env.DB_HOST;

const app = express();
// add helmet use at the top of the middleware stack, after const app = express()
app.use(helmet());
// add cors after helmet
app.use(cors());
// connect to the db
db.connect(DB_HOST);
// get user info from jwt
const getUser = token => {
    if(token) {
        try {
            // return user info from the token
            return jwt.verify(token, process.env.JWT_SECRET);
        }
        catch (error) {
            //if issue with the token, throw error
            // catch block will kick in for any error in the try block...
            throw new Error("Seesion invalid");
        }
    }
}

const server = new ApolloServer({
    typeDefs, 
    resolvers,
    validationRules: [depthLimit(5), createComplexityLimitRule(1000)],
    context: (context) => {
        // get the user token from the headers
        const token = context.req.headers.authorization;
        // try retireve user info from the token
        const user = getUser(token);
        // log the user
        console.log(user);
        // add the db models to context
        return { models, user }
    }
});

server.applyMiddleware({ app, path: "/api"});

app.listen({ port }, () => console.log(`GraphQL Server running at http://localhost:${port}${server.graphqlPath}`));