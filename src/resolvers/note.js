module.exports = {
    // resolve the uathor info for a note when requiested
    // i guess note stands for parent
    author: async (note, args, { models }) => {
        return await models.User.findById(note.author);
    },
    // resolve the favoriteBy info for a note when requested
    favoritedBy: async (note, args, { models }) => {
        // this means - go to Users, and find all users whose id exists in this ntoe.favoritedBy array...
        return await models.User.find({ _id: { $in: note.favoritedBy }});
    }
}