import * as express from "express";
import * as dotenv from "dotenv";
import * as bodyParser from "body-parser";
import * as cors from "cors";
import Posts from "./models/Post";
import { mongoConnection } from "./database/connection";

dotenv.config();

const app = express();
const port = process.env.PORT || 8012;

app.use(bodyParser.json());
app.use(cors());

mongoConnection();
app.get("/", async (req, res) => {
  try {
    const posts = await Posts.find(); // Fetch all posts from the Posts collection
    if (!!posts) {
      console.debug(`/, GET`);
      return res.status(200).send(posts);
    } else {
      console.info(`/, GET: Not Found`);
      return res.status(404).send("Not Found");
    }
  } catch (error) {
    console.error({
      msg: `/, GET: Internal Error`,
      error,
    });
    return res.status(500).send("Internal Error");
  }
});

// Define the GET endpoint to fetch a single post by ID
app.get("/:id", async (req, res) => {
  const { id } = req.params; // Extract the post ID from the request parameters

  try {
    const post = await Posts.findById(id); // Find a single post by its ID

    if (!post) {
      console.debug(`/:id, GET NOT found`);
      return res.status(404).json({ message: "Post not found" }); // Return 404 if no post is found
    }
    console.debug(`/:id, GET success`);
    return res.status(200).json(post); // Return the found post as a JSON response
  } catch (error) {
    console.error("Error fetching post by ID:", error, req.params.id);
    res.status(500).json({ message: "Server Error" }); // Return 500 if an error occurs
  }
});

app.post("/", async (req, res) => {
  const { title, description, images, comments, likes, attributes, creator } =
    req.body; // Destructure post details from the request body

  try {
    const newPost = new Posts({
      title,
      description,
      images,
      comments,
      likes,
      creator,
      attributes,
    }); // Create a new post instance

    await newPost.save(); // Save the new post to the database
    console.debug(`/:id, POST success`);
    res.status(201).json(newPost); // Return the created post with a 201 status
  } catch (error) {
    console.error("Error creating new post:", error);
    res.status(500).json({ message: "Server Error" }); // Return 500 if an error occurs
  }
});

// Add the PUT endpoint to update a post
app.put("/:id", async (req, res) => {
  const { id } = req.params; // Extract the post ID from the request parameters
  const { title, description, images, attributes, creator } = req.body; // Destructure fields from the request body

  try {
    const post = await Posts.findById(id); // Find the existing post by ID

    if (!post) {
      console.debug(`/:id, PUT NOT found`);
      return res.status(404).json({ message: "Post not found" }); // Return 404 if the post does not exist
    }

    // Merge new images and attributes with existing ones
    // @ts-ignore
    post.images = [...new Set([...(post.images || []), ...(images || [])])]; // Merge and remove duplicates
    post.attributes = { ...post.attributes, ...attributes }; // Merge attributes

    // Update other fields if provided
    if (title) post.title = title;
    if (description) post.description = description;
    if (creator) post.creator = creator;

    await post.save(); // Save the updated post to the database
    console.debug(`/:id, PUT success`);
    return res.status(200).json(post); // Return the updated post as a JSON response
  } catch (error) {
    console.error("Error updating post by ID:", error, req.params.id);
    res.status(500).json({ message: "Server Error" }); // Return 500 if an error occurs
  }
});

app.delete("/:id", async (req, res) => {
  const { id } = req.params; // Extract the post ID from the request parameters

  try {
    const post = await Posts.findByIdAndDelete(id); // Find and delete the post by ID

    if (!post) {
      console.debug(`/:id, DELETE NOT found`);
      return res.status(404).json({ message: "Post not found" }); // Return 404 if the post does not exist
    }

    console.debug(`/:id, DELETE success`);
    return res.status(200).json({ message: "Post deleted successfully" }); // Return success message if post is deleted
  } catch (error) {
    console.error("Error deleting post:", error, req.params.id);
    res.status(500).json({ message: "Server Error" }); // Return 500 if an error occurs
  }
});

