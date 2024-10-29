# Getting started

1. Install dependencies

npm install

2. Run the server

start:dev

Make sure you are connected to NTNU's network

# Current resolvers

## Query

getPosts() -> Returns all posts

getPost(id) -> Takes in ID as a param, and returns the matching post

getUser(username) -> Takes in username as param, and returns the matching user

getComments(PostID) -> Takes in postID as param, and returns comments for that post

searchAll(query) -> Takes in a query and returns any matching posts or Users

searchUsers(query) -> Takes in a quert and returns any matching Users

## Mutation

createPost(body, author) -> Takes in author and body and creates a post

createUser(username) -> Takes in a username and creates a user if the username doesn't already exist

createComment(body, author, postId) -> Takes in a body, author and parent postId and creates a comment

likePost(postId, username) -> Takes in a postID and username. Checks if the user has already liked a post, and if not likes the post

unlikePost(postId, username) -> Takes in a postID and username. Checks if the user has liked a post, and if it has, dislikes the post
