const Users = require('../models/userModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


const userController = {
    register: async(req,res)=>{
        try{
            const {name,email,password} = req.body;

            const user = await Users.findOne({email})
            if(user) return res.status(400).json({msg:"Email already registered"})

            if(password.length<6)
                return res.status(400).json({msg:"Password must be atleast 6 characters"})

            

            //password encryption
            const passwordHash = await bcrypt.hash(password,10)


            const newUser = new Users({
                name,email,password:passwordHash
            })
            //res.json({msg: "registered successfully"})

            //save in mongodb
            await newUser.save();

            //create jwt to authentivate user
            const accessToken = createAccessToken({id:newUser._id})
            const refreshToken = createRefreshToken({id:newUser._id})

            res.cookie('refreshToken', refreshToken,{
                httpOnly:true,
                path:'/user/refresh_token'
            })
            res.json({accessToken})
        }
        catch(err){
            return res.status(500).json({msg:err.message})
        }
    },
    refreshToken: async(req,res)=>{
        try{
            const rf_token = req.cookies.refreshToken;
        if(!rf_token) return res.status(400).json({msg:"Please login or registerrr"})

        jwt.verify(rf_token,process.env.REFRESH_TOKEN_SECRET,(err,user)=>{
            if(err) return res.status(400).json({msg:"Please login or register"})
            const accessToken = createAccessToken({id:user.id})
            res.json({user,accessToken})
        })
        }
        catch(err){
            return res.status(500).json({msg:err.message})
        }
        
    },
    login: async(req,res)=>{
        try{
            const {email,password} = req.body;

            const user = await Users.findOne({email})
            if(!user) return res.status(400).json({msg:"User does not exist"})
            const isMatch = await bcrypt.compare(password, user.password)
            if(!isMatch) return res.status(400).json({msg:"Incorrect password"})
            const accessToken = createAccessToken({id:user._id})
            const refreshToken = createRefreshToken({id:user._id})

            res.cookie('refreshtoken', refreshToken,{
                httpOnly:true,
                path:'/user/refresh_token'
            })

            res.json({accessToken})
        }catch(err){
            return res.status(500).json({msg:err.message})
        }
    },
    logout: async(req,res)=>{
        try{
            res.clearCookie('refreshtoken', {path:'/user/refresh_token'})
            return res.json({msg:"Log out"})
        }catch(err){
            res.json(err)
        }
    }
} 

const createAccessToken = (payload)=>{
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1d'})
}
const createRefreshToken = (payload)=>{
    return jwt.sign(payload,process.env.REFRESH_TOKEN_SECRET,{expiresIn:'7d'})
}


module.exports = userController