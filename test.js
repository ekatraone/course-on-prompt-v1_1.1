let Airtable = require('airtable');
require('dotenv').config();
const WA = require('./wati');
const us = require('./airtable_methods');
// const sendContent = require('./image');
const outro = require('./outroflow');
// const { info } = require('pdfkit');

let base = new Airtable({ apiKey: process.env.airtable_api }).base(process.env.student_base);

let course_base = new Airtable({ apiKey: process.env.airtable_api }).base(process.env.course_base);

//Update Day completed field and next day field in Student's table for the given phone number 
//Called on Finish day keyword

async function markDayComplete(number) {
    const records_Student = await base('Student').select({
        filterByFormula: "({Phone} =" + number + ")",
        view: "Grid view",

    }).all();

    let total_days = 0
    total_days = await us.totalDays(number)

    records_Student.forEach(async function (record) {
        console.log("Entered markDayComplete")
        let name = record.get("Name")
        let course = record.get("Topic")
        let id = record.id
        let comp_day = Number(record.get("Next Day"))
        let nextDay = comp_day + 1

        if (comp_day <= total_days) {

            try {
                us.updateField(id, "Next Day", nextDay).then()
                    .catch(e => console.log("1", e))

                us.updateField(id, "Day Completed", comp_day).then()
                    .catch(e => console.log("2", e))

                console.log("Complete Day " + comp_day, total_days)


                //Reset module numbers
                const next_mod = 1
                const module_completed = 0
                us.updateField(id, "Next Module", next_mod).then()
                    .catch(e => console.log("3", e))

                us.updateField(id, "Module Completed", module_completed).then()
                    .catch(e => console.log("4", e))

                console.log("Next day is ", nextDay, "Total days are ", total_days, nextDay == total_days + 1)
                if (nextDay == total_days + 1) {

                    console.log("Executing Outro for ", name, nextDay)
                    setTimeout(async () => {
                        outro.outro_flow(total_days, number)
                    }, 4000)

                }


            }
            catch (e) {
                console.log("Error while updating complete day " + e)
            }
        }



    });
}

// Find  current day content and called on in sendContent method
async function findDay(currentDay, number) {
    let course_tn = await us.findTable(number)
    const records = await course_base(course_tn).select({
        filterByFormula: "({Day} =" + currentDay + ")",
        view: "Grid view",

    }).all();
    records.forEach(async function (record) {
        console.log("Entered findDay module")
        let day = record.get("Day")
        let id = await us.getID(number).then().catch(e => console.log(e))

        total_days = await us.totalDays(number)
        if (currentDay == total_days) {
            const hTxt = `Congratulations on completing Day ${day}!\n\nYour course is complete.🎊 `
            bTxt = `_powered by ekatra.one_`
            const btnTxt = "Finish Day " + day

            console.log("5. Updating last message")
            us.updateField(id, "Last_Msg", hTxt)

            WA.sendText(`${hTxt} \n${bTxt}`, number)
            markDayComplete(number).then().catch(e => console.log("Mark day error 1 : ", e))

            if (course_tn == "Web 3") {
                setTimeout(() => {
                    WA.sendText(`Would you like another learner to join you? Invite your friends to take the course! 
                
https://bit.ly/Web3_Referral`, number)
                }, 5000)
            }
            else if (course_tn == "Financial Literacy") {
                setTimeout(() => {
                    WA.sendText(`Would you like another learner to join you? Invite your friends to take the course! 
                
https://bit.ly/Financial_Literacy_Referral`, number)
                }, 5000)
            }

            // WA.sendInteractiveButtonsMessage(hTxt, bTxt, btnTxt, number)
            // }

        }
        else {

            let next_day = day + 1
            const hTxt = `Congratulations on completing Day ${day}! `
            const bTxt = `You will receive Day ${next_day} modules tomorrow. \n\n_powered by ekatra.one_`
            const btnTxt = "Finish Day " + day

            console.log("6. Updating last message")
            us.updateField(id, "Last_Msg", hTxt)

            // setTimeout(() => {
            console.log("2. Delay of Finish Day")
            WA.sendText(`${hTxt} \n${bTxt}`, number)

            markDayComplete(number).then().catch(e => console.log("Mark day error 1 : ", e))
            // WA.sendInteractiveButtonsMessage(hTxt, bTxt, btnTxt, number)
            if (course_tn == "Web 3") {
                setTimeout(() => {
                    WA.sendText(`Would you like another learner to join you? Invite your friends to take the course! 
                
https://bit.ly/Web3_Referral`, number)
                }, 5000)
            }
            else if (course_tn == "Financial Literacy") {
                setTimeout(() => {
                    WA.sendText(`Would you like another learner to join you? Invite your friends to take the course! 
                
https://bit.ly/Financial_Literacy_Referral`, number)
                }, 5000)
            }


        }



    })
}

