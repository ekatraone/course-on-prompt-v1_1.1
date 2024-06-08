const WA = require('./wati');
const airtable = require("./airtable_methods");
require('dotenv').config();
let axios = require('axios');
let cop = require('./index');

let Airtable = require('airtable');

async function find_course_to_create() {

    let config = {
        method: 'GET',
        url : `https://api.airtable.com/v0/${process.env.alfred_base}/${process.env.alfred_table}?maxRecords=3&sort%5B0%5D%5Bfield%5D=Created&sort%5B0%5D%5Bdirection%5D=asc`,
        // url: `https://api.airtable.com/v0/${process.env.alfred_base}/${process.env.alfred_table}?fields%5B%5D=Phone&fields%5B%5D=Topic&fields%5B%5D=Course+Status&fields%5B%5D=Name&fields%5B%5D=Language&fields%5B%5D=Goal&fields%5B%5D=Style&filterByFormula=OR(%7BCourse+Status%7D+%3D+%22Approved%22%2C%7BCourse+Status%7D+%3D+%22Failed%22+)&maxRecords=1&sort%5B0%5D%5Bfield%5D=Created&sort%5B0%5D%5Bdirection%5D=asc`,
        headers: {
            'Authorization': `Bearer ${process.env.personal_access_token}`,
            'Content-Type': 'application/json',

        }

    };
    result = axios.request(config)
        .then((response) => {

            res = response.data
            return response.data.records

        })
        .catch((error) => {
            if (error.response) {
                console.log("Alfred Record Error", error.response.data);
                return error.response.data;
            } else {
                console.log("Network Error:", error.message);
                return { error: "Network Error" };
            }
        });        
    return result
}

async function course_approval() {
    let course_to_create = await find_course_to_create()
    // console.log(course_to_created.length == 0, course_to_created)
    for (let i = 0; i < course_to_create.length; i++){
    if (course_to_create.length != 0) {
        let id = course_to_create[i].id
        let phone = course_to_create[i].fields.Phone
        let topic = course_to_create[i].fields.Topic
        let name = course_to_create[i].fields.Name
        let goal = course_to_create[i].fields.Goal
        let style = course_to_create[i].fields.Style
        let language = course_to_create[i].fields.Language
        let course_status = course_to_create[i].fields["Course Status"]

        console.log(phone, topic, course_status, language, style, goal, name, id)

        let generate_course_status = await cop.generate_course(phone, topic, goal, style, language).then().catch(e => console.log("Generate course error " + e));
        if (generate_course_status == 200) {
            console.log("Course Generated");
            airtable.updateAlfredData(id, "Last_Msg", "course generated").then().catch(e => console.log("Update last msg error " + e));

            airtable.updateAlfredData(id, "Course Status", "Content Created").then().catch(e => console.log("Update last msg error " + e));


            let does_student_exist = await airtable.find_student_record(phone).then().catch(e => console.error("Error finding Student " + e));
            airtable.update_student_record(id)
            airtable.updateField(id, "Last_Msg", "Start Course").then().catch(e => console.log("Update student record error " + e))


        } else {
            console.log("Course Not Generated");
            airtable.updateAlfredData(id, "Course Status", "Failed").then().catch(e => console.log("Update last msg error " + e));
        }

    }
}

}
// test()

module.exports = {
    find_course_to_create,
    course_approval

}