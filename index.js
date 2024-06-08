require('dotenv').config("./env");
const airtable = require('./airtable_methods')
const WA = require('./wati')
// https://openai-wa.onrender.com/qna
const OpenAI = require("openai");
const configuration = {
    apiKey: process.env.OPENAI_API_KEY,
    organization: process.env.OPENAI_ORG_KEY
};
const openai = new OpenAI(configuration);


async function ask(course_name, language) {
    console.log("1. Asking question ", course_name, language)

    let question = ` Write a 3 day lesson plan on the topic ${course_name} in 70 words, each day should be divided into 3 modules and each module should have 1 topic. 

Strictly follow and create a valid JSON as given below in English language .
{
"Introduction":[""],
"Day 1":["Day 1 - Module 1 : Topic","Day 1 - Module 2 : Topic","Day 1 - Module 3 : Topic"],
"Day 2":["Day 2 - Module 1 : Topic","Day 2 - Module 2 : Topic","Day 2 - Module 3 : Topic"],
"Day 3":["Day 3 - Module 1 : Topic","Day 3 - Module 2 : Topic","Day 3 - Module 3 : Topic"],
"Assessment":[""],
Conclusion:[""]
}
`
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages:
                [{ "role": "system", "content": "You are a subject matter expert." },
                { "role": "user", "content": question }

                ],
            temperature: 0.2
        });
        console.log("index.js : 38 completed asking" )
        return completion.choices[0].message.content


    } catch (error) {
        console.log("Error in asking question ", error)
        return "Error in asking question"
    }
}

/////////////////////////////////////////////////////////////////////////////////


async function create_table_fields(course_name, module_number) {
    console.log("1. Creating table ", course_name)
    airtable_fields = []

    day_field = {
        "name": "Day",
        "type": 'number',
        "options": {
            'precision': 0,
        }
    }
    airtable_fields.push(day_field)

    for (i = 1; i <= module_number; i++) {
        // console.log(i)
        field_module_topic = {

            "name": "Module " + i + " Text",
            "type": 'multilineText'

        }
        airtable_fields.push(field_module_topic)
    }
    // airtable_fields.push(field_module_topic)
    console.log("airtable_fields ", airtable_fields)
    let table_id = await airtable.createTable(course_name, airtable_fields)
    console.log("index:80 Created_table", "Table id ", table_id)

    return table_id

    // if (table_id['error']?.['type'] === 'DUPLICATE_TABLE_NAME' || table_id['error']) { 
    //     table_id = airtable.createTable(course_name, airtable_fields)
    //
}


async function iterate_through_module(course_outline, goal, style, language) {
    console.log("index:89 -  0. Iterating through module ");
    course_outline = JSON.parse(course_outline);
    console.log("1. Iterating through module ", course_outline);

    let module_details_dict = {};
    let day_count = 1;
    try {
        for (const key in course_outline) {
            const value = course_outline[key];
            let module_details_day_count = [];

            if (key.startsWith("Day")) {
                const modules = value;
                console.log("module  - ",modules, " -- ", key );
                for (let i=0 ; i<3 ;i++) {
                    // let module = modules[moduleKey];
                    let module = String(modules[i]);
                    console.log("module  - ",module );
                    let parts = module.split(":");
                    let module_topic = parts[1].trim();
                    // let module_topic = module.split(":")[1].trim();
                    console.log(`Module Topic - ${module_topic} ${language}`);
                    let module_content = await module_gen(module_topic, goal, style, language).then().catch(e => console.error("iterate_through_module Error " + e));
                    console.log(`${module_topic}\n\n ${module_content}`);
                    module_details_day_count.push(module_content);
                }
                module_details_dict[key] = module_details_day_count;
                console.log( "Increasing day count");
                day_count++;
            }
        }
        console.log("2", module_details_dict);
        console.log( "index -120 : done iterating and askings")
        return module_details_dict;
    }
    catch (e) {
        console.log("iterate_through_module error", e);
        return "iterate_through_module error";
    }
}





