import * as express from "express";
import * as dotenv from "dotenv";
import * as bodyParser from "body-parser";
import { mongoConnection } from "./database/connection";
import { Post, IPosts } from "./models/Post";
import * as cors from "cors";

dotenv.config();

const app = express();
const port = process.env.PORT || 8011;

app.use(bodyParser.json());
app.use(cors());
// MongoDB connection
mongoConnection();

app.get("/", async (req: any, res) => {
  try {
    const posts = await Post.find();
    console.log("Error GET /: all posts");
    return res.status(200).json(posts);
  } catch (error) {
    console.error("Error GET /: Server Error all posts", error);
    res.status(500).send("Server Error");
  }
});
app.post("/", async (req: any, res) => {
  try {
    const { name, attributes, description, images, comments } = req.body;
    const data: IPosts = {
      name,
      description,
      images: images || [],
      comments: comments || [],
      attributes: attributes || {},
    };
    const newPost = new Post(data);
    await newPost.save();
    return res.status(201).json(newPost);
  } catch (error) {
    console.error("Error POST /: creating post", error);
    return res.status(500).json({ message: "Error creating post", error });
  }
});

app.get("/:id", async (req: any, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      console.error("Error GET / : post not found", req.params.id);
      return res.status(404).json({ message: "Post not found" });
    }
    return res.status(200).json(post);
  } catch (error) {
    console.error("Error GET / : post by id", error, req.params.id);
    return res.status(500).json({ message: "Error fetching post", error });
  }
  try {
  } catch (error) {
    console.error(
      "Error GET / : Server Error",
      error.code,
      error.message,
      error.config,
    );
    res.status(500).send("Server Error");
  }
});

app.delete("/:id", async (req: any, res) => {
  try {
    const deletedPost = await Post.findByIdAndDelete(req.params.id);
    if (!deletedPost) {
      console.error("Error DELETE / : post not found", req.params.userId);
      return res.status(404).json({ message: "Post not found" });
    }
    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error DELETE / : Server Error", error, req.params.id);
    res.status(500).json({ message: "Error deleting post", error });
  }
});

app.put("/:id", async (req: any, res) => {
  try {
    const { name, attributes, description, images, comments } = req.body;

    // Fetch the existing post
    const existingPost = await Post.findById(req.params.id);
    if (!existingPost) {
      console.error("Error PUT / : post not found", req.params.id);
      return res.status(404).json({ message: "Post not found" });
    }

    // Merge attributes if they exist
    const updatedAttributes = { ...existingPost.attributes, ...attributes };

    // Update the post with merged attributes
    const updatedPost = await Post.findByIdAndUpdate(
        req.params.id,
        { name, attributes: updatedAttributes, description, images, comments },
        { new: true }, // Return the updated document
    );

    return res.status(200).json(updatedPost);
  } catch (error) {
    console.error("Error PUT / : post update", error, req.params.id);
    return res.status(500).json({ message: "Error updating post", error });
  }
});

app.post("/:id/comments", async (req: any, res) => {
  try {
    const { comment } = req.body;  // Extract the comment from the request body

    if (!comment) {
      return res.status(400).json({ message: "Comment is required" });
    }

    // Fetch the post by ID
    const post = await Post.findById(req.params.id);
    if (!post) {
      console.error("Error POST /:id/comments : post not found", req.params.id);
      return res.status(404).json({ message: "Post not found" });
    }

    // Add the new comment to the post's comments array
    post.comments.push(comment);

    // Save the updated post
    const updatedPost = await post.save();

    return res.status(200).json(updatedPost);
  } catch (error) {
    console.error("Error POST /:id/comments : adding comment", error, req.params.id);
    return res.status(500).json({ message: "Error adding comment", error });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server running on PORT: ${port}`);
});
