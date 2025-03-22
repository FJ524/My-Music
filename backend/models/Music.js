import mongoose from "mongoose";

const musicSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    artist: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category", 
      required: true,
    },
    fileUrl: {
      type: String,
      required: true, 
    },
    duration: {
      type: Number, 
    },
    releaseDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Music = mongoose.model("Music", musicSchema);

export default Music;
