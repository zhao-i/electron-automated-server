const express = require('express')
const path = require('path')
const jwt = require('jsonwebtoken')
const mysql = require('mysql')
// const pbkdf2 = require('pbkdf2')
const { SHA256, enc } = require('crypto-js')
const fs = require('fs')

const secret = SHA256('PrivateKeyForNodeJavaScriptServerBy202201010000').toString(enc.Base64);
//依据配置文件的字符串'key', 转换为sha256, 再转换为一个'base64'编码的密钥, 提供给token

/* key , 盐, 迭代次数, 字节长度, 算法, 回调
pbkdf2.pbkdf2('PrivateKeyForNodeServerBy20221111', '盐', 1000, 64, 'sha256', (err, key) => { }) */
const app = express()
//设置跨域
app.all('*', function (req, res, next) {
    console.log('来源: ' + req.headers.origin)
    // res.header('Access-Control-Allow-Origin', 'http://www.zhaozone.link');
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.header('Access-Control-Allow-Methods', 'GET,POST');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});
app.use('/', express.static(path.join(__dirname, 'dist')))
app.use(express.json())//解析json
/* app.get('/', (req, res) => {
    res.send('hello world')
}) */
app.post('/login', function (req, res) {
    console.log('一条post请求')
    const user = req.body//取得用户post请求携带的数据

    jwt.verify(req.headers.authorization, secret, { subject: 'loginAPI', audience: 'app.easygames.user' }, (err, decode) => {
        if (err) {
            console.log('token验证失败')
            const connection = mysql.createConnection({
                host: 'localhost',
                user: 'root',
                password: 'admin',
                database: 'easy_games',
                port: 3306
            })
            connection.connect()
            const sql = `SELECT password,uid FROM user WHERE phone = "${user.phone}"`
            connection.query(sql, (error, result, fields) => {
                if (error) { console.log('数据库查询出错') }
                else if (result.length === 1) {
                    console.log('查询到一条相关数据')
                    if (result[0].password === user.password) {
                        console.log('身份验证成功')
                        /* jwt.sign({ phone: user.phone, uid: result[0].uid },
                            secret,
                            { algorithm: 'HS256', expiresIn: '7d', subject: 'loginAPI', audience: 'app.easygames.user', },
                            (e, token) => {
                                if (e) throw e;
                                res.json({ key: token, data: { name: 'some data' } }).end()
                            }
                        ) */
                        res.json({ data: { name: 'some data' } }).end() //此行为test 
                    } else {
                        console.log('身份验证失败')
                        res.sendStatus(401)
                    }
                } else {
                    console.log('未查询到任何关联数据')
                    res.sendStatus(401)
                }

                connection.end();

            })
        } else {
            console.log('token验证成功')
            /* const hours = (decode.exp - Date.now() / 1000) / 3600 //有效期 (单位:小时)
            if (hours < 150) {
                jwt.sign({ phone: 'database.mail', uid: 'database.uid' },
                    secret,
                    { algorithm: 'HS256', expiresIn: '7d', subject: 'loginAPI', audience: 'app.easygames.user', },
                    (e, token) => {
                        if (e) throw e;
                        res.json({ key: token, data: { name: 'some data' } }).end()
                    }
                )
            } else  */
            {
                res.json({ data: { name: 'some data' } }).end()
            }
        }

    })

})
/* app.put('/user', function (req, res) {
    res.send('Got a PUT request at /user')
})
app.delete('/user', function (req, res) {
    res.send('Got a DELETE request at /user')
}) */
app.listen(80, () => { })

function storePicture(name, type, data) {
    fs.writeFile(`./userdata/photo/${name}.${type}`, data, (e, s) => {
        if (e) throw e;
        console.log(s)
    })
}