async function sendList(currentDay, module_No, number) {
    try {
      const course_tn = await us.findTable(number);
      const id = await us.getID(number);
  
      const records = await course_base(course_tn).select({
        filterByFormula: `({Day} = ${currentDay})`,
        view: 'Grid view',
      }).all();
  
      for (const record of records) {
        const module_title = record.get(`Module ${module_No} LTitle`);
        const module_list = record.get(`Module ${module_No} List`);
        const last_msg = record.get('Last_Msg');
  
        console.log('Executing List');
        const options = module_list.split('\n').filter(Boolean);
        const d = options.map((row) => ({ title: row }));
  
        console.log('Updating Last_Msg');
        if (last_msg !== 'Incorrect') {
          await us.updateField(id, 'Last_Msg', module_title);
        }
  
        WA.sendListInteractive(d, module_title, 'Options', number);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
  

async function sendIMsg(currentDay, module_No, number) {
    try {
      const course_tn = await us.findTable(number);
      const records = await course_base(course_tn).select({
        filterByFormula: `({Day} = ${currentDay})`,
        view: 'Grid view',
      }).all();
  
      for (const record of records) {
        const module_body = record.get(`Module ${module_No} iBody`);
        const module_buttons = record.get(`Module ${module_No} iButtons`);
        const id = await us.getID(number);
  
        if (module_body !== undefined) {
          const options = module_buttons.split('\n').filter(Boolean);
          const data = options.map((row) => ({ text: row }));
  
          us.updateField(id, 'Last_Msg', module_body);
  
          const delay = currentDay === 6 && module_No === 1 ? 10000 : 5000;
          setTimeout(() => {
            WA.sendDynamicInteractiveMsg(data, module_body, number);
          }, delay);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
  

async function sendTimeIMsg(number) {

    console.log("Executing Time Interactive ")
    options = ["30 minutes", "1 hour", "2 hour"]

    let data = []
    for (const row of options) {
        data.push({
            text: row
        })
    }

    setTimeout(() => {
        WA.sendDynamicInteractiveMsg(data, "When would you like to be reminded again?", number)
        //180000
    }, 1)

}

async function waitTime(time, number) {
    time = time.split(" ")
    let wait_time = time[0]
    let id = await us.getID(number).then().catch(e => console.log(e))

    console.log("Time value ", wait_time, time)
    if (time[1] == "minutes") {
        wait_time = (wait_time * 60000)

    }
    else {
        wait_time = (wait_time * 3600000)
    }
    console.log("Time after conversion ", wait_time)
    await us.updateField(id, "Last_Msg", "Alright, see you then!")
    WA.sendText("Alright, see you then!", number)
    options = ["Start now", "Remind me later"]

    let data = []
    for (const row of options) {
        data.push({
            text: row
        })
    }

    setTimeout(() => {
        console.log("Executing after ", time)
        WA.sendDynamicInteractiveMsg(data, "Would you like to continue now?", number)
    }, wait_time)


}

async function sendQues(currentDay, module_No, number) {
    try {
        const course_tn = await us.findTable(number);
        const id = await us.getID(number);

        const records = await course_base(course_tn).select({
            filterByFormula: `({Day} = ${currentDay})`,
            view: "Grid view",
        }).all();

        for (const record of records) {
            const module_ques = record.get(`Module ${module_No} Question`);
            if (module_ques) {
                console.log("test:320 - Executing Question");

                await us.updateField(id, "Last_Msg", "Q: " + module_ques);

                setTimeout(() => {
                    WA.sendText(module_ques, number);
                }, 2000);

                setTimeout(() => {
                    WA.sendText("⬇⁣", number);
                }, 3000);
            } else {
                console.log(`test:332 - No question found for Module ${module_No}`);
            }
        }
    } catch (error) {
        console.error("Error in sendQues:", error);
    }
}


// store_responses(918779171731, "No")
async function store_responses(number, value) {
    let course_tn = await us.findTable(number)
    // console.log(value)
    const records = await base_student("Student").select({
        filterByFormula: "({Phone} =" + number + ")",
        view: "Grid view",

    }).all(
    ); records.forEach(async function (record) {

        let id = record.id
        let currentModule = record.get("Next Module")
        let currentDay = record.get("Next Day")
        let last_msg = await us.findLastMsg(number).then().catch(e => console.log("last msg error " + e))
        let list_title = await us.find_ContentField("LTitle", currentDay, currentModule, number)
        let feedback = ["I am not sure", "No, I do not", "Some parts are confusing", "Yes, I do"]


        if (last_msg == "Do you feel like you learnt something today?" ||
            last_msg == "Did you find this module interesting or informative?"
        ) {
            console.log("currentDay ", currentDay)
            for (i = 0; i < feedback.length; i++) {
                if (value == feedback[i]) {
                    console.log("Matched ", feedback[i], value)
                    let score = 0
                    switch (value) {
                        case "I am not sure":
                            score = 1
                            break
                        case "No, I do not":
                            score = 2
                            break
                        case "Some parts are confusing":
                            score = 3
                            break
                        case "Yes, I do":
                            score = 4
                            break

                    }
                    let existingValues = await us.findField("Feedback", number)
                    console.log("existingValues ", existingValues)

                    if (existingValues == 0) {
                        existingValues = ""
                        newValues = `Day ${currentDay} - ${score}`
                    }
                    else {
                        newValues = `${existingValues} \n\nDay ${currentDay} - ${score}`
                    }


                    if (existingValues.includes(`Day ${currentDay} -`)) {
                        console.log("1.1  User Feedback already recorded")
                        await findContent(currentDay, currentModule, number)
                    }

                    else {
                        us.updateField(id, "Feedback", newValues).then(async () => {
                            console.log("1.2  New User Feedback recorded")
                            await findContent(currentDay, currentModule, number)

                            console.log("1. Updating in list feedback")
                            await us.updateField(id, "Last_Msg", list_title[0])
                        })
                    }
                    break
                }
                else {
                    console.log("Not Matched ", feedback[i], value)
                }

            }
        }
        else {
            let correct_ans = await us.findAns(currentDay, currentModule, number).then().catch(e => console.log("Error in findAns ", e))
            console.log("Correct ans ", correct_ans)

            // let existingValues = await us.findRecord(id)

            let existingValues = await us.findField("Question Responses", number).then().catch(e => console.error(e))
            console.log("existingValues ", existingValues)

            let list = await us.findTitle(currentDay, currentModule, number).then().catch(e => console.error(e))

            let title = list[0]
            let options = list.filter((v, i) => i !== 0)
            console.log("Title ", title, last_msg)

            // await us.updateField(id, "Last_Msg", title).then().catch(e => console.error("update 1.e ", e))

            if (correct_ans == value || last_msg == "Incorrect") {
                // console.log(last_msg == "Incorrect")

                // if (correct_ans == value) {
                // await us.updateField(id, "Last_Msg", title).then().catch(e => console.error("update 1.e ", e))
                // // }


                switch (last_msg) {
                    case title:
                        switch (course_tn) {
                            case "Financial Literacy":

                            case "Web 3":
                                let items = ['Congratulations! You got it right. 🥳',
                                    'That’s the correct answer. Yay! 🎉',
                                    'Awesome! Your answer is correct. 🎊',
                                    'Hey, good job! That’s the right answer Woohoo! 🤩',
                                    'Well done! The answer you have chosen is correct. 🎖️'];

                                let item = items[Math.floor(Math.random() * items.length)];

                                WA.sendText(item, number)
                                break;

                        }

                        console.log(`${title} 1st attempt correct`)
                        if (title.includes(last_msg) || last_msg == title) {

                            for (i = 0; i < options[0].length; i++) {
                                if (options[0][i] == value) {

                                    if (existingValues == 0) {
                                        existingValues = ""
                                        newValues = `Q: ${title} \nA: ${value}`
                                    }
                                    else {
                                        newValues = `${existingValues} \n\nQ: ${title} \nA: ${value}`
                                    }
                                    // console.log("existingValues ", existingValues)
                                    if (existingValues.includes(title)) {
                                        console.log("2.1 List Feedback already recorded")
                                        await findContent(currentDay, currentModule, number)
                                    }

                                    else {
                                        us.updateField(id, "Question Responses", newValues).then(async () => {
                                            console.log("2.2 List New Feedback recorded")
                                            await findContent(currentDay, currentModule, number)

                                            console.log("1. Updating")
                                            await us.updateField(id, "Last_Msg", title)
                                        })
                                    }
                                }
                            }
                        }
                        else {
                            console.log("Feedback already stored")
                        }
                        break

                    case "Incorrect":
                        switch (course_tn) {
                            case 'Financial Literacy':
                                console.log("correct_ans == value ", correct_ans == value, correct_ans, value)
                                if (correct_ans == value) {
                                    console.log("correct_ans == value ", correct_ans == value)
                                    let items = ['Congratulations! You got it right. 🥳',
                                        'That’s the correct answer. Yay! 🎉',
                                        'Awesome! Your answer is correct. 🎊',
                                        'Hey, good job! That’s the right answer Woohoo! 🤩',
                                        'Well done! The answer you have chosen is correct. 🎖️'];

                                    let item = items[Math.floor(Math.random() * items.length)];

                                    WA.sendText(item, number)
                                    // break;
                                }
                                else {
                                    WA.sendText(`The correct answer is *${correct_ans}*`, number)
                                    // break;
                                }
                                break;
                            case "Web 3":
                                console.log("correct_ans == value ", correct_ans == value, correct_ans, value)
                                if (correct_ans == value) {
                                    console.log("correct_ans == value ", correct_ans == value)
                                    let items = ['Congratulations! You got it right. 🥳',
                                        'That’s the correct answer. Yay! 🎉',
                                        'Awesome! Your answer is correct. 🎊',
                                        'Hey, good job! That’s the right answer Woohoo! 🤩',
                                        'Well done! The answer you have chosen is correct. 🎖️'];

                                    let item = items[Math.floor(Math.random() * items.length)];

                                    WA.sendText(item, number)
                                    // break;
                                }
                                else {
                                    WA.sendText(`The correct answer is *${correct_ans}*`, number)
                                    // break;
                                }
                                break;

                        }
                        // console.log(options, value, options[0][i], value)
                        for (i = 0; i < options[0].length; i++) {
                            if (options[0][i] == value) {
                                // console.log(options[0][i], value)

                                if (existingValues == 0) {
                                    existingValues = ""
                                    newValues = `Q: ${title} \nA: ${value}`
                                }
                                else {
                                    newValues = `${existingValues} \n\nQ: ${title} \nA: ${value}`
                                }
                                console.log("existingValues ", existingValues)
                                if (existingValues.includes(title)) {
                                    console.log("2.1 List Feedback already recorded")
                                    await findContent(currentDay, currentModule, number)
                                }
                                else {
                                    us.updateField(id, "Question Responses", newValues).then(async () => {
                                        console.log("2.2 List New Feedback recorded")
                                        await findContent(currentDay, currentModule, number)

                                        console.log("1. Updating")
                                        await us.updateField(id, "Last_Msg", title)

                                    })
                                }
                            }
                        }
                        break
                }
            }
            else {
                // switch (course_tn) {

                //     case "Web 3":
                for (i = 0; i < options[0].length; i++) {
                    if (options[0][i] == value) {
                        WA.sendText("You've entered the wrong answer. Let's try one more time. \n\nSelect the correct option from the list again.", number)
                        await us.updateField(id, "Last_Msg", "Incorrect")
                        // break;

                    }
                }

            }
            // await us.updateField(id, "Last_Msg", "Incorrect")



        }
    })
}

async function store_intResponse(number, value) {
    let course_tn = await us.findTable(number)

    const records = await base_student("Student").select({
        filterByFormula: "({Phone} =" + number + ")",
        view: "Grid view",

    }).all(
    ); records.forEach(async function (record) {

        let id = record.id
        let module_complete = record.get("Module Completed")
        let currentModule = record.get("Next Module")
        let currentDay = record.get("Next Day")
        let last_msg = record.get("Last_Msg")


        let existingValues = await us.findField("Interactive_Responses", number).then().catch(e => console.log("e2", e))
        // let existingValues = await us.findField("Videos Watched", number)

        let list = await us.findInteractive(currentDay, currentModule, number).then().catch(e => console.error(e))

        // let title = await us.findTitle(currentDay, currentModule, number).then().catch(e => console.error(e))
        // if (title != undefined) {
        let title = ""
        if (list != undefined) {
            title = list[0]
            console.log(title)



            // let title = list[0]
            let options = list.filter((v, i) => i !== 0)

            console.log("Value ", value)
            console.log("Last Msg = ", existingValues)
            console.log()

            for (i = 0; i < options[0].length; i++) {
                if (options[0][i] == value) {
                    if (existingValues == 0) {
                        // console.log("existingValues", existingValues)
                        existingValues = ""
                        newValues = title + "\n" + value

                    }
                    else {
                        newValues = existingValues + "\n\n" + title + value
                    }

                    if (existingValues.includes(title)) {
                        console.log("Interactive Feedback already recorded")
                        await find_IntContent(currentDay, currentModule, number)
                    }
                    else {
                        us.updateField(id, "Interactive_Responses", newValues).then(async () => {
                            console.log("New Interactive Feedback recorded")
                            await find_IntContent(currentDay, currentModule, number)

                        })
                    }
                    break

                }
            }
        }
        else {
            console.log("List empty")
        }

    })
}

async function store_quesResponse(number, value) {
    //let course_tn = await us.findTable(number)

    const records = await base_student("Student").select({
        filterByFormula: "({Phone} =" + number + ")",
        view: "Grid view",

    }).all(
    ); records.forEach(async function (record) {
        let id = record.id
        let currentModule = record.get("Next Module")
        let currentDay = record.get("Next Day")
        let last_msg = record.get("Last_Msg")

        if (currentModule != undefined) {
            let ques = await us.findQuestion(currentDay, currentModule, number).then().catch(e => console.error("Error in store_quesResponse ", e))

            // let last_msg = await WA.getMessages(number, 2)
            // let scnd_last = await WA.getMessages(number, 3)

            last_msg = last_msg.replace("Q: ", "")
            console.log("Last msg and question in store_quesResponse ", last_msg, ques)

            if (last_msg == ques) {

                ques = ques.replace("\n\nShare your thoughts!", " ")

                let existingValues = await us.findQuesRecord(id)

                console.log("ques -  ", ques,)

                if (ques != undefined) {
                    if (existingValues == undefined) {
                        console.log("existingValues", existingValues)

                        existingValues = ""
                        newValues = `Q: ${ques} \nA: ${value}`
                        // newValues = ques + "\n" + value

                    }
                    else {
                        console.log("existingValues")
                        // newValues = existingValues + "\n\n" + ques + value
                        newValues = `${existingValues} \n\nQ: ${ques} \nA: ${value}`

                    }

                    if (existingValues.includes(ques)) {

                        console.log("third_last", last_msg)
                        last_msg = last_msg

                        last_msg = last_msg.replace("\n\nShare your thoughts!", " ")

                        console.log(last_msg == ques)

                        // let prev_msg = await WA.getMessages(number, 1)

                        if (last_msg == ques) {


                            try {
                                console.log("1.1.2 Feedback already recorded")
                                await find_QContent(currentDay, currentModule, number).then().catch(e => console.log("Error 1.1.2 Feedback ", e))
                            }
                            catch (e) {
                                console.log("Caught Error 1.1.2 Feedback ", e)
                            }

                        }

                        else {
                            console.log("1.2 Feedback already recorded")
                            await find_QContent(currentDay, currentModule, number)
                        }
                    }
                    else {
                        us.updateField(id, "Responses", newValues).then(async () => {
                            console.log("3. New Feedback recorded")
                            await find_QContent(currentDay, currentModule, number)


                        })
                    }

                }
            }
            else {
                console.log("No ques")
            }


        }
    })
}

async function findContent(currentDay, module_No, number) {
    let course_tn = await us.findTable(number)
    let id = await us.getID(number).then().catch(e => console.log(e))

    const records = await course_base(course_tn).select({
        filterByFormula: "({Day} =" + currentDay + ")",
        view: "Grid view",

    }).all(
    );
    records.forEach(async function (record) {

        setTimeout(async () => {
            for (let i = module_No + 1; i <= 9; i++) {
                let module_text = record.get("Module " + i + " Text")
                let module_list = record.get("Module " + i + " LTitle")
                console.log("1. After ", i)
                if (module_text == undefined && !module_list) {
                    console.log(module_text, module_list)
                    if (i >= 9) {
                        await markModuleComplete_v2(i, number).then().catch(error => console.log("v2 ", error))
                    }

                }
                else {
                    const hTxt = `Let's move forward!`
                    const bTxt = `Click Next!`
                    const btnTxt = "Yes, Next"
                    setTimeout(() => {
                        console.log("2. Delay of Finish Interactive Button - find_QContent")
                        us.updateField(id, "Last_Msg", btnTxt)
                        WA.sendInteractiveButtonsMessage(hTxt, bTxt, btnTxt, number)
                    }, 1000)
                    break

                }

            }
        }, 500)


    })
}

async function find_IntContent(currentDay, module_No, number) {
    let course_tn = await us.findTable(number)
    const records = await course_base(course_tn).select({
        filterByFormula: "({Day} =" + currentDay + ")",
        view: "Grid view",

    }).all(
    );
    records.forEach(async function (record) {
        let module_title = record.get("Module " + module_No + " LTitle")
        let id = await us.getID(number).then().catch(e => console.log(e))

        console.log(module_title)

        if (module_title != undefined) {
            console.log("List not empty in findContent")
            await sendList(currentDay, module_No, number)

        }
        else {
            setTimeout(async () => {
                for (let i = module_No + 1; i <= 7; i++) {
                    let module_text = record.get("Module " + i + " Text")
                    let module_list = record.get("Module " + i + " LTitle")
                    console.log("2. After ", i)
                    if (module_text == undefined && !module_list) {
                        console.log(module_text, module_list)
                        if (i >= 5) {
                            await markModuleComplete_v2(i, number).then().catch(error => console.log("v2 ", error))
                        }

                    }
                    else {
                        const hTxt = `Let's move forward!`
                        const bTxt = ` `
                        const btnTxt = "Yes, Next"
                        // setTimeout(() => {
                        console.log("2. Delay of Finish Interactive Button - find_QContent")
                        us.updateField(id, "Last_Msg", btnTxt)
                        WA.sendInteractiveButtonsMessage(hTxt, bTxt, btnTxt, number)
                        // }, 1000)
                        break

                    }

                }
            }, 500)
        }
        // }
        // }

    })
}

async function find_QContent(currentDay, module_No, number) {
    let course_tn = await us.findTable(number)

    const records = await course_base(course_tn).select({
        filterByFormula: "({Day} =" + currentDay + ")",
        view: "Grid view",

    }).all(
    );
    records.forEach(async function (record) {
        let data = ""

        let day = record.get("Day")
        let module_link = record.get("Module " + module_No + " Link")
        let nm = module_No + 1

        let id = await us.getID(number).then().catch(e => console.log(e))

        console.log(module_No)
        let interactive_body = record.get("Module " + nm + " iBody")
        // console.log("module_No ", interactive_body)


        if (!!module_link) {
            console.log("Module link not empty ")

            setTimeout(() => {
                data = module_link

                WA.sendText(data, number)
            }, 2000)


            //     // 
        }

        console.log("Before ", module_No)
        if (interactive_body) {

            //await markModuleComplete_v2(module_No, number).then().catch(error => console.log("v2 ", error))
            us.updateField(id, "Next Module", nm)
            us.updateField(id, "Module Completed", module_No)
            await sendIMsg(currentDay, nm, number)
        }
        else {
            setTimeout(async () => {
                for (let i = module_No + 1; i <= 7; i++) {
                    let module_text = record.get("Module " + i + " Text")
                    console.log("3. After ", i)
                    let module_list = record.get("Module " + i + " LTitle")


                    if (module_text == undefined && !module_list) {

                        console.log(module_text)


                        if (i >= 5) {
                            await markModuleComplete_v2(i, number).then().catch(error => console.log("v2 ", error))
                        }

                    }
                    else {

                        if (course_tn == "WomenWill Hindi") {
                            setTimeout(async () => {

                                const hTxt = `चलो आगे बढ़ते हैं!`
                                const bTxt = `नेक्स्ट पर क्लिक करें`
                                const btnTxt = "नेक्स्ट"
                                // setTimeout(() => {
                                console.log("3. Delay of Finish Interactive Button - find_QContent")
                                us.updateField(id, "Last_Msg", btnTxt)
                                WA.sendInteractiveButtonsMessage(hTxt, bTxt, btnTxt, number)
                                // }, 1000)


                            }, 500)
                        }
                        else {
                            const hTxt = `Let's move forward!`
                            const bTxt = ``
                            const btnTxt = "Yes, Next"

                            setTimeout(() => {
                                console.log("1. Delay of Finish Interactive Button - find_QContent")
                                us.updateField(id, "Last_Msg", btnTxt)
                                WA.sendInteractiveButtonsMessage(hTxt, bTxt, btnTxt, number)
                            }, 1000)
                            break
                        }
                    }

                }
            }, 3000)
        }

    })
}
//Find modules

async function findModule(currentDay, module_No, number) {
    try {
        const course_tn = await us.findTable(number);
        console.log("test:966 findModule - ", course_tn);

        const records = await course_base(course_tn).select({
            filterByFormula: `({Day} = ${currentDay})`,
            view: "Grid view",
        }).all();

        for (const record of records) {
            const id = await us.getID(number);
            console.log("test:975 record - ", record);

            const day = record.get("Day");
            const module_text = record.get(`Module ${module_No} Text`);
            const module_title = record.get(`Module ${module_No} LTitle`);
            const module_link = record.get(`Module ${module_No} Link`);
            const module_next_msg = record.get(`Module ${module_No} next`);
            const interactive_body = record.get(`Module ${module_No} iBody`);
            const module_ques = record.get(`Module ${module_No} Question`);

            const module_split = module_text ? module_text.split("#") : [];
            console.log("test: 983 - Executing FindModule - module_split ", module_split);

            if (!module_text && module_ques) {
                console.log("Ques not empty - Module Text Empty");

                setTimeout(() => {
                    console.log("test:989 - 4. Delay of media in Ques not empty - Module Text Empty");
                    sendContent.sendMediaFile(day, module_No, number);
                }, 100);

                await sendQues(currentDay, module_No, number);

            } else if (interactive_body && module_text) {
                console.log("test:996 - 1. Module Split- data - ", module_text);
                await sendSplitMessages(module_split, 0, day, module_No, number);

                if (module_link) {
                    setTimeout(() => {
                        WA.sendText(module_link, number);
                    }, 2000);
                }

                await us.updateField(id, "Last_Msg", module_text);
                await sendIMsg(currentDay, module_No, number);

            } else if (module_title && !module_text) {
                console.log("test:1009 - module_title && !module_text");
                await sendList(currentDay, module_No, number);

            } else if (interactive_body && !module_text) {
                console.log("test:1013 - Delay of media in not empty link - interactive not empty");
                sendContent.sendMediaFile(day, module_No, number);
                await sendIMsg(currentDay, module_No, number);

            } else if (module_text && !module_title) {
                console.log("test:1018 - module_text && !module_title");

                if (interactive_body) {
                    setTimeout(() => {
                        console.log("test:1022 - 2. Delay of media in not empty link ");
                        sendContent.sendMediaFile(day, module_No, number);
                    }, 10000);

                    await sendIMsg(currentDay, module_No, number);
                }

                if (module_link) {
                    await sendSplitMessages(module_split, 0, day, module_No, number);

                    await us.updateField(id, "Last_Msg", module_text);
                    setTimeout(() => {
                        console.log("3. Delay of link ");
                        WA.sendText(module_link, number);
                    }, 2500);

                    for (let i = module_No + 1; i <= 7; i++) {
                        const next_module_text = record.get(`Module ${i} Text`);
                        const next_module_list = record.get(`Module ${i} LTitle`);
                        console.log("4. After ", i, "module_text ", next_module_text);

                        if (!next_module_text && !next_module_list) {
                            if (i >= 5) {
                                await markModuleComplete_v2(i, number);
                            }
                        } else {
                            setTimeout(() => {
                                console.log("2. Delay of Finish Interactive Button - Module");
                                WA.sendInteractiveButtonsMessage("Let's move on!", "Click Next", "Yes, Next", number);
                            }, 1000);
                            break;
                        }
                    }
                } else {
                    await sendSplitMessages(module_split, 0, day, module_No, number);
                    await us.updateField(id, "Last_Msg", module_text);

                    if (module_ques) {
                        setTimeout(async () => {
                            await sendQues(currentDay, module_No, number);
                        }, 10000);
                    } else {
                        let next_m = module_No + 1;
                        let next_module_ques = record.get(`Module ${next_m} Question`);
                        let next_module_text = record.get(`Module ${next_m} Text`);

                        if (next_module_ques && !next_module_text) {
                            us.updateField(id, "Next Module", module_No + 1);
                            us.updateField(id, "Module Completed", module_No);

                            setTimeout(async () => {
                                await sendQues(currentDay, module_No + 1, number);
                            }, 10000);

                        } else {
                            for (let i = module_No + 1; i <= 9; i++) {
                                let next_module_text = record.get(`Module ${i} Text`);
                                let next_module_list = record.get(`Module ${i} LTitle`);
                                console.log("test:1081 - 5. After ", i);

                                if (!next_module_text && !next_module_list) {
                                    if (i >= 7) {
                                        await markModuleComplete_v2(i, number);
                                    }
                                } else {
                                    setTimeout(() => {
                                        console.log("test:1059 - 2. Delay of Finish Interactive Button - FindModule");
                                        WA.sendInteractiveButtonsMessage("Let's move on!", "Click Next", "Yes, Next", number);
                                    }, 1000);
                                    break;
                                }
                            }
                        }
                    }
                }
            } else if (module_text && module_title) {
                await us.updateField(id, "Last_Msg", module_text);
                await sendSplitMessages(module_split, 0, day, module_No, number);

                setTimeout(async () => {
                    await sendList(currentDay, module_No, number);
                }, 25000);
            } else {
                await markModuleComplete(number);
            }
        }
    } catch (error) {
        console.error("Error in findModule:", error);
    }
}


async function sendSplitMessages(module_split, startIndex, day, module_No, number) {
    const awaitTimeout = delay => new Promise(resolve => setTimeout(resolve, delay));

    console.log("test:1391 - module_split --", module_split, "\n", "module_len - ", module_split.length);

    for (let i = startIndex; i < module_split.length; i++) {
        try {
            console.log("test: 1125 - 4. module split ", i);

            if (i == 0) {
                // Send the first message without delay
                await WA.sendText(module_split[i], number);
            } else {
                if (module_split[i].includes("Image")) {
                    console.log("4.2 Delay of sendMediaFile Split");

                    let image_index = module_split[i].split(" ");
                    console.log("Image Index ", Number(image_index[1]));

                    await awaitTimeout(200);
                    await sendContent.sendMediaFile_v2(Number(image_index[1]), day, module_No, number);
                } else if (module_split[i].includes("Next Step")) {
                    console.log("Next step interactive", i);

                    await awaitTimeout(400);
                    await WA.sendDynamicInteractiveMsg([{ text: "Next Step" }], "Let's go to the next step. We're ready when you are.", number);
                } else {
                    await awaitTimeout(800);
                    await WA.sendText(module_split[i], number);
                }
            }

        } catch (e) {
            console.log("Error sending text ", e);
        }
    }
}


//Find Module No in students table and send it
async function sendModuleContent(number) {
    try {
        const records_Student = await base('Student').select({
            filterByFormula: "({Phone} =" + number + ")",
            maxRecords: 1,
            view: "Grid view",
        }).all();

        for (const record of records_Student) {
            let cDay = record.get("Next Day");
            let next_module = record.get("Next Module");
            let completed_module = record.get("Module Completed");

            if (next_module !== undefined) {
                if (cDay == 13) {
                    console.log("Executing outro sendModuleContent");
                    await outro.outro_flow(cDay, number); // phone number
                } else if (next_module === 0) {
                    console.log("test:1446 - Next module 0", next_module);
                    await findDay(cDay, number);
                } else {
                    if (completed_module === 0 && next_module === 1) {
                        console.log(`test:1450 - Starting Day ${cDay} for number ${number}`);
                        await sendStartDayTopic(next_module, cDay, number);
                    } else {
                        console.log("Next module No", next_module);
                        await findModule(cDay, next_module, number);
                    }
                }
            }
        }
    } catch (error) {
        console.error("Error in sendModuleContent:", error);
    }
}


async function sendStartDayTopic(next_module, cDay, number) {
    try {
        const course_tn = await us.findTable(number);
        console.log("course sendStartDayTopic", course_tn);

        const id = await us.getID(number);
        if (!id) {
            console.error("ID not found for number:", number);
            return;
        }

        const records = await course_base(course_tn).select({
            filterByFormula: `({Day} = ${cDay})`,
            view: "Grid view",
        }).all();

        for (const record of records) {
            const day_topic = record.get("Day Topic");
            console.log("test : 1180 - ", day_topic);

            if (day_topic) {
                const [hTxt, bTxt] = day_topic.split("--");
                console.log("test: 1184 - 0. Updating start day");

                await WA.sendInteractiveButtonsMessage(hTxt, bTxt, `Let's Begin`, number);
                await us.updateField(id, "Last_Msg", "Let's Begin");
            } else {
                await findModule(cDay, next_module, number);
            }
        }
    } catch (error) {
        console.error("Error in sendStartDayTopic:", error);
    }
}


async function markModuleComplete(number) {
    try {
      const records_Student = await base('Student').select({
        filterByFormula: `({Phone} = ${number})`,
        view: 'Grid view',
      }).all();
  
      for (const record of records_Student) {
        const id = record.id;
        const current_module = Number(record.get('Next Module'));
        const cDay = Number(record.get('Next Day'));
  
        const next_module = current_module + 1;
        console.log(`test:1211 - Entered markModuleComplete: Next Module ${next_module}, Current Module ${current_module}`);
  
        if (next_module >= 9) {
          console.log('Updating Module Completed and Next Module');
          await us.updateField(id, 'Module Completed', current_module);
          await us.updateField(id, 'Next Module', 0);
          findDay(cDay, number);
        } else {
          console.log('Updating Next Module and Module Completed');
          await us.updateField(id, 'Next Module', next_module);
          await us.updateField(id, 'Module Completed', current_module);
          findModule(cDay, next_module, number);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
}


async function markModuleComplete_v2(c_m, number) {
    const records_Student = await base('Student').select({
        filterByFormula: "({Phone} =" + number + ")",
        view: "Grid view",

    }).all();
    records_Student.forEach(async function (record) {
        let id = record.id
        let current_module = c_m //1 
        console.log("Entered markModuleComplete v2 ", c_m, current_module)

        // let completed_mNo = Number(record.get("Module Completed"))//0
        let cDay = Number(record.get("Next Day"))

        let next_module = current_module + 1 // 1+1 = 1

        if (next_module >= 4) {
            console.log("Module ", next_module)
            if (c_m == 9) {
                console.log("Updating 1.1 ", next_module, current_module)

                us.updateField(id, "Module Completed", current_module)

                us.updateField(id, "Next Module", 0)
                findDay(cDay, number);
            }
            else {
                console.log("Updating 1.2 ", next_module, current_module)

                us.updateField(id, "Module Completed", current_module)

                us.updateField(id, "Next Module", 0)
            }



        }

        else {
            console.log("Updating 2 ", next_module, current_module)
            us.updateField(id, "Next Module", next_module)
            us.updateField(id, "Module Completed", current_module)

            findModule(cDay, next_module, number)


        }

    });
}

module.exports = { markDayComplete, sendModuleContent, markModuleComplete, store_responses, store_intResponse, store_quesResponse, sendList, findModule, sendTimeIMsg, waitTime }
