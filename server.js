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
    // console.log(Object.keys(req.body).length === 0)

    if (Object.keys(req.body).length !== 0) {
        console.log("Request ", req.body);

        let senderID = req.body.waId;
        let name = req.body.senderName

        let keyword = req.body.text

        let does_course_exist = await airtable.find_alfred_course_record(senderID).then().catch(e => console.error("Error finding Course " + e));


        let does_student_exist = await airtable.find_student_record(senderID).then().catch(e => console.log("Find student record error " + e))
        if (does_student_exist?.length != 0) {

            let course = await airtable.findTable(senderID).then().catch(e => console.log("Fidn Table error" + e))
            let last_msg = await airtable.findLastMsg(senderID).then().catch(e => console.log("Find last msg error " + e))
            let id = await airtable.getID(senderID).then().catch(e => console.log("Find ID error " + e))
            let currentDay = await airtable.findField("Next Day", senderID,).then().catch(e => console.log("Find current day error " + e))

            let current_module = await airtable.findField("Next Module", senderID).then().catch(e => console.log("current day error" + e))


            if (course != "Web 3" && course != "Entrepreneurship" && course != "Financial Literacy") {
                if (keyword == "Start Day") {

                    test.sendModuleContent(senderID).then().catch(e => console.log("Finish start template error " + e))

                }


                else if (keyword == "Yes, Next" || keyword == "Start now" || keyword == "Next." || keyword == "Next Step" || keyword == "Step by step") {

                    test.markModuleComplete(senderID).then().catch(e => console.info("Finish module template error " + e))
                }


                if (last_msg != undefined) {
                    if (last_msg.includes("Would you like to receive a certificate confirming the completion of your course?") || last_msg == "document") {

                        console.log("Updating certificate keyword ")

                        console.log("last_msg 1 ", last_msg, keyword)

                        if (keyword == "Yes!") {
                            let name = await airtable.findField("Name", senderID).then().catch(e => console.log("Find name error " + e))

                            console.log(`Sending certificate to ${name}`)
                            const certificate_pdf = await cert.createCertificate(name, course)

                            WA.sendText(`Kudos for the efforts you have made. 
Best wishes fellow learner, ${name}`, senderID)
                            airtable.updateField(id, "Day Completed", currentDay)
                            airtable.updateField(id, "Next Day", currentDay + 1)

                            airtable.updateField(id, "Last_Msg", "document")

                            setTimeout(async () => {
                                await WA.sendMedia(certificate_pdf, `${name}_certificate.pdf`, senderID)
                            }, 3000)

                        }
                        else if (keyword == "No, I'll pass") {

                            airtable.updateField(id, "Last_Msg", "document")

                            airtable.updateField(id, "Day Completed", currentDay)
                            airtable.updateField(id, "Next Day", currentDay + 1)

                            WA.sendText(`If you want to learn more about *Ekatra*, \nVisit _https://www.ekatra.one_`, senderID)


                        }

                    }
                }

            }

            return res.status(200).send("Success");
        }

        else {
            console.log("Response")
            return res.status(200).send("Success");
        }
    }
})

webApp.get("/ping", async (req, res) => {
    console.log("Pinging whatsapp server")
    course_approval.course_approval()
    console.log("OK")
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
    console.log(`Server is running on http://0.0.0.0:${port}`);
});
