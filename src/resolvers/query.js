module.exports = {
    notes: async (parent, args, { models }) => {
        return await models.Note.find().limit(100);
    },
    note: async (parent, args, { models }) => {
        return await models.Note.findById(args.id);
    },
    user: async (parent, { username }, { models }) => {
        // find user off a username, which is passed through args...
        return await models.User.findOne({ username });
    },
    users: async (parent, args, { models }) => {
        // find all users
        return await models.User.find({});
    },
    me: async (parent, args, { models, user }) => {
        // find specifc user off the context - token
        return await models.User.findById(user.id);
    },
    noteFeed: async (parent, { cursor }, { models }) => {
        // hardoce limit to 10 items
        const limit = 10;
        // set default has next page value to false
        let hasNextPage = false;
        // if no cursor is passed, the default query will be empty...
        // this will pull the newest notes from the db...
        // this will happen because we do .sort(_id: -1});
        let cursorQuery = {};

        // if the cursor does exist
        // query will look for notes with an object id less than the cursor one...
        // i guess $lt will look for the first item less than the cursor...
        // no, it will return all items with id lesser than the cursor
        // and it will save them as an array of objects into the cursor query...
        if (cursor) {
            cursorQuery = {_id: { $lt: cursor }}
        }

        // now we find the number of notes that is limit + 1, we sort it ofc
        let notes = await models.Note.find(cursorQuery)
            .sort({_id: -1})
            .limit(limit + 1);

        // if nr of notes we find exceeds our limit
        // set next page to true
        // trim the notes to the limit
        if(notes.length > limit) {
            hasNextPage = true;
            console.log("length of the otes...", notes.length);
            notes = notes.slice(0, -1);
        }

        // the new curor will be the mongo object id of the last item in the feed arary

        const newCursor = notes[notes.length - 1]._id;

        return {
            notes, cursor: newCursor, hasNextPage
        }


    }
}