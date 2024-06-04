var Airtable = require('airtable');
require('dotenv').config();
const WA = require('./wati');
const us = require('./airtable_methods');
const { info } = require('pdfkit');
const cert = require('./certificate')


let base_student = new Airtable({ apiKey: process.env.airtable_api }).base(process.env.student_base);
let course_base = new Airtable({ apiKey: process.env.airtable_api }).base(process.env.course_base);


async function outro_flow(cDay, number) {

    let course_tn = await us.findTable(number).then().catch(e => console.log(e))

    let id = await us.getID(number).then().catch(e => console.log(e))

    const records = await course_base(course_tn).select({
        filterByFormula: "({Day} = " + cDay + ")",
        view: "Grid view",

    }).all();

    records.forEach(async function (record) {
        console.log(course_tn);

        // let day_topic = record.get('Day Topic');
        // let text = record.get('Module 1 Text');
        // let int_title = record.get('Module 1 iBody')
        // let int_btn = record.get('Module 1 iButtons')

        let day_topic = `Thank you for taking ${course_tn}! We hope you learnt some new things with us.`
        let text = `You have successfully demonstrated your ability to understand and learn about ${course_tn}.

Congratulations!`

        let int_title = `Would you like to receive a certificate confirming the completion of your course?`
        let int_btn = `Yes!\nNo, I'll pass`
        console.log("Updating last message of outroflow")
        us.updateField(id, "Last_Msg", day_topic)

        // console.log(int_title, text, day_topic)
        WA.sendText(day_topic, number)

        setTimeout(async () => {
            WA.sendText(text, number)
        }, 1000)

        let options = int_btn.split("\n").filter(n => n)
        // console.log(options)

        let data = []
        for (const row of options) {
            data.push({
                text: row
            })
        }

        setTimeout(() => {
            console.log("2. Updating last message of outroflow")
            us.updateField(id, "Last_Msg", int_title)

            WA.sendDynamicInteractiveMsg(data, int_title, number)

        }, 2200)
    })
}



async function outro_response(value, number) {
    //var course_tn = await us.findTable(number)
    console.log(value, number)

    const records = await base_student("Student").select({
        filterByFormula: "({Phone} =" + number + ")",
        view: "Grid view",

    }).all(
    ); records.forEach(async function (record) {

        let id = record.id
        let currentModule = 1
        let currentDay = 13
        // let currentModule = record.get("Next Module")
        // let currentDay = record.get("Next Day")

        console.log("outro currentModule ", currentModule)

        let interactive_msg = await us.findInteractive(currentDay, currentModule, number).then().catch(e => console.error("Error in store_intResponse ", e))

        let existingValues = await us.findRecord(id)
        let body = interactive_msg[0]

        if (existingValues == undefined) {
            existingValues = ""
            newValues = value
        }
        else {
            newValues = value
        }


        us.updateField(id, "Completion_Certificate", newValues).then(async () => {
            console.log("2. New Feedback recorded")

            console.log(body, body == 'Would you like to receive a certification confirming you completed the course? ')
            if (value == "Yes!") {
                // console.log(body)

                let nm = currentModule + 1
                us.updateField(id, "Day Completed", 12)
                us.updateField(id, "Next Day", 13)
                console.log(currentModule, nm)

                await updateField(id, currentModule).then(async (v) => {
                    if (v == "Success") {
                        console.log("update ", v)

                        console.log("current day, currentModule in outro_response 2", currentDay, currentModule)

                        sendNameQues(currentDay, nm, number)
                    }

                }
                ).catch(errors => console.log(errors))



            }
            else if (value == "No") {
                setTimeout(() => {

                    console.log("3. Updating last message of outroflow")
                    us.updateField(id, "Last_Msg", "If you want to learn more about *Ekatra*")

                    WA.sendText(`If you want to learn more about *Ekatra*, \nVisit _https://www.ekatra.one_.`, number)
                }, 1000)


                us.updateField(id, "Day Completed", currentDay)
                us.updateField(id, "Next Day", currentDay + 1)
            }
        })

    })
}

async function updateField(id, currentModule) {
    return new Promise(function (resolve, reject) {
        try {
            let nm = currentModule + 1

            us.updateField(id, "Next Module", nm)
            us.updateField(id, "Module Completed", currentModule)
            resolve("Success")
        }
        catch (e) { console.log(e) }
    })
}
async function sendNameQues(currentDay, module_No, number) {
    var course_tn = await us.findTable(number)
    let id = await us.getID(number).then().catch(e => console.log(e))

    const records = await course_base(course_tn).select({
        filterByFormula: "({Day} =" + currentDay + ")",
        view: "Grid view",

    }).all(
    );
    records.forEach(function (record) {
        let module_ques = record.get("Module " + module_No + " Question")

        console.log("Executing Name Question ")
        console.log("module_No ", module_No)

        // setTimeout(() => {
        console.log("4. Updating last message of outroflow")
        us.updateField(id, "Last_Msg", module_ques)

        WA.sendText(module_ques, number)

        // }, 100)
        setTimeout(() => {
            WA.sendText("⬇⁣", number)

        }, 700)
    })
}