async function generate_course(senderID, course_name, goal, style, language) {

    let table_id = await create_table_fields(course_name, 3).then().catch(e => console.error("generate course error " + e));

    console.log("Index:150 -  ","Table ID", table_id)


    if (table_id['error']?.['type'] === 'DUPLICATE_TABLE_NAME') {
        console.log(course_name, "Table already exists")
        const randomNumber = Math.floor(Math.random() * 100) + 1;
        // table_id = course_name
        let getRecords = await airtable.ListCourseFields(course_name)
        if (getRecords.records?.length == 0) {
            console.log("table exists - No records found")
            table_update = await airtable.updateCourseTable(course_name, course_name + randomNumber).then().catch(e => console.error("generate course error " + e));

            if (table_update == 200) {

                console.log("table updated")
                table_id = await create_table_fields(course_name, 3).then().catch(e => console.error("generate course error " + e));

                if (typeof (table_id) === "string") {
                    let course_outline = await ask(course_name, language).then().catch(e => console.error("Course outline error " + e));

                    if (course_outline != "Error in asking question") {
                        let course_details = await iterate_through_module(course_outline, goal, style, language).then().catch(e => console.error("course_details error " + e));


                        if (course_details != "iterate_through_module error") {
                            let populate_field_status = await populate_fields(3, course_details, course_name, senderID).then().catch(e => console.error("populate_field_status error " + e));

                            if (populate_field_status == 200) {
                                console.log("Populate Field Status", populate_field_status)

                                return populate_field_status
                            }

                            else {
                                console.log("Error in Populating Fields", populate_field_status)
                                return populate_field_status
                            }
                        }
                    }
                }
            }
        }
        else {
            console.log("table exists - Records found")
            return 200
        }

        // airtable.updateCourseTable(course_name, 3)

    }
    else if (table_id['error']) {
        console.log("Error in creating table", table_id['error'])
        return 404
    }

    else if (typeof (table_id) === "string") {

        let course_outline = await ask(course_name, language).then().catch(e => console.error("Course outline error " + e));
        console.log('index.js : 208             ');

        if (course_outline != "Error in asking question") {
            let course_details = await iterate_through_module(course_outline, goal, style, language).then().catch(e => console.error("course_details error " + e));
            console.log("index : 199      ");

            if (course_details != "iterate_through_module error") {
                let populate_field_status = await populate_fields(3, course_details, course_name, senderID , table_id).then().catch(e => console.error("populate_field_status error " + e));

                if (populate_field_status == 200) {
                    console.log("Populate Field Status", populate_field_status)

                    return populate_field_status
                }

                else {
                    console.log("Error in Populating Fields", populate_field_status)
                    return populate_field_status
                }
            }
        }
    }
}

async function populate_fields(module_number, module_details, course_name, senderID, table_id) {
    console.log("3.1 Module Details", typeof (module_details))

    // module_details = module_details.rep("'", '"')
    if (module_details != undefined) {


        // console.log("3.2 Module Details", module_details)
        day_count = 1
        module_dict = []
        module_fields_arr = []

        // console.log("module_details - ", module_details);

        for (const key in module_details) {


            const value = module_details[key];

            for (i = 0; i < value.length; i++) {
                if (key == "Day " + day_count) {
                    console.log("Day " + day_count)
                    record_array =
                    {
                        "fields": {
                            "Day": day_count,
                            "Module 1 Text": module_details['Day ' + day_count][0],
                            "Module 2 Text": module_details['Day ' + day_count][1],
                            "Module 3 Text": module_details['Day ' + day_count][2]
                        },
                    }


                    module_dict.push(record_array)



                    day_count++
                }



            }
            console.log("module_dict - ", module_dict)

        }


        console.log("course_name - ",course_name );
        let create_status = await airtable.create_record(module_dict, table_id).then().catch(e => console.error("Error creating Day field " + e));

        return create_status
    }
    else {
        console.log("Module Details not found")
    }





}

async function module_gen(module_topic, goal, style, language) {
    console.log("Module Topic - ", module_topic, language)
    const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages:
            [{ "role": "system", "content": "You are a multilingual subject matter expert." },
            {
                "role": "user", "content": `Please generate engaging and concise content for the following module ${module_topic} in the language ${language}:
                
As an AI language model, you are here to assist the student in creating a microlearning module for ${module_topic} in language ${language}. The ${module_topic} will be tailored to meet the needs and preferences of a learner with the following profile:

Current Knowledge Level: ${style}
Learning Goals: ${goal}
Preferred Learning Style: ${style}
Language: ${language}

please incorporate appropriate emojis within the text, ensuring they are used sparingly and do not occur in every sentence, write under 70 words.
`
            }


            ],
        temperature: 0.2
    });

    return completion.choices[0].message.content


}

// Please generate engaging and concise content for the following module ${module_topic}:

// The content should be designed to meet the learner’s learning goals and align with their preferred learning style. To ensure the content remains light and engaging, please incorporate appropriate emojis within the text, ensuring they are used sparingly and do not occur in every sentence.`
module.exports = { generate_course }