// Add the PATCH endpoint to increment or decrement post likes
app.patch("/:id/likes", async (req, res) => {
  const { id } = req.params; // Extract the post ID from the request parameters
  const { like } = req.body; // Destructure the like field from the request body

  // Ensure the like field is either true or false
  if (typeof like !== "boolean") {
    return res
      .status(400)
      .json({ message: 'Invalid request: "like" should be a boolean value' });
  }

  try {
    const post = await Posts.findById(id); // Find the existing post by ID

    if (!post) {
      console.debug(`/:id/likes, PATCH NOT found`);
      return res.status(404).json({ message: "Post not found" }); // Return 404 if the post does not exist
    }

    // Increment or decrement likes based on the like field
    if (like) {
      post.likes = (post.likes || 0) + 1; // Increment likes if like is true
    } else {
      post.likes = (post.likes || 0) - 1; // Decrement likes if like is false
    }

    await post.save(); // Save the updated post to the database
    console.debug(`/:id/likes, PATCH success`);
    return res
      .status(200)
      .json({ message: "Likes updated", likes: post.likes }); // Return the updated likes count
  } catch (error) {
    console.error("Error updating post likes:", error, req.params.id);
    res.status(500).json({ message: "Server Error" }); // Return 500 if an error occurs
  }
});

// Add a POST endpoint to create a new comment on a post
app.post("/:id/comments", async (req, res) => {
  const { id } = req.params; // Extract the post ID from the request parameters
  const { creator, text } = req.body; // Destructure comment details from the request body

  try {
    const post = await Posts.findById(id); // Find the existing post by ID

    if (!post) {
      console.debug(`/:id/comments, POST NOT found`);
      return res.status(404).json({ message: "Post not found" }); // Return 404 if the post does not exist
    }

    // Create a new comment object
    const createdOn = new Date().toISOString();
    const newComment = { creator, text, createdOn };

    // Add the new comment to the post's comments array
    post.comments.push(newComment);

    await post.save(); // Save the updated post to the database
    console.debug(`/:id/comments, POST success`);
    return res
      .status(201)
      .json({ message: "Comment added successfully", comment: newComment }); // Return the newly added comment
  } catch (error) {
    console.error("Error adding comment to post:", error, req.params.id);
    res.status(500).json({ message: "Server Error" }); // Return 500 if an error occurs
  }
});

// Add a PUT endpoint to edit an existing comment on a post
app.put("/:id/comments/:commentId", async (req, res) => {
  const { id, commentId } = req.params; // Extract the post ID and comment ID from the request parameters
  const { text } = req.body; // Destructure the new text for the comment from the request body

  try {
    const post = await Posts.findById(id); // Find the existing post by ID

    if (!post) {
      console.debug(`/:id/comments/:commentId, PUT NOT found`);
      return res.status(404).json({ message: "Post not found" }); // Return 404 if the post does not exist
    }

    // Find the comment by ID in the post's comments array
    // @ts-ignore
    const comment = post.comments.id(commentId);

    if (!comment) {
      console.debug(`/:id/comments/:commentId, PUT comment NOT found`);
      return res.status(404).json({ message: "Comment not found" }); // Return 404 if the comment does not exist
    }

    // Update the text of the found comment
    comment.text = text;

    await post.save(); // Save the updated post to the database
    console.debug(`/:id/comments/:commentId, PUT success`);
    return res
      .status(200)
      .json({ message: "Comment updated successfully", comment }); // Return the updated comment
  } catch (error) {
    console.error("Error updating comment on post:", error, req.params.id);
    res.status(500).json({ message: "Server Error" }); // Return 500 if an error occurs
  }
});

// Add a DELETE endpoint to delete a comment from a post
app.delete("/:id/comments/:commentId", async (req, res) => {
  const { id, commentId } = req.params; // Extract the post ID and comment ID from the request parameters

  try {
    const post = await Posts.findById(id); // Find the existing post by ID

    if (!post) {
      console.debug(`/:id/comments/:commentId, DELETE NOT found`);
      return res.status(404).json({ message: "Post not found" }); // Return 404 if the post does not exist
    }

    // Find the index of the comment to be deleted
    const commentIndex = post.comments.findIndex(
      // @ts-ignore
      (comment) => comment._id.toString() === commentId,
    );

    if (commentIndex === -1) {
      console.debug(`/:id/comments/:commentId, DELETE comment NOT found`);
      return res.status(404).json({ message: "Comment not found" }); // Return 404 if the comment does not exist
    }

    // Remove the comment from the comments array
    post.comments.splice(commentIndex, 1);

    await post.save(); // Save the updated post to the database
    console.debug(`/:id/comments/:commentId, DELETE success`);
    return res.status(200).json({ message: "Comment deleted successfully" }); // Return success message
  } catch (error) {
    console.error("Error deleting comment from post:", error, req.params.id);
    res.status(500).json({ message: "Server Error" }); // Return 500 if an error occurs
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on PORT: ${port}`);
});
