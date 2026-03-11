import mongoose from "mongoose"


export const connectDB = async ()=>{
    try{
        const { MONGO_URI} = process.env;
        if(!MONGO_URI) throw new Error("MONGO_URI is not set");

        const connec =  await mongoose.connect(process.env.MONGO_URI);
        console.log("mongodb connected:",connec.connection.host);
    }
    catch(e){
        console.log("Error connecting to MongoDB: ",e);
        process.exit(1); // 1 status code mean failed, 0 means successful
    }
}
