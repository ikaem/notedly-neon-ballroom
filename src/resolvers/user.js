module.exports = {
    // resolve the list of notes for a user when requested...
    notes: async (user, args, { models }) => {
        // means - go to notes and find all hotes whoe author prop is user.id
        return await models.Note.find({ author: user.id}).sort({ _id: -1});
    },
    // resolve list of favorites for a specific user
    favorites: async (user, args, { models }) => {
        // go to notes and find all ntoes that have user id in their favoritedby array
        return await models.Note.find({favoritedBy: user._id }).sort({_id: -1});
    }
}

