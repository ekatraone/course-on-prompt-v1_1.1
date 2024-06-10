// external packages
const express = require('express');
require('dotenv').config("./env");
const test = require('./test');
const cors = require('cors');
const cert = require('./certificate')
const course_approval = require('./course_status');

const WA = require('./wati');
const airtable = require("./airtable_methods");
const outro = require('./outroflow');
// const cert = require('./certificate')
const mongoose = require("mongoose");
const mongodb = require('./mongodb');
const cop = require('./index');
const webApp = express();

webApp.use(express.json());
webApp.use(cors());

// MONGO_URL = `mongodb+srv://${process.env.MONGOUSER}:${process.env.MONGOPASSWORD}@cop-one.fe2npes.mongodb.net/?retryWrites=true&w=majority`
MONGO_URL = `mongodb://localhost:27017`



webApp.post('/cop', async (req, res) => {
    try {
      if (Object.keys(req.body).length !== 0) {
        //console.log("Request ", req.body);
  
        const senderID = req.body.waId;
        const keyword = req.body.text;
  
        const does_student_exist = await airtable.find_student_record(senderID);
        if (does_student_exist?.length !== 0) {
          const course = await airtable.findTable(senderID);
          const last_msg = await airtable.findLastMsg(senderID);
          const id = await airtable.getID(senderID);
          const currentDay = await airtable.findField("Next Day", senderID);
          const current_module = await airtable.findField("Next Module", senderID);
  
          if (course !== "Web 3" && course !== "Entrepreneurship" && course !== "Financial Literacy") {
            if (keyword === "Start Day") {
              await test.sendModuleContent(senderID);
            } else if (["Yes, Next", "Start now", "Next.", "Next Step", "Step by step"].includes(keyword)) {
              await test.markModuleComplete(senderID);
            }
  
            if (last_msg !== undefined) {
              if (last_msg.includes("Would you like to receive a certificate confirming the completion of your course?") || last_msg === "document") {
                //console.log("Updating certificate keyword");
                //console.log("last_msg 1 ", last_msg, keyword);
  
                if (keyword === "Yes!") {
                  const name = await airtable.findField("Name", senderID);
                  //console.log(`Sending certificate to ${name}`);
                  const certificate_pdf = await cert.createCertificate(name, course);
  
                  WA.sendText(`Kudos for the efforts you have made.\nBest wishes fellow learner, ${name}`, senderID);
                  airtable.updateField(id, "Day Completed", currentDay);
                  airtable.updateField(id, "Next Day", currentDay + 1);
                  airtable.updateField(id, "Last_Msg", "document");
  
                  setTimeout(async () => {
                    await WA.sendMedia(certificate_pdf, `${name}_certificate.pdf`, senderID);
                  }, 3000);
                } else if (keyword === "No, I'll pass") {
                  airtable.updateField(id, "Last_Msg", "document");
                  airtable.updateField(id, "Day Completed", currentDay);
                  airtable.updateField(id, "Next Day", currentDay + 1);
                  WA.sendText(`If you want to learn more about *Ekatra*,\nVisit _https://www.ekatra.one_`, senderID);
                }
              }
            }
          }
  
          return res.status(200).send("Success");
        } else {
          //console.log("Response");
          return res.status(200).send("Success");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).send("Error");
    }
  });
  
webApp.get("/ping", async (req, res) => {
    //console.log("Pinging whatsapp server")
    course_approval.course_approval()
    //console.log("OK")
    res.send("ok")
})

webApp.get("/", async (req, res) => {
    res.send("Working fine");
})

webApp.get("/health", async(req, res) =>{
    res.send(200);
})

var port = 8080;

webApp.listen(port, '0.0.0.0', () => {
    //console.log(`Server is running on http://0.0.0.0:${port}`);
});
