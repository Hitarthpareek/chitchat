import express from "express";
import  User from "../models/User.js"
import bcrypt from "bcryptjs"
import { generateToken } from "../lib/utils.js";
import {ENV} from "../lib/env.js"
import { sendWelcomeEmail } from "../emails/emailHandlers.js";

export const signup = async (req, res) => {
  const {fullName, email, password} = req.body;

  try{
        if(!fullName || !email || !password){
            return  res.status(400).json({message:"All fields are required"});
        }
        if(password.length <6){
            return res.status(400).json({message:"password must be atleast 6 char"});
        }

        // check if email's valid :
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            return res.status(400).json({message:"Invalid email format"});
        } 

        //
        const user = await User.findOne({email});
        if(user)return res.status(400).json({message:"Email already exists"})

        //  1234567 -> encrypt into 434j3nn43@df
        const salt = await bcrypt.genSalt(10);
        const hashedPassword= await bcrypt.hash(password,salt);

        const newUser = new User({
            fullName,
            email,
            password:hashedPassword
        })
        if(newUser){
            // after cr suggestion
           const savedUser = await newUser.save();
           generateToken(savedUser._id,res);
// 201 means new created 
            res.status(201).json({
                _id:newUser._id,
                fullName:newUser.fullName,
                email:newUser.email,
                profilePic:newUser.profilePic,

            });

         // send a welcome email to user  
         try {
        await sendWelcomeEmail(savedUser.email, savedUser.fullName, ENV.CLIENT_URL);
      }  catch (error) {
        console.error("Failed to send welcome email:", error);
      } 
        }else{
            res.status(404).json({message:"Invalid user data"});
        }
        

  }catch(e){
    console.log("error in signup controller:", e);
    res.status(500).json({message:"Internal Server Error"});
  }
};