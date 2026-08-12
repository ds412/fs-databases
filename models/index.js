const Blog = require('./blog')
const User = require('./user')

// user has a one-to-many relation to blog
User.hasMany(Blog)
Blog.belongsTo(User)

User.sync({ alter: true })
Blog.sync({ alter: true })

module.exports = {
    Blog, User
}
