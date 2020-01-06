import './public/css/iconfont.css'
import axios from 'axios'
let address = '../static/config.json'
console.log('1', address)
axios.get(address).then(res => {
    console.log(res.data)
    // console.log(JSON.parse(res.data))
    let a = res.data.age
    console.log(a[0])
})
