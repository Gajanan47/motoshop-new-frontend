import {userAPI} from "./axios"

export const sendQueryToGemini = async (userText) =>{
   const res = await userAPI.post("/chatbot", { message: userText })
   return res.data.response
};
