const router = require('express').Router()
const jwt = require('jsonwebtoken')


const { Blog, User } = require('../models')
const { SECRET } = require('../util/config')

// middleware
const tokenExtractor = (req, res, next) => {
    const authorization = req.get('authorization')
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        try {
            req.decodedToken = jwt.verify(authorization.substring(7), SECRET)
        } catch {
            return res.status(401).json({ error: 'token invalid' })
        }
    } else {
        return res.status(401).json({ error: 'token missing' })
    }
    next()
}

const blogFinder = async (req, res, next) => {
    req.blog = await Blog.findByPk(req.params.id)
    if (!req.blog) {
        return res.status(404).end()
    }
    next()
}

// routes
router.get('/', async (req, res) => {
    const blogs = await Blog.findAll({
        attributes: { exclude: ['userId'] },
        include: {
            model: User,
            attributes: ['name']
        }
    })
    res.json(blogs)
})

router.get('/:id', blogFinder, async (req, res) => {
    res.json(req.blog)
})

router.post('/', tokenExtractor, async (req, res) => {
    try {
        const user = await User.findByPk(req.decodedToken.id)
        const blog = await Blog.create({ ...req.body, userId: user.id })
        res.json(blog)
    } catch (error) {
        next(error)
    }
})

router.put('/:id', blogFinder, async (req, res, next) => {
    try {
        req.blog.likes = req.body.likes
        await req.blog.save()
        res.json(req.blog)
    }
    catch (error) {
        next(error)
    }
})

router.delete('/:id', tokenExtractor, blogFinder, async (req, res) => {
    if (req.blog.userId !== req.decodedToken.id) {
        return res.status(401).json({ error: 'only the creator can delete a blog' })
    }
    await req.blog.destroy()
    res.status(204).end()
})

module.exports = router
