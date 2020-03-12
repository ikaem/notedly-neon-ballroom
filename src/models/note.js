// require the mongoose library
const mongoose = require("mongoose");

// define the note's database schema
const noteSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: true
        },
        author: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true
        },
        favoriteCount: {
            type: Number,
            default: 0
        },
        favoritedBy: [
            {
                type: mongoose.Types.ObjectId,
                ref: "User"
            }
        ]
    },
    {
        // assigns created at and updated at fields with a data type
        timestamps: true
    }
);

// define the note model with the schema
const Note = mongoose.model("Note", noteSchema);

// export the module
module.exports = Note;