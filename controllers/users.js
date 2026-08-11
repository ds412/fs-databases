const router = require('express').Router()

const { User, Blog } = require('../models')

// middleware to find a user by his username, stores found user in req.user
const userFinder = async (req, res, next) => {
    req.user = await User.findOne({
        where: { username: req.params.username }
    })
    if (!req.user) {
        return res.status(404).end()
    }
    next()
}


router.get('/', async (req, res) => {
    const users = await User.findAll({
        include: {
            model: Blog,
            attributes: { exclude: ['userId'] }
        }
    })
    res.json(users)
})

router.post('/', async (req, res, next) => {
    try {
        // password is ignored for now
        const { username, name } = req.body
        const user = await User.create({ username, name })
        res.json(user)
    } catch (error) {
        next(error)
    }
})


router.put('/:username', userFinder, async (req, res, next) => {
    try {
        req.user.name = req.body.name
        await req.user.save()
        res.json(req.user)
    } catch (error) {
        next(error)
    }
})

module.exports = router