async function store_quesName(number, value) {
    //var course_tn = await us.findTable(number)
    console.log("Executing Name ")

    const records = await base_student("Student").select({
        filterByFormula: "({Phone} =" + number + ")",
        view: "Grid view",

    }).all(
    ); records.forEach(async function (record) {

        let id = record.id
        let last_msg = await us.findLastMsg(number).then().catch(e => console.log("last msg error " + e))

        let currentModule = record.get("Next Module")
        let currentDay = record.get("Next Day")

        console.log("currentDay, currentModule in store_quesName ", currentDay, currentModule)

        let ques = await us.findQuestion(currentDay, currentModule, number).then().catch(e => console.error("Error in store_quesResponse ", e))

        console.log("last_msg ", ques, last_msg)

        if (last_msg == ques) {


            let existingValues = await us.findQuesRecord(id)
            console.log("Existing Record ", existingValues)

            if (ques != undefined) {
                if (existingValues == undefined) {
                    console.log("existingValues")

                    existingValues = ""
                    newValues = `${value}`

                }
                else {
                    console.log("existingValues")
                    newValues = `${value}`

                }


                us.updateField(id, "Full_Name", newValues).then(async () => {
                    console.log("3. New Name  recorded")

                    let nm = currentModule + 1

                    await updateField(id, currentModule).then(async (v) => {
                        if (v == "Success") {
                            console.log("update ", v)

                            console.log("current day, currentModule in outro_response 2", currentDay, currentModule)

                            await sendEmailQues(currentDay, nm, number)
                        }
                    }
                    ).catch(errors => console.log(errors))
                })

            }
        }
        else {
            console.log("No Name")
        }
    })
}

async function sendEmailQues(currentDay, module_No, number) {
    var course_tn = await us.findTable(number)
    let id = await us.getID(number).then().catch(e => console.log(e))

    const records = await course_base(course_tn).select({
        filterByFormula: "({Day} =" + currentDay + ")",
        view: "Grid view",

    }).all(
    );
    records.forEach(function (record) {
        let module_ques = record.get("Module " + module_No + " Question")

        console.log("Executing Email Question ")

        console.log("5. Updating last message of outroflow")
        us.updateField(id, "Last_Msg", module_ques)


        WA.sendText(module_ques, number)

        // }, 2000)
        setTimeout(() => {
            WA.sendText("⬇⁣", number)

        }, 700)
    })
}

async function store_quesEmail(number, value) {
    //var course_tn = await us.findTable(number)
    console.log("Executing Email ")
    const records = await base_student("Student").select({
        filterByFormula: "({Phone} =" + number + ")",
        view: "Grid view",

    }).all(
    ); records.forEach(async function (record) {

        let id = record.id
        let last_msg = await us.findLastMsg(number).then().catch(e => console.log("last msg error " + e))

        let full_name = record.get("Full_Name")
        let course = record.get("Topic")
        let currentModule = record.get("Next Module")
        let currentDay = record.get("Next Day")


        let ques = await us.findQuestion(currentDay, currentModule, number).then().catch(e => console.error("Error in store_quesResponse ", e))

        console.log("last_msg ", ques, last_msg)

        if (last_msg == ques) {


            let existingValues = await us.findQuesRecord(id)
            console.log("Existing Record ", existingValues)

            if (ques != undefined) {
                if (existingValues == undefined) {
                    console.log("existingValues")

                    existingValues = ""
                    newValues = `${value}`

                }
                else {
                    console.log("existingValues")
                    newValues = `${value}`

                }

                us.updateField(id, "Email", newValues).then(async () => {
                    console.log("3. New Email recorded")

                    await updateField(id, currentModule).then(async (v) => {
                        if (v == "Success") {


                            console.log("update ", v)

                            console.log("current day, currentModule in outro_response 2", currentDay, currentModule)

                            us.updateField(id, "Day Completed", currentDay)
                            us.updateField(id, "Next Day", currentDay + 1)


                            WA.sendText(`Your certificate is on the way!`, number)
                            setTimeout(() => {
                                console.log("6. Updating last message of outroflow")
                                us.updateField(id, "Last_Msg", "If you want to learn more about *Ekatra*")

                                WA.sendText(`If you want to learn more about *Ekatra*, \nVisit _https://www.ekatra.one_.
                        `, number)
                            })

                            setTimeout(async () => {
                                console.log(`Sending certificate to ${full_name}`)
                                const certificate_pdf = await cert.createCertificate(full_name)

                                console.log("7. Updating last message of outroflow")
                                us.updateField(id, "Last_Msg", "document")

                                await WA.sendMedia(certificate_pdf, `${full_name}_certificate.pdf`, number)
                            }, 5000)


                        }

                    }).catch(errors => console.log(errors))


                })

            }

        }
        else {
            console.log("No email")
        }
    })
}


module.exports = {
    outro_flow,
    outro_response,
    store_quesName,
    store_quesEmail,
    sendEmailQues
}
