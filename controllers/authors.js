const router = require('express').Router()

const { Blog } = require('../models')
const { sequelize } = require('../util/db')

router.get('/', async (req, res) => {
    // SELECT {attributes} FROM 'blogs' AS 'blog'
    const authors = await Blog.findAll({
        // 'author',
        // COUNT('author') AS 'blogs',
        // SUM('likes') AS 'likes',
        attributes: [
            'author',
            [sequelize.fn('COUNT', sequelize.col('author')), 'blogs'],
            [sequelize.fn('SUM', sequelize.col('likes')), 'likes']
        ],
        // GROUP BY 'author'
        group: ['author'],
        // ORDER BY SUM('likes') DESC
        order: [[sequelize.fn('SUM', sequelize.col('likes')), 'DESC']]
    })

    res.json(authors)
})

module.exports = router
