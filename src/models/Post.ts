import { Model, Schema, model } from "mongoose";

export interface IPosts {
  name: string;
  description: string;
  images: [{
    type: String
  }];
  comments: [
    {
      name: String,
      text: String,
      picture: String
    }
  ],
  attributes: { [key: string]: any };
}

interface PostsModel extends Model<IPosts> {
  // myStaticMethod(): number;
}

const postSchema = new Schema<IPosts, PostsModel>({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  images: [
      {
        type: String
      }
      ],  // Array of image URLs
  comments: [
      {
    name: String,
    text: String,
    picture: String
  }
  ],
  attributes: {
    type: Object,
    required: true
  },
}, { minimize: false });

const Post = model<IPosts, PostsModel>("Posts", postSchema);

export { Post };
