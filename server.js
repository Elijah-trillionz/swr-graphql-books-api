const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLString,
} = require('graphql');
const cors = require('cors');
const app = express();

app.use(cors());

const authors = [
  { id: 1, name: 'J. K. Rowling' },
  { id: 2, name: 'J. R. R. Tolkien' },
  { id: 3, name: 'Brent Weeks' },
];

const books = [
  { id: 1, name: 'Harry Potter and the Chamber of Secrets', authorId: 1 },
  { id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1 },
  { id: 3, name: 'Harry Potter and the Goblet of Fire', authorId: 1 },
  { id: 4, name: 'The Fellowship of the Ring', authorId: 2 },
  { id: 5, name: 'The Two Towers', authorId: 2 },
  { id: 6, name: 'The Return of the King', authorId: 2 },
  { id: 7, name: 'The Way of Shadows', authorId: 3 },
  { id: 8, name: 'Beyond the Shadows', authorId: 3 },
];

const AuthorType = new GraphQLObjectType({
  name: 'Author',
  description: 'This represents an author of a book',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    books: {
      type: new GraphQLList(BookType),
      resolve: (author) => books.filter((book) => book.authorId === author.id),
    },
  }),
});

const BookType = new GraphQLObjectType({
  name: 'Book',
  description: 'This represents a boook written by an author',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    authorId: { type: GraphQLNonNull(GraphQLInt) },
    author: {
      type: AuthorType,
      resolve: (book) => authors.find((author) => author.id === book.authorId),
    },
  }),
});

const RootQueryType = new GraphQLObjectType({
  name: 'Query',
  description: 'Root query',
  fields: () => ({
    book: {
      type: BookType,
      description: 'A single book',
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) => books.find((book) => book.id === args.id),
    },
    books: {
      type: new GraphQLList(BookType),
      description: 'list of all books',
      resolve: () => books,
    },
    author: {
      type: AuthorType,
      description: 'A single author',
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) =>
        authors.find((author) => author.id === args.id),
    },
    authors: {
      type: new GraphQLList(AuthorType),
      description: 'list of all authors',
      resolve: () => authors,
    },
  }),
});

const RootMutation = new GraphQLObjectType({
  name: 'Mutations',
  description: 'Root mutations',
  fields: () => ({
    addBook: {
      type: BookType,
      description: 'Add new book',
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        authorId: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: (parent, { name, authorId }) => {
        const book = { id: books.length + 1, name, authorId };
        books.push(book);
        return book;
      },
    },
    addAuthor: {
      type: AuthorType,
      description: 'Add new author',
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: (parent, { name }) => {
        const author = { id: authors.length + 1, name };
        authors.push(author);
        return author;
      },
    },
  }),
});

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutation,
});

app.use('/graphql', graphqlHTTP({ schema, graphiql: true }));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log('server running on port ' + PORT));
