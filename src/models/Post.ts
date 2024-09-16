import { Model, Schema, model } from "mongoose";

// Interface for comments structure
interface IComment {
    creator: string;
    text: string;
}

// Interface for the posts structure
export interface IPosts {
    id: string; // Alias for _id
    title: string;
    description: string;
    creator: string;
    images: string[]; // Array of image URLs as strings
    comments: IComment[]; // Array of comment objects
    likes: number;
    attributes: { [key: string]: any };
}

// Extending the mongoose Model interface
interface PostsModel extends Model<IPosts> {
    getMostLiked(): Promise<IPosts[]>; // Example static method signature
    getNewestPosts(): Promise<IPosts[]>; // Static method for sorting by newest posts
}

// Sub-schema for comments
const commentSchema = new Schema<IComment>({
    creator: {type: String, required: true},
    text: {type: String, required: true}
},
{
    timestamps: true, // Automatically add createdAt and updatedAt
});

// Main post schema
const postSchema = new Schema<IPosts, PostsModel>(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        creator: { type: String, required: true },
        images: [{ type: String }], // Array of image URLs
        comments: [commentSchema], // Embed comment schema
        likes: { type: Number, default: 0 }, // Default likes to 0
        attributes: { type: Map, of: Schema.Types.Mixed, required: true }, // Dynamic attributes
    },
    {
        timestamps: true, // Automatically add createdAt and updatedAt
        minimize: false,  // Prevents removing empty objects
        toJSON: {
            virtuals: true, // Enable virtuals in JSON output
            versionKey: false, // Exclude __v
            transform: function (doc, ret) {
                delete ret._id; // Remove _id field
                return ret;
            },
        },
        toObject: {
            virtuals: true, // Enable virtuals in object output
            versionKey: false, // Exclude __v
            transform: function (doc, ret) {
                delete ret._id; // Remove _id field
                return ret;
            },
        },
    }
);

// Virtual field for `id`
postSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

// Static method example: Get posts with most likes
postSchema.statics.getMostLiked = function (): Promise<IPosts[]> {
    return this.find().sort({ likes: -1 }).limit(5).exec();
};

// Static method to get the newest posts
postSchema.statics.getNewestPosts = function (): Promise<IPosts[]> {
    return this.find().sort({ createdAt: -1 }).limit(5).exec(); // Sort by createdAt (descending)
};

// Export the Posts model
export default model<IPosts, PostsModel>("Posts", postSchema);
