import express, { Router, Request, Response } from "express";
import dotenv from "dotenv"
import axios from "axios"
import morgan from "morgan";
import db from "../database/db";
import { hashPassowrd } from "../utils/reigstration.services";
import Specialists from "../database/schemas/sp"
import { Specialist } from "../../types/users";


const router = express.Router();
router.use(express.json());
router.use(morgan("tiny"));
router.use(express.json());

router.post("/account", async (req, res) => {

    const { email, password, mobile }: Specialist = req.body;

    if (!email || !password || !mobile) {
        res.status(400).json({ "error": true, "message": "Request body incomplete, email, password and mobile are required" });
        return;
    }

    const users = await db.isUser(email, mobile);
    if (users) {
        res.status(400).json({ "error": true, "message": "User already exists" });
        return;
    }
    
    try{
        const hash = await hashPassowrd(password);
        const user = {
            email: email,
            password: hash,
            mobile: mobile
        }
        db.insert(Specialists, user )
        res.status(200);
        res.send({
            "Message": `User with email ${email} has been successfully created`
        })
    }catch(err: any){
        console.log(err.message); 
    }     

})

router.post("/clinic-details", (req, res) => {
   
    const { clinicName, clinicCountry, clinicSuburb, clinicOnCallNumber } = req.body;

   
    if (!clinicName || !clinicCountry || !clinicSuburb || !clinicOnCallNumber) {
        return res.status(400).json({ error: "Invalid clinic details" });
    }

  
    return res.status(200).json({ message: "Clinic details received successfully" });
});

export default router;

