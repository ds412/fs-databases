const jwt = require('jsonwebtoken')
const router = require('express').Router()

const { SECRET } = require('../util/config')
const { User, Session } = require('../models')

router.post('/', async (req, res) => {
    const body = req.body

    const user = await User.findOne({
        where: {
            username: body.username
        }
    })

    // for now, accept any password
    if (!user) {
        return res.status(401).json({
            error: 'invalid username or password'
        })
    }

    // disabled user can't login
    if (user.disabled) {
        return res.status(401).json({
            error: 'your account has been disabled, please contact an administrator'
        })
    }

    const userForToken = {
        username: user.username,
        id: user.id,
    }

    const token = jwt.sign(userForToken, SECRET)

    // create a new session for this user
    await Session.create({ userId: user.id, token })

    res
        .status(200)
        .send({ token, username: user.username, name: user.name })
})

module.exports = router
