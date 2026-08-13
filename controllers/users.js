const router = require('express').Router()

const { User, Blog, ReadingList } = require('../models')

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

router.get('/:id', async (req, res) => {
    // allow filtering on the 'read' column for the blogs in the readinglist of this user
    const isReadFilter = {}
    if (req.query.read !== undefined) {
        isReadFilter.read = req.query.read === 'true'
    }

    const user = await User.findByPk(req.params.id, {
        attributes: ['name', 'username'],
        include: {
            // get blogs that are in readinglist associated with this user (via join table)
            model: Blog,
            as: 'readings',
            attributes: { exclude: ['userId'] },
            // get id and read status from join table readinglists, filtering on read status
            through: {
                attributes: ['id', 'read'],
                where: isReadFilter
            }
        }
    })

    if (user) {
        res.json(user)
    } else {
        res.status(404).end()
    }
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
