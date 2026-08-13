const router = require('express').Router()

const { Blog, User, ReadingList } = require('../models')
const { tokenExtractor } = require('../util/middleware')

// add a blog to the reading list for this user
router.post('/', async (req, res, next) => {
    try {
        const { blogId, userId } = req.body

        // ensure both the blog and the user exist
        const blog = await Blog.findByPk(blogId)
        if (!blog) {
            return res.status(400).json({ error: 'blogId does not refer to an existing blog' })
        }

        const user = await User.findByPk(userId)
        if (!user) {
            return res.status(400).json({ error: 'userId does not refer to an existing user' })
        }

        // add the blog to the reading list for the given user
        const reading = await ReadingList.create({ blogId, userId })
        res.json(reading)
    } catch (error) {
        next(error)
    }
})

// mark a blog in the reading list table as read (only if the logged-in user has this blog in its reading list)
router.put('/:id', tokenExtractor, async (req, res, next) => {
    try {
        const readinglistEntry = await ReadingList.findByPk(req.params.id)

        if (!readinglistEntry) {
            return res.status(404).end()
        }

        if (readinglistEntry.userId !== req.decodedToken.id) {
            return res.status(401).json({ error: 'only the owner can mark this as read' })
        }

        readinglistEntry.read = req.body.read
        await readinglistEntry.save()
        res.json(readinglistEntry)
    } catch (error) {
        next(error)
    }
})


module.exports = router
