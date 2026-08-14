module.exports = {
    up: async ({ context: queryInterface }) => {
        await queryInterface.addConstraint('readinglists', {
            fields: ['user_id', 'blog_id'],
            type: 'unique',
            name: 'unique_user_blog_reading'
        })
    },
    down: async ({ context: queryInterface }) => {
        await queryInterface.removeConstraint('readinglists', 'unique_user_blog_reading')
    },
}
