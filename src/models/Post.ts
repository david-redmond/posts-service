import { Model, Schema, model } from "mongoose";

export interface IPosts {
  title: string;
  description: string;
  creator: string;
  images: [
    {
      type: String;
    },
  ];
  comments: [
    {
      creator: String;
      text: String;
      createdOn: String;
    },
  ];
  likes: number;
  attributes: { [key: string]: any };
}

interface PostsModel extends Model<IPosts> {
  // myStaticMethod(): number;
}

const postSchema = new Schema<IPosts, PostsModel>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    creator: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
      },
    ], // Array of image URLs
    comments: [
      {
        creator: String,
        text: String,
        createdOn: String,
      },
    ],
    likes: {
      type: Number,
      required: false,
    },
    attributes: {
      type: Object,
      required: true,
    },
  },
  { minimize: false },
);

export default model<IPosts, PostsModel>("Posts", postSchema);
