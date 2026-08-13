const Blog = require('./blog')
const User = require('./user')
const ReadingList = require('./readinglist')


// user has a one-to-many relation to blog
User.hasMany(Blog)
Blog.belongsTo(User)

// user has a many-to-many relation to blog via the readinglist join table
User.belongsToMany(Blog, { through: ReadingList, as: 'readings' })  // each user has certain blogs in his readings
Blog.belongsToMany(User, { through: ReadingList, as: 'readers' })   // each blog has certain users as their readers

module.exports = {
    Blog, User, ReadingList
}
