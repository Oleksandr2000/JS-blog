import mongoose from 'mongoose';

const CommentsSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
      unique: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model('Comments', CommentsSchema);
