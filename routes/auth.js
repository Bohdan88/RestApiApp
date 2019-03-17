const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt-nodejs');

const models = require('../models');

// POST is registration
router.post('/register', (req, res) => {
    const email = req.body.email;
    const login = req.body.login;
    const password = req.body.password;
    const passwordConfirm = req.body.passwordConfirm;

    console.log(req.body)


    if (!login || !password || !passwordConfirm || !email) {
        const fields = [];
        if (!login) fields.push('login')
        if (!password) fields.push('password')

        if (!passwordConfirm) fields.push('passwordConfirm')

        res.json({
            ok: false,
            error: 'Все поля должны быть заполнены!',
            fields
        });


    }  else if (!/^[a-zA-Z0-9]+$/.test(login)) {
        res.json({
            ok: false,
            error: 'Логин может быть только английским',
            fields: ['login']
        });
    } else if ( password.length < 5) {
        res.json({
            ok: false,
            error: 'Пассик Должен быть польше пяти символов',
            fields: ['password']
        });
    }





    else if (login.length < 3 || login.length > 16) {
        res.json({
            ok: false,
            error: 'Длина логина от 3 до 16 символов!',
            fields: ['login']
        });
    } else if (password !== passwordConfirm) {
        res.json({
            ok: false,
            error: 'Пароли не совпадают!',
            fields: ['password', 'passwordConfirm']
        });
    } else {
        models.User.findOne({
            login
        }).then(user => {
            if (!user) {
                bcrypt.hash(password, null, null , (err,hash) =>{
                    models.User.create({
                        email,
                        login,
                        password: hash
                    }).then(user => {
                        req.session.userId = user.id;
                        req.session.userLogin = user.login;
                            res.json({
                                ok:true
                            });

                        }).catch(err => {
                            console.log(err);
                            res.json({
                                ok:false,
                                error: 'Ошибка, попробуйте позже'
                            });
                        });
                    });

            } else {
                    res.json({
                        ok: false,
                        error:  "Имя занято!",
                        fields: ['login']
                    })
                }
        })


    }


});

// post is login



router.post('/login', (req, res) => {
    const login = req.body.login;
    const password = req.body.password;

    console.log(req.body)


    if (!login || !password) {
        const fields = [];
        if (!login) fields.push('login')
        if (!password) fields.push('password')


        res.json({
            ok: false,
            error: 'Все поля должны быть заполнены!',
            fields
        });


    } else {
        models.User.findOne({
            login

        }).then(user => {
            if (!user) {
              res.json({
                  ok: false ,
                  error: 'Логин и пароль неверны!',
                  fields: ['login', 'password']

              })
            } else {
                // Load hash from your password DB.
                bcrypt.compare(password, user.password, function(err, result) {
                    // res == true
                    if (!result) {
                        res.json({
                            ok: false ,
                            error: 'Логин и пароль неверны!',
                            fields: ['login', 'password']

                        })
                    } else {
                        //
                        req.session.userId = user.id;
                        req.session.userLogin = user.login;
                        res.json({
                            ok:true
                        })

                    }
                });
            }
        })
            .catch(err=>{
                console.log(err);
                res.json({
                    ok:false,
                    error:'Ошибка , попробуйте позже'
                })
            })

    }
    console.log(req.body)
});

router.get('/logout', (req,res)=>{
    if ( req.session) {
        req.session.destroy(() => {
            res.redirect('/')
        });
    } else {
        res.redirect('/')
    }
});

module.exports = router;