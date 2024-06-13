const { ApolloServer, gql } = require("apollo-server-express");
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config({ path: path.join(__dirname, ".env.local") });
console.log("MongoDB URL:", process.env.MONGODB_URL);

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URL )
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.error("Error connecting to MongoDB:", error));

// Define User schema
const userSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    phone: String,
  },
  { timestamps: true }
);

// Define User model
const User = mongoose.model("User", userSchema);

// GraphQL schema
const typeDefs = gql`
  type User {
  _id: ID
  name: String
  email: String
  phone: String
  createdAt: String
  updatedAt: String
}

  input UserInput {
    name: String
    email: String
    phone: String
  }

  type Query {
    getUser(id: ID!): User
    getUsers: [User]
  }

  type Mutation {
    createUser(userInput: UserInput!): User!
    updateUser(id: ID!, userInput: UserInput!): User
    deleteUser(id: ID!): Boolean
  }
`;

// Resolvers
const resolvers = {
  Query: {
    getUser: async (_, { id }) => User.findById(id),
    getUsers: async () => User.find(),
  },
  Mutation: {
    createUser: async (_, { userInput }) => User.create(userInput),
    updateUser: async (_, { id, userInput }) => {
      const { name, email, phone } = userInput;
      const updates = {};
      if (name) updates.name = name;
      if (email) updates.email = email;
      if (phone) updates.phone = phone;
      return User.findByIdAndUpdate(id, updates, { new: true });
    },
    deleteUser: async (_, { id }) => {
      await User.findByIdAndDelete(id);
      return true;
    },
  },
};

// Start the Apollo Server with Express
(async () => {
  const app = express();

  // Middleware to parse JSON bodies
  app.use(express.json());

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  server.applyMiddleware({ app });

  app.listen({ port: process.env.PORT || 7000 }, () =>
    console.log(
      `Server ready at http://localhost:${process.env.PORT || 4000}${
        server.graphqlPath
      }`
    )
  );
})();
