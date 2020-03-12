const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
    AuthenticationError, ForbiddenError
} = require("apollo-server-express");
require("dotenv").config();
const gravatar = require("../util/gravatar");
const mongoose = require("mongoose");




module.exports = {
    newNote: async (parent, args, { models, user }) => {
        // if no user, throw authentication error
        if(!user) {
            throw new AuthenticationError("You must be signed in to create a note...")
        }
        return await models.Note.create({
            content: args.content,
            author: mongoose.Types.ObjectId(user.id)
        });
    },
    deleteNote: async (parent, { id }, { models, user }) => {
        // if not a user, throw authentication error
        if(!user) {
            throw new AuthenticationError("You must me signed in to delete a note...")
        }
        // find the note...
        const note = await models.Note.findById(id);
        // if note owner and current user dont match, throw forbidden error
        if(note && String(note.author) !== user.id) {
            throw new ForbiddenError("You dont have permissions to delete the note...");
        }

        try {
            // at this point, all checks out, so delete the note...
            await note.remove();
            return true;
        }
        catch (error) {
            // if err along the way, return false...
            return false;
        }
    },
    updateNote: async (parent, { content, id }, { models, user }) => {
        // again, if no user, authnet aerror
        if (!user) {
            throw new AuthenticationError("You must me signed in to update a note...");
        }
        // find the note
        const note = await models.Note.findById(id);
        // again, if note owner and current user dont match, throw forbidden error
        if(note && String(note.author) !== user.id) {
            throw new ForbiddenError("You dont have permissions to udpate the note...");
        }

        // update the note in the db and return the updated note
        return await models.Note.findOneAndUpdate(
            {
                _id: id
            },
            {
                $set: {
                    content
                }
            },
            {
                new: true
            }
        );
    },
    signUp: async (parent, { username, email, password }, { models }) => {
        // normalizing email address
        email = email.trim().toLowerCase();
        // hashing the password
        const hashed = await bcrypt.hash(password, 10);
        // create the avatar url
        const avatar = gravatar(email);
        try {
            const user = await models.User.create({
                username,
                email, 
                avatar,
                password: hashed
            });
            // now we create and return the json web token
            return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        }
        catch (error) {
            console.log(error);
            throw new Error("Error creating account");
        }
    },
    signIn: async (parent, { username, email, password}, { models }) => {
        if(email) {
            // normalize email address
            email = email.trim().toLowerCase();
        }
        // search user based on email or username
        const user = await models.User.findOne({
            $or: [{ email }, { username }]
        });

        // if no user, throw error
        if(!user) {
            throw new AuthenticationError("Error signing in...");
        }
        // if passwords dont match, throw error
        const valid = await bcrypt.compare(password, user.password);
        if(!valid) {
            throw new AuthenticationError("Error signing in...");
        }
        // create and return json web token...
        return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    },
    toggleFavorite: async (parent, { id }, { models, user }) => {
        // if no user context is passed, throw auth error
        if (!user) {
            throw new AuthenticationError("You need to be logged in to favorite a note...");
        }
        // chgeck to see if the user has already favorited the note
        // why let declaration here?
        let noteCheck = await models.Note.findById(id);
        console.log("user id:", user.id)
        console.log("noteCheck", noteCheck);
        const hasUser = noteCheck.favoritedBy.indexOf(user.id);
        console.log(hasUser)

        // if the user is in the list, take them off and reduce faveCount by 1
        if(hasUser >= 0){
            console.log("reducing...")
            return await models.Note.findOneAndUpdate(
                id,
                {
                    // i guess pull will remove this specifc id from the favoitedBy array...
                    $pull: {
                        favoritedBy: mongoose.Types.ObjectId(user.id)
                    },
                    // also, same thing - inc just increments things on a property
                    $inc: {
                        favoriteCount: -1
                    }
                },
                // set new to true to return the updated document
                {
                    new: true
                }
            );
        }
        else {
            // if the user doesnt exist in the list
            // add them to the list, incement the faveCount by 1
            return await models.Note.findOneAndUpdate(
                id,
                {
                    // so push specifc id to the document's favoritedBy property array...
                    $push: {
                        favoritedBy: mongoose.Types.ObjectId(user.id)
                    },
                    $inc: {
                        favoriteCount: +1
                    }
                },
                // again, set new to true to return the document
                {
                    new: true
                }
            );
        }
    }
}