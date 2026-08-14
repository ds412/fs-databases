const router = require('express').Router()

const { Blog, User } = require('../models')
const { tokenExtractor, sessionCheck } = require('../util/middleware')

// MIDDLEWARE
const blogFinder = async (req, res, next) => {
    req.blog = await Blog.findByPk(req.params.id)
    if (!req.blog) {
        return res.status(404).end()
    }
    next()
}

// ROUTES
// get all blogs
router.get('/', async (req, res) => {
    const blogs = await Blog.findAll()
    res.json(blogs)
})

// get blog with given id
router.get('/:id', blogFinder, async (req, res) => {
    res.json(req.blog)
})

// post a new blog, requires valid token, active session and non-disabled user
router.post('/', tokenExtractor, sessionCheck, async (req, res, next) => {
    try {
        const user = await User.findByPk(req.decodedToken.id)
        const blog = await Blog.create({ ...req.body, userId: user.id })
        res.json(blog)
    } catch (error) {
        next(error)
    }
})

// change likes of the blog
router.put('/:id', blogFinder, async (req, res, next) => {
    try {
        req.blog.likes = req.body.likes
        await req.blog.save()
        res.json(req.blog)
    } catch (error) {
        next(error)
    }
})

// delete this blog, requires valid token, active session and non-disabled user
router.delete('/:id', tokenExtractor, sessionCheck, blogFinder, async (req, res) => {
    if (req.blog.userId !== req.decodedToken.id) {
        return res.status(401).json({ error: 'only the creator can delete a blog' })
    }
    await req.blog.destroy()
    res.status(204).end()
})

module.exports = router
