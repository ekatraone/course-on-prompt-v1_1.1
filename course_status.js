const WA = require('./wati');
const airtable = require("./airtable_methods");
require('dotenv').config();
const axios = require('axios');
const cop = require('./index');
const Airtable = require('airtable');

/**
 * Fetches courses to create from Airtable.
 * @returns {Promise<Array>} - A promise that resolves to an array of course records.
 */
async function find_course_to_create() {
    const config = {
        method: 'GET',
        url: `https://api.airtable.com/v0/${process.env.alfred_base}/${process.env.alfred_table}?maxRecords=3&sort%5B0%5D%5Bfield%5D=Created&sort%5B0%5D%5Bdirection%5D=asc`,
        headers: {
            'Authorization': `Bearer ${process.env.personal_access_token}`,
            'Content-Type': 'application/json',
        },
    };

    try {
        const response = await axios.request(config);
        return response.data.records;
    } catch (error) {
        console.error("Error fetching course to create:", error.response ? error.response.data : error.message);
        return [];
    }
}

/**
 * Processes course approvals by generating courses and updating Airtable records.
 */
async function course_approval() {
    try {
        const coursesToCreate = await find_course_to_create();

        if (coursesToCreate.length === 0) {
            console.log("No courses to create.");
            return;
        }

        for (const course of coursesToCreate) {
            const { id, fields } = course;
            const { Phone: phone, Topic: topic, Name: name, Goal: goal, Style: style, Language: language, "Course Status": courseStatus } = fields;

            console.log(phone, topic, courseStatus, language, style, goal, name, id);

            try {
                const generateCourseStatus = await cop.generate_course(phone, topic, goal, style, language);

                if (generateCourseStatus === 200) {
                    console.log("Course Generated");
                    await Promise.all([
                        airtable.updateAlfredData(id, "Last_Msg", "course generated"),
                        airtable.updateAlfredData(id, "Course Status", "Content Created")
                    ]);

                    const studentExists = await airtable.find_student_record(phone);

                    if (studentExists) {
                        await Promise.all([
                            airtable.update_student_record(id),
                            airtable.updateField(id, "Last_Msg", "Start Course")
                        ]);
                    }
                } else {
                    console.log("Course Not Generated");
                    await airtable.updateAlfredData(id, "Course Status", "Failed");
                }
            } catch (error) {
                console.error("Error generating course:", error);
                await airtable.updateAlfredData(id, "Course Status", "Failed");
            }
        }
    } catch (error) {
        console.error("Error in course_approval:", error);
    }
}

module.exports = {
    find_course_to_create,
    course_approval
};
